console.log('NODE_ENV:', process.env.NODE_ENV);
  require('dotenv').config({ path: require('find-config')('.env') })
const connectDB = require("../config/db");
const Book = require("../models/book");
const Chapter = require("../models/chapter");
connectDB();

async function migrateNotes() {
  try {
    const allBooks = await Book.find({}).lean(); // Use the .lean() method to return plain JavaScript objects

    for (const book of allBooks) {
      if (book.chapterNotes && book.chapterNotes.length > 0) {
        const chapterNotes = book.chapterNotes.map((noteObj) => {
          return {
            chapterNumber: noteObj.chapterNumber,
            subChapterNumber: 1,
            title: noteObj.title,
            description: noteObj.description,
            notesMarkdown: noteObj.notesMarkdown,
            parentType: 'book',
            parentId: book._id,
            user: book.user
          };
        });

        // Create separate notes objects and save them in the database
        const notePromises = chapterNotes.map(async (note) => {
          const newNote = new Chapter(note);
          await newNote.save();
          console.log("Created new chapter " +  newNote._id   + " for book " + book.title );
        });

        await Promise.all(notePromises);
      

        console.log(`Migrated notes for book ${book.title}`);
      }
    }
  } catch (error) {
    console.error("Error while migrating notes:", error);
  }
}

migrateNotes();
