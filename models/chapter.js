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
        min: 1,
    },
    subChapterNumber: {
        type: Number,
        default: 1,
        min: 1,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    notesMarkdown: {
        type: String,
    },
    sanitizedNotesMarkdown: {
        type: String,
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
        enum: ['book', 'thread', 'post', 'self'],
        default: 'book',
        required: true
    }
});

chapterSchema.pre('validate' , function (next) {
    if(this.notesMarkdown){
        this.sanitizedNotesMarkdown = domPurify.sanitize(marked.parse(this.notesMarkdown));
    }
    next();
})

const Chapter = mongoose.model('Chapter', chapterSchema);

module.exports = Chapter;
