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
            // Session expires after 100 min of inactivity.
            expires: 6000000
        }
    })
);
app.use(methodOverride('_method'))
const authorsRouter = require('./routes/authors')
const userRouter = require('./routes/user')
const booksRouter = require('./routes/books')
const welcomeRouter = require('./routes/welcome')
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))
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