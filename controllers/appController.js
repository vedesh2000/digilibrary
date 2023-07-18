const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { Book } = require("../models/book");
const sendEmail = require("./sendEmail")
const jwt = require('jsonwebtoken');
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

function checkPassword(inputtxt){
  var paswd=  /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/;
  if(inputtxt.match(paswd)) 
  { 
  return true;
  }
  return false;
}
exports.authGoogle_get = (req, res) => {
  // Redirect the user to the Google OAuth2 authentication URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
  });
  res.redirect(authUrl);
};

exports.authGoogle_callback = async (req, res) => {
  const code = req.query.code;

  try {
    // Exchange the authorization code for an access token
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Retrieve user information from the Google API
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();

    // Extract the username from the user's profile information
    const givenName = data.given_name;
    const familyName = data.family_name;
    const username = `${givenName} ${familyName}`;

    // Check if the user already exists in your database
    let user = await User.findOne({ email: data.email });

    if (!user) {
      // User does not exist, create a new user in the database
      const token = jwt.sign({email: email}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN});
      user = new User({
        googleId: data.id,
        email: data.email,
        username: username,
        createdAt: Date.now(),
        lastOpenedAt: Date.now(),
        confirmationCode: token,
        status: 'Active'
      });
      await user.save();
      console.log(username + "User Created Successfully");
    }

    else if(user.password && !user.googleId){
       // User exist, but google id is not in the database
      user.googleId= data.id;
      user.lastOpenedAt= Date.now()
      if(user.status === 'Pending')
        user.status= 'Active';
      await user.save();
    }

    
    req.session.isAuth = true;
    if (!req.cookies.theme) {
      // Set the theme cookie to "light" if it's not already set
      res.cookie("theme", "light");
    }
    req.session.email = user.email;
    // Redirect or respond with user data as needed
    res.redirect("/files"); // Redirect to the dashboard after successful authentication
  } catch (err) {
    console.log(err);
    req.session.error = "Error Creating User";
    return res.redirect("/signup");
  }
};

