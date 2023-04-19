const express = require('express')
const isAuth = require("../middleware/is-auth");
const routes = express.Router();
const bcrypt = require("bcryptjs");
const Author = require('../models/author');
const Book = require('../models/book');
const User = require('../models/user');


routes.get('/:id', isAuth, async (req, res) => {
    try{
        const user = await User.findById(req.params.id)
        // const books = await Book.find({author: author.id}).limit(6).exec()
        res.render('user/show' , {
            user: user
        })
    }catch(err){
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
    return res.redirect(`user/${userId}`);
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);

  if (!isMatch) {
    req.session.error = "Invalid Credentials";
    res.render('user/editPassword', { user: user, errorMessage: error })
  }

  const passMatch = (newPassword === confirmPassword);

  if (!passMatch) {
    error = "Passwords didn't match";
    res.render('user/editPassword', { user: user, errorMessage: error })
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
        user.email = req.body.email
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
        await user.deleteOne()
        res.redirect('/')
    } catch (err) {
        if (user == null) {
            res.redirect('/files')
        }
        else {
            res.redirect(`/user/${user.id}`)
        }
    }
})

module.exports = routes