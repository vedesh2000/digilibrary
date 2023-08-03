const express = require('express')
const isAuth = require("../middleware/is-auth");
const routes = express.Router();
const Publisher = require('../models/publisher');
const User = require('../models/user');
const {Book} = require('../models/book');


// Function to convert a string to title case
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

//All publishers
routes.get('/', isAuth, async (req, res) => {
    const email = req.session.email
    const user = await User.findOne({email})
    let searchOptions = {user : user}
    const sortBy = req.query.sortBy;
    const sort = req.query.sort;
    if (req.query.name != null && req.query.name != '') {
        searchOptions.name = new RegExp('.*' + req.query.name.split('').join('.{0,2}') + '.*', 'i');
    }
    try {
        let pageNumber = parseInt(req.query.page) || 1; // Get the requested page number from the query string
        const pageSize = 20; // Number of items to load per page
        let sortOptions = {};
        let queryResult
        let publishers
        if(sortBy){
            sortOptions[sortBy] = sort;
            queryResult = await Publisher.find(searchOptions).sort(sortOptions).exec();
            publishers = queryResult.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
        }
        else{
            queryResult = await Publisher.find(searchOptions).sort({name : 1}).exec();
            publishers = queryResult.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
        }
        res.render('publishers/index',
            {
                publishers: publishers,
                searchOptions: req.query.name,
                sortBy: req.query.sortBy,
                sort: req.query.sort,
                current: pageNumber, 
                pages: Math.ceil(queryResult.length / pageSize)
            })
    } catch(err) {
        console.log(err);
        res.redirect('/')
    }
})
//New publisher
routes.get('/new', isAuth, (req, res) => {
    res.render('publishers/new', { publisher: new Publisher() })
})
//Create publisher
routes.post('/', isAuth, async (req, res) => {
    const email = req.session.email;
    const name = req.body.name;
    const titleCaseName = toTitleCase(name);
    const publisher = new Publisher(
        { 
            name: titleCaseName,
            user: await User.findOne({email}),
            createdAt: new Date(),
            lastModifiedAt: new Date(),
            lastOpenedAt: new Date(),
            version: 1
        })
    publisher.save()
        .then(() => {
            // res.redirect(`User Created ${publisher.name}`)
            // res.redirect(`publishers`);
            // console.log("publisher Created");
            res.redirect(`/files/publishers/${publisher.id}`)
        })
        .catch((err) => {
            //console.log(err);
            res.render('publishers/new', { publisher: publisher, errorMessage: err })
        })
})
routes.get('/:id', isAuth, async (req, res) => {
    try{
        const publisher = await Publisher.findById(req.params.id)
        const user = await User.findById(publisher.user)
        if(req.session.email != user.email) {
            res.redirect('/')
            return
        }
        // const books = await Book.find({publisher: publisher.id}).limit(6).exec()
        // Modifying last opened at
        publisher.lastOpenedAt = new Date();
        await publisher.save();
        const books = await Book.find({publisher: publisher.id}).exec()
        res.render('publishers/show' , {
            publisher: publisher,
            booksBypublisher: books
        })
    }catch(err){
        console.log(err);
        res.redirect('/')
    }
})
routes.get('/:id/edit', isAuth, async (req, res) => {
    try {
        const publisher = await Publisher.findById(req.params.id)
        const user = await User.findById(publisher.user)
        if(req.session.email != user.email) {
            res.redirect('/')
            return
        }
        res.render('publishers/edit', { publisher: publisher })
    } catch(err) {
        console.log(err);
        res.redirect('/files/publishers')
    }
})
routes.put('/:id', isAuth, async (req, res) => {
    let publisher
    try {
        publisher = await Publisher.findById(req.params.id)
        const user = await User.findById(publisher.user)
        if(req.session.email != user.email) {
            res.redirect('/')
            return
        }
        const name = req.body.name;
        const titleCaseName = toTitleCase(name);
        publisher.name = titleCaseName
        publisher.lastModifiedAt = new Date();
        publisher.version += 1;
    } catch {
        if (publisher == null) {
            res.redirect('/')
        }
        else {
            res.render('publishers/edit', { publisher: publisher, errorMessage: "Error Updating publisher" })
        }
    }
    publisher.save()
        .then(() => {
            res.redirect(`/files/publishers/${publisher.id}`)
        })
        .catch(() => {
            res.render('/publishers/edit', { publisher: publisher, errorMessage: "Error Updating publisher" })
        })
})
routes.delete('/:id', isAuth, async (req, res) => {
    let publisher
    try {
        publisher = await Publisher.findById(req.params.id)
        const user = await User.findById(publisher.user)
        if(req.session.email != user.email) {
            res.redirect('/')
            return
        }
        await publisher.deleteOne().then(()=>{
            res.redirect('/files/publishers')
        }).catch(async (err)=> {
            console.log(err);
            const books = await Book.find({publisher: publisher.id}).exec()
            res.render('publishers/show' , {
                publisher: publisher,
                booksBypublisher: books,
                errorMessage: err
            })
        })
    } catch (err) {
        console.log(err);
        
        if (publisher == null) {
            res.redirect('/files/publishers')
        }
        else {
            const books = await Book.find({publisher: publisher.id}).exec()
            res.render('publishers/show' , {
                publisher: publisher,
                booksBypublisher: books,
                errorMessage: err
            })
        }
    }
})

module.exports = routes