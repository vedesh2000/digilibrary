const mongoose = require('mongoose')
const coverImageBasePath = 'uploads/bookCovers'
const path = require('path')
const bookSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    publishDate: {
        type: Date,
        required: true
    },
    pageCount: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    coverImage: {
        type: Buffer
    },
    coverImageType: {
        type: String
    },
    // file: {
    //     type: Buffer,
    //     required: true
    // },
    // fileType: {
    //     type: Buffer,
    //     required: true
    // },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Author'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
})

bookSchema.virtual('coverImagePath').get(function() {
    if(this.coverImage != null && this.coverImageType != null){
        return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
    }
})
// bookSchema.pre('deleteMany' , {document: true}, function(next) {
//     console.log("Deleted all Books")
//     next()
// })
module.exports = mongoose.model('Book' , bookSchema)