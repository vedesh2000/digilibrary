const mongoose = require('mongoose');
const Author = require("./author")
const Book = require("./book")
const Schema = mongoose.Schema;
const userSchema = new Schema({
  googleId: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: false, // set to false to make username not unique
  },
  password: {
    type: String,
    required: false,
    default: null
  },
  status: {
    type: String, 
    enum: ['Pending', 'Active'],
    default: 'Pending'
  },
  confirmationCode: { 
    type: String, 
    unique: true 
  },
  createdAt: {
    type: Date,
    required: true
  },
  lastOpenedAt: {
    type: Date,
    required: true
  },
  recentSearches: {
    type: [{ type: String }],
    default: [],
  },
  plan: {
    type: String, 
    enum: ['Basic', 'Premium'],
    default: 'Basic'
  },
  subscribedAt: {
    type: Date
  },
  coverImage: {
    type: Buffer
  },
  coverImageType: {
      type: String
  }
});

userSchema.pre('deleteOne', { document: true }, function(next)  {
  // if(req.session.user != this.user) return
  Author.find({user: this.id})
  .then((authors) => {
      // console.log(authors.length)
      if(authors.length > 0){
          next(new Error('This user still has authors'))
      }else{
        Book.find({user: this.id})
        .then((books) => {
            // console.log(books.length)
            if(books.length > 0){
                next(new Error('This user still has books'))
            }else{
                next()
            }
        })
        .catch((err) => {
                next(err)
        });
      }
  })
  .catch((err) => {
          next(err)
  });
})

userSchema.virtual('coverImagePath').get(function() {
  if(this.coverImage != null && this.coverImageType != null){
      return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
  }
})

module.exports = mongoose.model('User' , userSchema)
