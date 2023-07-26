const express = require('express')
const isAuth = require("../middleware/is-auth");
const routes = express.Router();
const bcrypt = require("bcryptjs");
const User = require('../models/user');
const {Book} = require('../models/book')
const Author = require('../models/author')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg']

// Function to convert a string to title case
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }


routes.get('/', isAuth, async (req, res) => {
    try {
        const user = await User.findOne({email: req.session.email});
        const books = await Book.find({ user: user });
        const authors = await Author.find({ user: user });
        const inProgressBooks = books.filter((book) => book.progress === 'inProgress');
        var percentagesList = [];
        for(var i=0; i<10; i++){
            percentagesList.push(0);
        }
        //getting percentage completed for all in progress books
        inProgressBooks.forEach(book => {
            percentagesList[Math.floor(book.percentageCompleted*10)] += 1;
        });
        let isPassword = false;
        if(user.password)
            isPassword = true;
        res.render('user/show', {
            isPassword: isPassword,
            user: user,
            authorsLength: authors.length,
            totalBooksLength: books.length,
            inProgressBooksLength: inProgressBooks.length,
            completedBooksLength: books.filter((book) => book.progress === 'completed').length,
            yetToStartBooksLength: books.filter((book) => book.progress === 'yetToStart').length,
            physicalBooksLength: books.filter((book) => book.type === 'book').length,
            eBooksLength: books.filter((book) => book.type === 'ebook').length,
            percentageGroupsList: percentagesList
        });

    } catch (err) {
        console.log(err);
        res.redirect('/')
    }
})
routes.get('/:id/edit', isAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        res.render('user/edit', { user: user })
    } catch {
        res.redirect('/')
    }
})
routes.get('/:id/editPassword/', isAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        let isPassword = false;
        if(user.password)
            isPassword = true;
        res.render('user/editPassword', { user: user , isPassword: isPassword})
    } catch {
        res.redirect('/')
    }
})
routes.put('/editPassword/:id', isAuth, async (req, res) => {
    const userId = req.params.id;
    const oldPassword = req.body.oldpassword;
    const newPassword = req.body.newpassword;
    const confirmPassword = req.body.confirmpassword;
    let user = await User.findById(userId);

    if (!user) {
        req.session.error = "Invalid User";
        return res.redirect('/user');
    }
    let isPassword = false;
    if(user.password)
        isPassword = true;
    let isMatch
    if(isPassword){
        isMatch = await bcrypt.compare(oldPassword, user.password);
    }
    if (isPassword && !isMatch) {
        error = "Invalid Credentials";
        return res.render('user/editPassword', { user: user, errorMessage: error , isPassword: isPassword})
    }

    let passMatch
    if (newPassword === confirmPassword) {
        passMatch = true;
    } else {
        passMatch = false;
    }

    if (!passMatch) {
        error = "Passwords didn't match";
        res.render('user/editPassword', { user: user, errorMessage: error , isPassword: isPassword })
        return
    }

    if (!checkPassword(newPassword)) {
        error = "Password Should contain 7 to 15 characters which contain at least one numeric digit and a special character";
        res.render('user/editPassword', { user: user, errorMessage: error , isPassword: isPassword })
        return
    }
    const hasdPsw = await bcrypt.hash(newPassword, 12);
    user.password = hasdPsw;
    user.save()
        .then(() => {
            console.log("User Password Updated successfully");
            res.redirect('/user')
            // console.log(user);
        })
        .catch((err) => {
            console.log(err);
            res.render('user/editPassword', { user: user, errorMessage: "Error Updating User " + err["_message"] })
        })

})
routes.put('/:id', isAuth, async (req, res) => {
    let user
    try {
        //console.log(req.url);
        user = await User.findById(req.params.id)
        // console.log(req.body);
        const name = req.body.name;
        const titleCaseName = toTitleCase(name);
        user.username = titleCaseName
        if (req.body.cover != null && req.body.cover !== '') {
            saveCover(user, req.body.cover)
        }
    } catch {
        if (user == null) {
            res.redirect('/')
        }
        else {
            res.render('user/edit', { user: user, errorMessage: "Error Updating User" })
        }
    }
    user.save()
        .then(() => {
            // console.log("User Updated successfully");
            res.redirect(`/user/`)
            // console.log(user);
        })
        .catch((err) => {
            console.log(err);
            res.render('user/edit', { user: user, errorMessage: "Error Updating User " + err["_message"] })
        })

})

routes.delete('/:id', isAuth, async (req, res) => {
    const user = await User.findOne({email: req.session.email});
    const books = await Book.find({ user: user });
    try {
        const username = user.username;

        await user.deleteOne()
        //clearing session
        req.session.destroy((err) => {
            if (err) {
                console.log(err);
                throw err;
            }
            console.log(username + "account deleted Successfully");
            res.redirect("/");
        });

    } catch (err) {
        console.log(err);
        if (user == null) {
            res.redirect('/files')
        }
        else {
            //need to show error message here
            res.redirect("/user");
        }
    }
})

function checkPassword(inputtxt) {
    var paswd = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/;
    if (inputtxt.match(paswd)) {
        return true;
    }
    return false;
}
function saveCover(user, coverEncoded) {
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        user.coverImage = new Buffer.from(cover.data, 'base64')
        user.coverImageType = cover.type
    }
}
module.exports = routes