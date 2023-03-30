if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
const express = require("express")
const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL , {
    useNewUrlParser : true
})
const db = mongoose.connection
db.on('error' , error => console.log(error))
db.once('open' , () => {console.log("Connected to Mongoose")})
const app = express()
const expressLayouts = require("express-ejs-layouts")
const indexRouter = require('./routes/index')
const authorsRouter = require('./routes/authors')
const booksRouter = require('./routes/books')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout' , 'layouts/layout')
app.use(methodOverride('_method'))
app.use(expressLayouts)
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}))
app.use('/' , indexRouter)
app.use('/authors' , authorsRouter)
app.use('/books' , booksRouter)
app.listen(process.env.PORT || 3000)