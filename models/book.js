const mongoose = require('mongoose')
const bookSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: "This is a Great Book!"
    },
    publishDate: {
        type: Date,
        required: true
    },
    pageCount: {
        type: Number,
        required: true
    },
    coverImage: {
        type: Buffer
    },
    coverImageType: {
        type: String
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Author'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    version: {
        type: Number,
        required: true
    },
    type: {
        type: String, 
        enum: ['book', 'ebook'],
        default: 'book'
    },
    driveLink: {
        type: String
    },
    progress: {
        type: String, 
        enum: ['completed', 'inProgress', 'yetToStart'],
        default: 'yetToStart'
    }
})

bookSchema.virtual('coverImagePath').get(function() {
    if(this.coverImage != null && this.coverImageType != null){
        return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
    }
})


module.exports = mongoose.model('Book' , bookSchema)