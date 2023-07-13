const mongoose = require('mongoose')
const {Book} = require("./book")
const publisherSchema = mongoose.Schema({
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
    }
})

publisherSchema.pre('deleteOne', { document: true }, function(next)  {
    Book.find({publisher: this.id})
    .then((books) => {
        // console.log(books.length)
        if(books.length > 0){
            next(new Error('This Publisher still has books'))
        }else{
            next()
        }
    })
    .catch((err) => {
            next(err)
    });
})
module.exports = mongoose.model('Publisher' , publisherSchema)