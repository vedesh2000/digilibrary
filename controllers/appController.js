const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Book = require("../models/book");

exports.landing_page = (req, res) => {
  res.render("welcome/welcome" ,{layout: false});
};

exports.login_get = (req, res) => {
  const error = req.session.error;
  delete req.session.error;
  res.render("welcome/login", { layout: false ,err: error });
};

exports.login_post = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    req.session.error = "Invalid User";
    return res.redirect("/login");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    req.session.error = "Invalid Credentials";
    return res.redirect("/login");
  }

  req.session.isAuth = true;
  req.session.username = user.username;
  req.session.email = user.email;
  res.redirect("/files");
};

exports.register_get = (req, res) => {
  const error = req.session.error;
  delete req.session.error;
  res.render("welcome/signup", { layout: false , err: error });
};

exports.register_post = async (req, res) => {
  const { username, email, password, confirmpassword } = req.body;

  let user = await User.findOne({ email });

  if (user) {
    req.session.error = "User already exists";
    return res.redirect("/signup");
  }
  const passMatch = (password === confirmpassword);

  if (!passMatch) {
    req.session.error = "Passwords didn't match";
    return res.redirect("/signup");
  }

  const hasdPsw = await bcrypt.hash(password, 12);

  user = new User({
    username,
    email,
    password: hasdPsw,
  });

  await user.save().then(() => {
    req.session.isAuth = true;
    req.session.username = user.username;
    req.session.email = user.email;
    res.redirect("/files");
  }).catch(() =>{
    res.redirect("/")
  })
};

exports.dashboard_get = async (req, res) => {
  const username = req.session.username;
  const email = req.session.email;
  const user = await User.findOne({ email })
    let books
    try{
        books = await Book.find({user: user}).sort({ createdAt : 'desc'}).limit(10).exec()
    }
    catch{
        books = []
    }
    // res.render('index' , {})
  res.render("index", { name: email , user: user, books : books});

};

exports.logout_post = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
      throw err;
    }
    res.redirect("/login");
  });
};