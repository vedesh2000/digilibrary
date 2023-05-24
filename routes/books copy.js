const express = require("express")
const fs = require("fs")
const path = require("path")
const isAuth = require("../middleware/is-auth");
const router = express.Router()
const Book = require("../models/book")
const Author = require("../models/author")
const User = require("../models/user")
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg']
let imgPath = "/home/kvsvedesh/Public/myWorks/mybrary/mybrary/views/images/book.png"
//all authors route
router.get('/', isAuth, async (req,res)=>{
    const email = req.session.email;
    const user = await User.find({email: email})
    let searchOptions = {user : user}
    let query = Book.find(searchOptions)
    if(req.query.title != null && req.query.title != '')
        query = query.regex('title' , new RegExp(req.query.title , 'i'))
    if(req.query.publishedBefore != null && req.query.publishedBefore != '')
        query = query.lte('publishDate' , req.query.publishedBefore)
    if(req.query.publishedAfter != null && req.query.publishedAfter != '')
        query = query.gte('publishDate' , req.query.publishedAfter)
    try{
        const books = await query.exec()
        res.render('books/index', {
            books : books,
            searchOptions: req.query
        })
    }
    catch{
        res.redirect('/')
    }
});
// new Book route
router.get('/new',isAuth,async(req,res)=>{
    renderNewPage(req, res, new Book())
});
router.get('/:id',async(req,res)=>{
    try{
        const book = await Book.findById(req.params.id).populate('author').exec()
        const user = await User.findById(book.user)
        if(req.session.email != user.email) {
            res.redirect('/')
            return
        }
        res.render('books/show' , {book: book})
    }catch{
        res.redirect('/')
    }
});
//Edit book route
router.get('/:id/edit', isAuth,async(req,res)=>{
    try{
        const book = await Book.findById(req.params.id)
        const user = await User.findById(book.user)
        if(req.session.email != user.email) {
            res.redirect('/')
            return
        }
        renderEditPage(req, res, book)
    }catch{
        res.redirect('/')
    }
});
//Update book
router.put('/:id', isAuth,async (req, res)=>{
    let book
    try{
        book = await Book.findById(req.params.id)
        const user = await User.findById(book.user)
        if(req.session.email != user.email) {
            res.redirect('/')
            return
        }
        book.title = req.body.title
        book.author = req.body.author
        book.publishDate =  new Date(req.body.publishDate)
        book.pageCount =  req.body.pageCount
        book.description =  req.body.description
        if(req.body.cover != null && req.body.cover !== ''){
            saveCover(book , req.body.cover)
        }
        await book.save()
        res.redirect(`/files/books/${book.id}`)
    }
    catch(error){
        console.log(error)
        if(book == null){
            res.redirect('/')
        }else{
            renderEditPage(req, res, book, true)
        }
    }
})
// delete all books
router.delete('/deleteAll', isAuth,async (req, res)=>{
    const email = req.session.email;
    const user = await User.findOne({email: email})
    let book
    try{
        await Book.deleteMany({user: user})
        res.redirect('/files/books')
    }
    catch(error){
        console.log(error)
        if(book != null){
            res.render(`books/show`, {
                book: book,
                errorMessage: 'Could not remove Books'
            })
        }else{
            res.redirect('/files/books')
        }
    }
})
//delete book
router.delete('/:id', isAuth,async (req, res)=>{
    let book
    try{
        book = await Book.findById(req.params.id)
        const user = await User.findById(book.user)
        if(req.session.email != user.email) {
            res.redirect('/')
            return
        }
        await book.deleteOne()
        res.redirect('/files/books')
    }
    catch(error){
        console.log(error)
        if(book != null){
            res.render(`books/show`, {
                book: book,
                errorMessage: 'Could not remove Book'
            })
        }else{
            res.redirect('/files/books')
        }
    }
})
//new author route
router.post('/', isAuth,async (req,res)=>{
    const email = req.session.email
    const book = new Book({
        title: req.body.title,
        author:req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        description: req.body.description,
        user: await User.findOne({email: email})
    })
    if(req.body.cover != null && req.body.cover !== ''){
        saveCover(book , req.body.cover)
    }
    else{
        console.log("No cover image");
        try{
            fs.readFile(imgPath, (err, data) => {
                if(err) throw err;
                saveCover(book , data , false)
                console.log(data);
            })
        }catch(err){
            console.log(err);
        }
    }
    try{
        const newBook = await book.save()
        res.redirect(`books/${newBook.id}`)
    }
    catch(error){
        console.log(error)
        renderNewPage(req, res, book, true)
    }
})

async function renderNewPage(req, res, book, hasError = false){
    renderFormPage(req, res, book, 'new' , hasError)
}
async function renderEditPage(req, res, book, hasError = false){
    renderFormPage(req, res, book, 'edit' , hasError)
}
async function renderFormPage(req, res, book, form, hasError = false){
    const email = req.session.email
    try{
        const user = await User.findOne({ email: email })
        const authors = await Author.find({user: user}).sort({name: 1})
        const params ={
            authors : authors,
            book : book
        }
        if(hasError) {
            if(form === 'edit')    
            params.errorMessage = 'Error Updating book'
            else if( form === 'new')
            params.errorMessage = 'Error Creating book'
            else
            params.errorMessage = 'Error'
        }
        res.render(`books/${form}`, params)
    }
    catch{
        res.redirect('/books')
    }
}
function saveCover(book , coverEncoded, flag = true){
    if(coverEncoded == null) return
    if(!flag){
        console.log("No cover to save");
        // get image file extension name
        const extensionName = path.extname(imgPath);
        book.coverImageType = extensionName
        // convert image file to base64-encoded string
        const base64Image = Buffer.from(coverEncoded, 'binary').toString('base64');
        book.coverImage = base64Image
        // combine all strings
        const base64ImageStr = `data:image/${extensionName.split('.').pop()};base64,${base64Image}`;
    }
    else{
        const cover = JSON.parse(coverEncoded)
        if(cover != null && imageMimeTypes.includes(cover.type)){
            book.coverImage = new Buffer.from(cover.data, 'base64')
            book.coverImageType = cover.type
        }
    }
    
}
module.exports = router

