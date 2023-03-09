const express = require('express')
const routes = express.Router();
const Author = require('../models/author')
//All authors
routes.get('/' , async (req, res) => {
    let searchOptions = {}
    if(req.query.name != null && req.query.name != ''){
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try{
        const authors = await Author.find(searchOptions)
        res.render('authors/index' , 
        {authors : authors , 
            searchOptions: req.query})
    } catch{
        res.redirect('/')
    }
})
//New author
routes.get('/new' , (req, res) => {
    res.render('authors/new', {author : new Author()})
})
//Create Author
routes.post('/' , (req, res) => {
    const author = new Author(
        {name: req.body.name})
    author.save()
    .then(()=>{
        // res.redirect(`User Created ${author.name}`)
        res.redirect(`authors`);
    })
    .catch((err)=>{
        console.log(err);
        res.render('authors/new', {author : author, errorMessage : err})
    })
    // res.send(req.body.name)
})
module.exports = routes