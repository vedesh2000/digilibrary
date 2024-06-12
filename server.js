console.log('NODE_ENV:', process.env.NODE_ENV);
  require('dotenv').config({ path: require('find-config')('.env') })

const expressLayouts = require("express-ejs-layouts")
const methodOverride = require('method-override')
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const MongoDBStore = require("connect-mongodb-session")(session);
const connectDB = require("./config/db");
const mongoURI = process.env.DATABASE_URL;
const app = express();
connectDB();
//Url decode
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ limit: '5mb', extended: false }))
//Starting session
const store = new MongoDBStore({
    uri: mongoURI,
    collection: "mySessions",
    expires: 14 * 24 * 3600000
});
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
        httpOnly: true,
        // secure: true, // Set secure flag
        expires: false
    }
  })
);
// Remember Me 
app.use(function(req, res, next) {
    if (req.method == 'POST' && req.url == '/login') {
      if (req.body.rememberme) {
        var hour = 3600000;
        req.session.cookie.maxAge = 14 * 24 * hour; //2 weeks
      } else {
        req.session.cookie.expires = false;
      }
    }
    next();
});
app.use(cookieParser());
app.use(methodOverride('_method'))
const publishersRouter = require('./routes/publishers')
const authorsRouter = require('./routes/authors')
const notesRouter = require('./routes/notes')
const userRouter = require('./routes/user')
const booksRouter = require('./routes/books')
const welcomeRouter = require('./routes/welcome')
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.use(expressLayouts)
app.set('layout', 'layouts/layout')
app.use('/', welcomeRouter)
app.use(express.static(__dirname + '/public'));
app.use('/files/authors', authorsRouter)
app.use('/files/notes', notesRouter)
app.use('/files/publishers', publishersRouter)
app.use('/user',userRouter)
app.use('/files/books', booksRouter)
app.listen(process.env.PORT || 3000)

//code to hit digilibrary for every 10mins 
function hitURL() {
  // Replace 'YOUR_URL_HERE' with the URL you want to hit
  const url = 'https://digilibrary-vwcf.onrender.com/';
  // Replace this with your code to make the HTTP request to the URL (e.g., using fetch, XMLHttpRequest, etc.)
  // For simplicity, I'll use fetch in this example.
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return `hit`;
    })
    .then(data => {
      // Process the response data if needed
      // console.log('Response:', data);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

// Set an initial delay of 7 minutes (600,000 milliseconds) before the first request
const intervalTime = 7 * 60 * 1000; // 10 minutes in milliseconds

// Call the hitURL() function immediately (for the first time)
hitURL();

// Set up the interval to call the hitURL() function every 10 minutes
setInterval(hitURL, intervalTime);
