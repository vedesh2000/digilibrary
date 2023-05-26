console.log('NODE_ENV:', process.env.NODE_ENV);
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: require('find-config')('.env') })
}
const expressLayouts = require("express-ejs-layouts")
const methodOverride = require('method-override')
const express = require("express");
const session = require("express-session");
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
});
app.use(
    session({
        secret: "secret",
        resave: false,
        saveUninitialized: false,
        store: store,
        cookie: {
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
app.use(methodOverride('_method'))
const authorsRouter = require('./routes/authors')
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
app.use('/user',userRouter)
app.use('/files/books', booksRouter)
app.listen(process.env.PORT || 3000)