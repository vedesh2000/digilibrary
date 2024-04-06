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
        default: 1,
        required: true,
        min: 1,
    },
    subChapterNumber: {
        type: Number,
        default: 1,
        required: true,
        min: 1,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    notesMarkdown: {
        type: String,
        required: true,
    },
    sanitizedNotesMarkdown: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        default: "6482f0496da17c6aa56271e5"
    },
    lastModifiedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    lastOpenedAt: {
        type: Date,
        required: true,
        default: Date.now
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
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        default: "6482f39e7fae6c4d2c3317ee"
    },
    parentType: {
        type: String, 
        enum: ['book', 'thread', 'self'],
        default: 'book',
        required: true
    },
    progress: {
        type: String, 
        enum: ['completed', 'inProgress', 'yetToStart'],
        default: 'yetToStart',
        required: true
    },
    access: {
        type: String, 
        enum: ['private', 'public', 'network'],
        default: 'private',
        required: true
    },
});

chapterSchema.pre('validate' , function (next) {
    if(this.notesMarkdown){
        this.sanitizedNotesMarkdown = domPurify.sanitize(marked.parse(this.notesMarkdown));
    }
    next();
})

const Chapter = mongoose.model('Chapter', chapterSchema);

module.exports = Chapter;
