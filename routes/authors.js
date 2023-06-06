const express = require('express')
const isAuth = require("../middleware/is-auth");
const routes = express.Router();
const Author = require('../models/author');
const User = require('../models/user');
const Book = require('../models/book');
//All authors
routes.get('/', isAuth, async (req, res) => {
    const email = req.session.email
    const user = await User.findOne({email})
    let searchOptions = {user : user}
    const sortBy = req.query.sortBy;
    const sort = req.query.sort;
    if (req.query.name != null && req.query.name != '') {
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        let sortOptions = {};
        if(sortBy)
            sortOptions[sortBy] = sort;
        const authors = await Author.find(searchOptions).sort(sortOptions).exec()
        res.render('authors/index',
            {
                authors: authors,
                searchOptions: req.query.name,
                sortBy: req.query.sortBy,
                sort: req.query.sort
            })
    } catch(err) {
        console.log(err);
        res.redirect('/')
    }
})
//New author
routes.get('/new', isAuth, (req, res) => {
    res.render('authors/new', { author: new Author() })
})
//Create Author
routes.post('/', isAuth, async (req, res) => {
    const email = req.session.email;
    const author = new Author(
        { 
            name: req.body.name,
            user: await User.findOne({email}),
            createdAt: new Date(),
            lastModifiedAt: new Date(),
            lastOpenedAt: new Date(),
            version: 1
        })
    author.save()
        .then(() => {
            // res.redirect(`User Created ${author.name}`)
            // res.redirect(`authors`);
            console.log("Author Created");
            res.redirect(`/files/authors/${author.id}`)
        })
        .catch((err) => {
            //console.log(err);
            res.render('authors/new', { author: author, errorMessage: err })
        })
})
routes.get('/:id', isAuth, async (req, res) => {
    try{
        const author = await Author.findById(req.params.id)
        const user = await User.findById(author.user)
        if(req.session.email != user.email) {
            res.redirect('/')
            return
        }
        // const books = await Book.find({author: author.id}).limit(6).exec()
        // Modifying last opened at
        author.lastOpenedAt = new Date();
        author.save();
        const books = await Book.find({author: author.id}).exec()
        res.render('authors/show' , {
            author: author,
            booksByAuthor: books
        })
    }catch(err){
        //console.log(err);
        res.redirect('/')
    }
})
routes.get('/:id/edit', isAuth, async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        const user = await User.findById(author.user)
        if(req.session.email != user.email) {
            res.redirect('/')
            return
        }
        res.render('authors/edit', { author: author })
    } catch {
        res.redirect('/authors')
    }
})
routes.put('/:id', isAuth, async (req, res) => {
    let author
    try {
        //console.log(req.url);
        author = await Author.findById(req.params.id)
        const user = await User.findById(author.user)
        if(req.session.email != user.email) {
            res.redirect('/')
            return
        }
        author.name = req.body.name
        author.lastModifiedAt = new Date();
        author.version += 1;
    } catch {
        if (author == null) {
            res.redirect('/')
        }
        else {
            res.render('authors/edit', { author: author, errorMessage: "Error Updating Author" })
        }
    }
    author.save()
        .then(() => {
            res.redirect(`/files/authors/${author.id}`)
        })
        .catch(() => {
            res.render('/authors/edit', { author: author, errorMessage: "Error Updating Author" })
        })
})
routes.delete('/:id', isAuth, async (req, res) => {
    let author
    try {
        author = await Author.findById(req.params.id)
        const user = await User.findById(author.user)
        if(req.session.email != user.email) {
            res.redirect('/')
            return
        }
        await author.deleteOne().then(()=>{
            res.redirect('/files/authors')
        }).catch(async (err)=> {
            console.log(err);
            const books = await Book.find({author: author.id}).exec()
            res.render('authors/show' , {
                author: author,
                booksByAuthor: books,
                errorMessage: err
            })
        })
    } catch (err) {
        console.log(err);
        
        if (author == null) {
            res.redirect('/files/authors')
        }
        else {
            const books = await Book.find({author: author.id}).exec()
            res.render('authors/show' , {
                author: author,
                booksByAuthor: books,
                errorMessage: err
            })
        }
    }
})

module.exports = routes