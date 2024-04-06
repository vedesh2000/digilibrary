const mongoose = require('mongoose')
const Book = require("./book")
const authorSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        required: true
    },
    lastModifiedAt: {
        type: Date,
        required: true
    },
    lastOpenedAt: {
        type: Date,
        required: true
    },
    version: {
        type: Number,
        required: true
    },
    access: {
        type: String, 
        enum: ['private', 'public', 'network'],
        default: 'private',
        required: true
    },
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