exports.landing_page = (req, res) => {
  res.render("welcome/welcome" ,{layout: false});
};
exports.login_get = (req, res) => {
  if(req.session.isAuth){
    return res.redirect("/files")
  }
  const error = req.session.error;
  delete req.session.error;
  const msg = req.session.msg;
  delete req.session.msg;
  let isPending = false;
  let resendEmail = ''
  if(req.session.isPending){
    isPending = req.session.isPending;
    delete req.session.isPending;
    resendEmail = req.session.email;
    delete req.session.email;
  }
  res.render("welcome/login", { layout: false ,err: error, msg: msg, isPending: isPending, resendEmail: resendEmail});
};
exports.login_post = async (req, res) => {
  const email = req.body.email.toLowerCase();
  const password = req.body.password;
  const user = await User.findOne({ email });
  if (password.length < 7) {
    req.session.error = "Invalid Password";
    return res.redirect("/login");
  }
  if (!user) {
    req.session.error = "Invalid User";
    return res.redirect("/login");
  }
  if (user.status != "Active") {
    req.session.error = "Pending Account. Please Verify Your Email!";
    req.session.isPending = true;
    req.session.email = email;
    return res.redirect("/login");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    req.session.error = "Invalid Credentials";
    return res.redirect("/login");
  }

  req.session.isAuth = true;
  
  if (!req.cookies.theme) {
    // Set the theme cookie to "light" if it's not already set
    res.cookie("theme", "light");
  }
  req.session.email = user.email;
  user.lastOpenedAt = Date.now();
  user.save().then(() => {
    res.redirect("/files");
  }).catch((err)=> {
    console.log(err);
    req.session.error = "Unable to Login";
    return res.redirect("/login");
  })
};
exports.register_get = (req, res) => {
  if(req.session.isAuth){
    return res.redirect("/files")
  }
  const error = req.session.error;
  delete req.session.error;
  res.render("welcome/signup", { layout: false , err: error });
};
exports.resendVerificationEmail_get = async (req, res) => {
  // const email = req.body
  const email = req.params.email.toLowerCase();
  const user = await User.findOne({email});
    if(user){
      const subject = "Link to verify Email";
      const mailMsg = "Confirm your Email";
      const url = process.env.BASE_URL + "/api/auth/confirm/" + user.confirmationCode;
      mailStatus = await sendEmail(process.env.USER_EMAIL, process.env.PASSWORD, url, user.username, user.email, subject, mailMsg);
      }
    //Sending Mail
    if(mailStatus){
      req.session.msg = "Resent Confirmation Email, Please confirm and try to Login";
      res.redirect("/login");
    }
    else{
      req.session.error = "Sorry Unable to sent email now, Please try again";
      return res.redirect("/login");
    }
}
exports.register_post = async (req, res) => {
  const { username, password, confirmpassword } = req.body;
  const email = req.body.email.toLowerCase();
  //Checking user existance
  let user = await User.findOne({ email });
  if (user) {
    if(user.googleId && user.password) {
      req.session.error = "User already exists with google signIn and password use any one";
      return res.redirect("/login");
    }
    else if(user.googleId) {
      req.session.error = "User already exists with google signIn";
      return res.redirect("/login");
    }
    else {
      req.session.error = "User already exists use forgot password to login";
      return res.redirect("/login");
    }
  }
  //Comparing entered passwords
  const passMatch = (password === confirmpassword);

  if (!passMatch) {
    req.session.error = "Passwords didn't match";
    return res.redirect("/signup");
  }

  //Checking Password criteria
  if(!checkPassword(password)){
    req.session.error = "Password Should contain 7 to 15 characters which contain at least one numeric digit and a special character";
    return res.redirect("/signup");
  }
  // Creating password hash
  const hasdPsw = await bcrypt.hash(password, 12);
  // Generating User token
  const token = jwt.sign({email: email}, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN});
  
  user = new User({
    username,
    email,
    password: hasdPsw,
    confirmationCode: token,
    createdAt: Date.now(),
    lastOpenedAt: Date.now()
  });
  let mailStatus
  await user.save().then(async () => {
    req.session.email = user.email;
    if(user){
      const subject = "Link to verify Email";
      const mailMsg = "Please confirm your email";
      const url = process.env.BASE_URL + "/api/auth/confirm/" + user.confirmationCode;
      mailStatus = await sendEmail(process.env.USER_EMAIL, process.env.PASSWORD, url, user.username, user.email, subject, mailMsg);
      console.log(username + " User Created successfully");
      }
    //Sending Mail
    if(mailStatus){
      req.session.msg = "User Created, and confirmation Email sent, Please confirm and try to Login";
      res.redirect("/login");
    }
    else{
      req.session.error = "Sorry Unable to sent email now, Please try again";
      return res.redirect("/login");
    }
  }).catch((err) =>{
    console.log(err);
    req.session.error = "Error Saving User";
    return res.redirect("/signup");
  })
};
exports.verifyUser = async (req, res) => {
  const user = await User.findOne({
    confirmationCode: req.params.confirmationCode,
  })
  if (!user) {
    req.session.error = "Invalid User";
    return res.redirect("/login");
  }
  user.status = "Active";
  user.save().then(() => {
    req.session.msg = "User Email Validated";
    res.redirect("/login");
  }).catch((err) =>{
    console.log(err);
    req.session.error = "Error Saving User";
    return res.redirect("/signup");
  })
};
exports.forgotPassword_get = async (req, res) => {
  const error = req.session.error;
  delete req.session.error;
  const msg = req.session.msg;
  delete req.session.msg;
  res.render("welcome/forgot", { layout: false ,err: error, msg: msg});
};
exports.forgotPassword_post = async (req, res) => {

  const email = req.body.email.toLowerCase();
  const user = await User.findOne({ email });
  
  if (!user) {
    req.session.error = "Invalid User Email, Please Signup";
    return res.redirect("/signup");
  }
  let mailStatus;
  const subject = "Link to reset Password";
  const mailMsg = "Reset Password";
  const url = process.env.BASE_URL + "/api/auth/resetPassword/" + user.confirmationCode;
  mailStatus = await sendEmail(process.env.USER_EMAIL, process.env.PASSWORD, url, user.username, user.email, subject, mailMsg);
  if(mailStatus){
  req.session.msg = "Password reset Link has been sent to registered email, Please check";
  res.redirect("/forgotPassword");
  }
  else{
    req.session.error = "Sorry Unable to sent email now, Please try again";
    return res.redirect("/forgotPassword");
  }
};
exports.resetPassword_get = async (req, res) => {
  const error = req.session.error;
  delete req.session.error;
  const confirmationCode = req.params.confirmationCode;
  res.render("welcome/resetPassword", { layout: false ,err: error, confirmationCode: confirmationCode});
};
exports.resetPassword_put = async (req, res) => {
  const confirmationCode = req.params.confirmationCode;
  const newPassword = req.body.password;
  const confirmPassword = req.body.confirmpassword;
  let user = await User.findOne({confirmationCode: confirmationCode});
  
  if (!user) {
    req.session.error = "Invalid User reset Link";
    return res.redirect('/forgotPassword');
    }


let passMatch 
if(newPassword === confirmPassword){
  passMatch = true;
} else{
  passMatch = false;
}
if (!passMatch) {
  error = "Passwords didn't match";
  return res.render("welcome/resetPassword", { layout: false ,err: error , confirmationCode: confirmationCode});
  }
if(!checkPassword(newPassword)){
  error = "Password Should contain 7 to 15 characters which contain at least one numeric digit and a special character";
  return res.render("welcome/resetPassword", { layout: false ,err: error, confirmationCode: confirmationCode});
}
const hasdPsw = await bcrypt.hash(newPassword, 12);
user.password = hasdPsw;
  user.save()
  .then(() => {
      console.log("User Password Updated successfully");
      req.session.msg = "User Password Updated successfully";
      res.redirect('/login')
  })
  .catch((err) => {
    req.session.error = "User Password Update Failed";
    console.log(err);
    res.redirect('/login')
  })

};
exports.dashboard_get = async (req, res) => {
  const email = req.session.email;
  const user = await User.findOne({ email });

  let pageNumber = parseInt(req.query.page) || 1; // Get the requested page number from the query string
  const pageSize = 20; // Number of items to load per page

  try {
    const allBooks = await Book.find({ user: user });
    const dbBooks = await Book.find({ user: user })
      .sort({ lastOpenedAt: 'desc' })
      .skip((pageNumber - 1) * pageSize) // Skip the appropriate number of items based on the page number
      .limit(pageSize)
      .exec();

    const books = dbBooks.map((book) => {
      return { id: book.id, coverImagePath: book.coverImagePath, title: book.title };
    });

    res.render('index', { user: user, books: books, current: pageNumber, pages: Math.ceil(allBooks.length / pageSize) });
  } catch (error) {
    console.error(error);
    res.render('index', { user: user, books: books, current: pageNumber, pages: Math.ceil(allBooks.length / pageSize) , errorMessage: error });
  }
};
exports.logout_post = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      throw err;
    }
    res.redirect("/");
  });
};



