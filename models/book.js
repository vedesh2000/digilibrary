const mongoose = require('mongoose')
const { marked } = require('marked');
const { mangle } = require('marked-mangle');
const { gfmHeadingId  } = require('marked-gfm-heading-id');
const options = {
	prefix: "my-prefix-",
};

marked.use(gfmHeadingId(options));
marked.use(mangle());
marked("# heading");
const createDomPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const domPurify = createDomPurify(new JSDOM().window);


const chapterSchema = new mongoose.Schema({
    chapterNumber: {
        type: Number,
        default:1,
        min:1
    },
    title: {
      type: String,
      required: true
    },
    description: {
        type: String
    },
    notesMarkdown: {
      type: String
    },
    sanitizedNotesMarkdown: {
        type: String
    }
  });

const bookSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: "# This is a Great Book!"
    },
    sanitizedDescription: {
        type: String
    },
    publishDate: {
        type: Date,
        required: true
    },
    chapterNotes: {
        type: [chapterSchema],
        default : [],
        // required: true,
    },
    pageCount: {
        type: Number,
        required: true,
        min: 1
    },
    pagesCompleted: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    percentageCompleted: {
        type: Number,
        required: true,
        default: 0,
        max: 100,
        min: 0
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
        required: true,
        default: 1,
        min: 1
    },
    type: {
        type: String, 
        enum: ['book', 'ebook'],
        default: 'book',
        required: true
    },
    driveLink: {
        type: String
    },
    language: {
        type: String,
        enum: ['english', 'telugu', 'hindi', 'sanskrit'],
        required: true,
        default: 'english'
    },
    progress: {
        type: String, 
        enum: ['completed', 'inProgress', 'yetToStart'],
        default: 'yetToStart',
        required: true
    },
    isFavourite: {
        type: Boolean,
        default: false
    },
    isDailyBook: {
        type: Boolean,
        default: false
    }
})

bookSchema.virtual('coverImagePath').get(function() {
    if(this.coverImage != null && this.coverImageType != null){
        return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
    }
})

bookSchema.pre('validate' , function(next){
    if(this.description){
    this.sanitizedDescription = domPurify.sanitize(marked.parse(this.description));
    }
    next();
})

chapterSchema.pre('validate' , function (next) {
    if(this.notesMarkdown){
        this.sanitizedNotesMarkdown = domPurify.sanitize(marked.parse(this.notesMarkdown));
    }
    next();
})

const Chapter = mongoose.model('Chapter', chapterSchema);
const Book = mongoose.model('Book', bookSchema);

module.exports = {
  Chapter,
  Book
};