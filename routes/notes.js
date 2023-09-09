const express = require("express")
// const { Configuration, OpenAIApi } = require("openai");
const isAuth = require("../middleware/is-auth");
// const generateMCQs = require("../controllers/generateMcqs");
const updateRecentSearches = require('../middleware/updateRecentSearches');
const router = express.Router()
const Book = require("../models/book");
const Chapter = require("../models/chapter");
const Author = require("../models/author")
const Publisher = require("../models/publisher")
const User = require("../models/user");
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg']
router.use(express.json());

// Function to convert a string to title case
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }

// Initialize OpenAI API
// const configuration = new Configuration({
//     apiKey: process.env.OPENAI_API_KEY,
//   });
//   const openai = new OpenAIApi(configuration);


//show notes
router.get('/:chapterId', isAuth, async (req, res) => {
    try {
        const chapterObj = await Chapter.findById(req.params.chapterId);
        // console.log("show chapter", chapterObj);
        let parentObj;
        const parentId = chapterObj.parentId;
        //fill other types later
        // if(chapterObj.parentType === 'book')
            parentObj = await Book.findById(parentId)
        // else if chapterObj.parentType === 'thread')
        const user = await User.findById(chapterObj.user)
        if (req.session.email != user.email) {
            res.redirect('/')
            return
        }

        if(chapterObj === null)
            return res.render("books/notes/index", {title: parentObj.title, bookId: parentId , chapters: chapterObj, ownerName: user.username , errorMessage: "Notes not found"});
        // console.log(req.params.bookId);
        return res.render("books/notes/show", {title: parentObj.title, bookId: parentId , chapter: chapterObj , ownerName: user.username});


    } catch (err) {
        console.log(err);
        res.redirect('/')
    }
});
//edit notes
router.get('/:chapterId/edit', isAuth, async (req, res) => {
    try {
        const chapterObj = await Chapter.findById(req.params.chapterId);
        // console.log("show chapter", chapterObj);
        let parentObj;
        const parentId = chapterObj.parentId;
        //fill other types later
        // if(chapterObj.parentType === 'book')
            parentObj = await Book.findById(parentId)
        // else if chapterObj.parentType === 'thread')
        const user = await User.findById(chapterObj.user)
        if (req.session.email != user.email) {
            res.redirect('/')
            return
        }

        if(chapterObj === null)
            return res.render("books/notes/index", {title: parentObj.title, bookId: parentId , chapters: chapterObj, ownerName: user.username , errorMessage: "Notes not found"});
        // console.log(req.params.bookId);
        return res.render("books/notes/edit", {bookId: parentId , chapter: chapterObj , chapterId: req.params.chapterId});


    } catch (err) {
        console.log(err);
        res.redirect('/')
    }
});
//update notes
router.put('/:chapterId/edit', isAuth, async (req, res) => {
    let book
    console.log("Editing notes");
    try {
        let chapterObj = await Chapter.findById(req.params.chapterId);
        // if(chapterObj.parentType === 'book')
        book = await Book.findById(chapterObj.parentId)
        const user = await User.findById(book.user)
        if (req.session.email != user.email) {
            res.redirect('/')
            return
        }
        
        if(chapterObj === null)
        return res.render("books/notes/index", { title: book.title, bookId: req.params.bookId , chapters: book.chapterNotes, errorMessage: "Notes not found Please create New chapter"});
    
    chapterObj.chapterNumber = req.body.chapterNumber;
    chapterObj.subChapterNumber = req.body.chapterNumber;
    chapterObj.title = req.body.title;
    chapterObj.description = req.body.description
    chapterObj.notesMarkdown = req.body.notesMarkdown
        chapterObj.version += 1
        chapterObj.lastModifiedAt = new Date();
        await chapterObj.save();
        
        book.lastModifiedAt = new Date();
        book.version += 1;
        await book.save()
        console.log("Edited notes");
        return res.redirect(`/files/notes/${req.params.chapterId}`)
    }
    //todo catch
    catch (error) {
        console.log(error)
        if (book == null) {
            res.redirect('/')
        } else {
            renderEditPage(req, res, book, true)
        }
    }
})
router.delete('/:chapterId/delete', isAuth, async (req, res) => {
    console.log("Deleting Notes");
    let book;
    try {
        const chapterObj = await Chapter.findById(req.params.chapterId);
        // if(chapterObj.parentType === 'book')
        book = await Book.findById(chapterObj.parentId);
        const user = await User.findById(book.user);
        if (req.session.email !== user.email) {
            res.redirect('/');
            return;
        }
        
        await chapterObj.deleteOne();
        console.log("Deleted Notes");
        book.lastModifiedAt = new Date();
        book.version += 1;
        await book.save();
        console.log("Updated book Notes");
        // if(chapterObj.parentType === 'book')
        res.redirect(`/files/books/${chapterObj.parentId}/notes`);
    } catch (error) {
        console.log(error);
        if (book == null) {
            res.redirect('/');
        } else {
            renderEditPage(req, res, book, true);
        }
    }
});
//new notes post route
router.post('/', isAuth, async (req, res) => {
    let book
    console.log("Creating note");
    try {
        // if(req.body.parentType === 'book')
        book = await Book.findById(req.body.parentId)
        const user = await User.findById(book.user)
        if (req.session.email != user.email) {
            res.redirect('/')
            return
        }
        let chapter = new Chapter({
            chapterNumber: req.body.chapterNumber,
            subChapterNumber: req.body.chapterNumber,
            title: req.body.title,
            description: req.body.description,
            notesMarkdown: req.body.notesMarkdown,
            user: user.id,
            lastModifiedAt: new Date(),
            lastOpenedAt: new Date(),
            createdAt: new Date(),
            version: 1,
            parentType: req.body.parentType,
            parentId: book.id
        })
        const newChapter = await chapter.save();
        console.log("Created note");
        book.lastModifiedAt = new Date();
        book.version += 1;
        await book.save()
        return res.render("books/notes/show", {title: book.title, bookId: book.id , chapter: newChapter , ownerName: user.username});
    }
    catch (error) {
        console.log(error)
        res.render("books/notes/index", { title: book.title, bookId: book.id, chapters: book.chapterNotes, errorMessage: "Error creating notes"})
    }
})
// // generate MCQs page
// router.get('/:bookId/notes/:chapterId/mcqTest', isAuth, async (req, res) => {
//     try {
//         const book = await Book.findById(req.params.bookId)
//         const user = await User.findById(book.user)
//         if (req.session.email != user.email) {
//             res.redirect('/')
//             return
//         }
//         let chapterObj = {}
//         book.chapterNotes.forEach(chapter => {
//             if (chapter.id === req.params.chapterId){
//                 // console.log(chapter);
//                 chapterObj = chapter
//                 return
//             }
//         });
        
//         if(chapterObj === null)
//             return res.render("books/notes/index", { title: book.title, bookId: req.params.bookId , chapters: book.chapterNotes, errorMessage: "Notes not found"});
        
//         console.log(generateMCQs(chapterObj.notesMarkdown , 10));
//         return res.render("books/notes/mcqTest" , {MCQs: generateMCQs(chapterObj.notesMarkdown , 10)});
        

//     } catch (err) {
//         console.log(err);
//         res.redirect('/')
//     }
// });
//chatgpt integration
// router.post("/:bookId/notes/:chapterId/show/generate-prompt", async (req, res) => {
//     const prompt = req.body.prompt;
//     console.log(prompt);
//     try {
//         const completion = await openai.createCompletion({
//             prompt: prompt,
//             model: "text-davinci-003",
//             max_tokens: 100000,
//             n: 1,
//             stop: null,
//             temperature: 0,
//         });
//         const generatedText = completion.data.choices[0].text.trim();
//         console.log(generatedText);
//         res.json({ generatedText });

//         } catch (error) {
//             console.error(error);
//             res.status(500).json({ error: "Failed to generate prompt." });
//         }
//     });


module.exports = router