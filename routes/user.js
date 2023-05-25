const express = require('express')
const isAuth = require("../middleware/is-auth");
const routes = express.Router();
const bcrypt = require("bcryptjs");
const User = require('../models/user');
const Book = require('../models/book')
const Author = require('../models/author')


routes.get('/:id', isAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const books = await Book.find({ user: user });
        const authors = await Author.find({ user: user });
        res.render('user/show', {
            user: user,
            authorsLength: authors.length,
            totalBooksLength: books.length,
            inProgressBooksLength: books.filter((book) => book.progress === 'inProgress').length,
            completedBooksLength: books.filter((book) => book.progress === 'completed').length,
            yetToStartBooksLength: books.filter((book) => book.progress === 'yetToStart').length,
            physicalBooksLength: books.filter((book) => book.type === 'book').length,
            eBooksLength: books.filter((book) => book.type === 'ebook').length,
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
routes.get('/:id/editPassword', isAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        res.render('user/editPassword', { user: user })
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
        res.redirect(`user/${userId}`);
        return
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
        error = "Invalid Credentials";
        res.render('user/editPassword', { user: user, errorMessage: error })
        return
    }

    let passMatch
    if (newPassword === confirmPassword) {
        passMatch = true;
    } else {
        passMatch = false;
    }

    if (!passMatch) {
        error = "Passwords didn't match";
        res.render('user/editPassword', { user: user, errorMessage: error })
        return
    }

    if (!checkPassword(newPassword)) {
        error = "Password Should contain 7 to 15 characters which contain at least one numeric digit and a special character";
        res.render('user/editPassword', { user: user, errorMessage: error })
        return
    }
    const hasdPsw = await bcrypt.hash(newPassword, 12);
    user.password = hasdPsw;
    user.save()
        .then(() => {
            console.log("User Password Updated successfully");
            res.redirect(`/user/${user.id}`)
            console.log(user);
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
        console.log(req.body);
        user.username = req.body.name
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
            console.log("User Updated successfully");
            res.redirect(`/user/${user.id}`)
            console.log(user);
        })
        .catch((err) => {
            console.log(err);
            res.render('user/edit', { user: user, errorMessage: "Error Updating User " + err["_message"] })
        })

})

routes.delete('/:id', isAuth, async (req, res) => {
    let user
    try {
        user = await User.findById(req.params.id)
        const username = user.username;
        await user.deleteOne()
        //clearing session
        req.session.destroy((err) => {
            if (err) {
                console.log(err);
                throw err;
            }
            console.log("username account deleted Successfully");
            res.redirect("/");
        });

    } catch (err) {
        console.log(err);
        if (user == null) {
            res.redirect('/files')
        }
        else {
            // res.redirect(`/user/${user.id}`)
            res.render('user/show', { user: user, errorMessage: "\nError Deleting User " + err })
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

module.exports = routes