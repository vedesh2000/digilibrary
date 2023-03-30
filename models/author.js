const mongoose = require('mongoose')
const Book = require("./book")
const authorSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

authorSchema.pre('deleteOne', { document: true }, function(next)  {
    Book.find({author: this.id})
    .then((books) => {
        // console.log(books.length)
        if(books.length > 0){
            next(new Error('This Author still has books'))
        }else{
            next()
        }
    })
    .catch((err) => {
            next(err)
    });
})
module.exports = mongoose.model('Author' , authorSchema)