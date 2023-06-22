const express = require("express")
const isAuth = require("../middleware/is-auth");
const updateRecentSearches = require('../middleware/updateRecentSearches');
const router = express.Router()
const { Chapter, Book } = require("../models/book");
const Author = require("../models/author")
const User = require("../models/user");
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg']
// all Languages
const allLanguages = [
    'afrikaans',
    'albanian',
    'amharic',
    'arabic',
    'armenian',
    'assamese',
    'azerbaijani',
    'bengali',
    'bosnian',
    'bulgarian',
    'burmese',
    'catalan',
    'chinese',
    'croatian',
    'czech',
    'danish',
    'dutch',
    'english',
    'estonian',
    'finnish',
    'french',
    'georgian',
    'german',
    'greek',
    'gujarati',
    'haitian creole',
    'hebrew',
    'hindi',
    'hungarian',
    'icelandic',
    'indonesian',
    'irish',
    'italian',
    'japanese',
    'kannada',
    'kazakh',
    'khmer',
    'korean',
    'kurdish',
    'kyrgyz',
    'lao',
    'latvian',
    'lithuanian',
    'macedonian',
    'malay',
    'malayalam',
    'maltese',
    'marathi',
    'mongolian',
    'nepali',
    'norwegian',
    'odia',
    'pashto',
    'persian',
    'polish',
    'portuguese',
    'punjabi',
    'romanian',
    'russian',
    'sanskrit',
    'serbian',
    'simplified chinese',
    'sinhala',
    'slovak',
    'slovenian',
    'somali',
    'spanish',
    'swahili',
    'swedish',
    'tamil',
    'telugu',
    'thai',
    'tibetan',
    'traditional chinese',
    'turkish',
    'ukrainian',
    'urdu',
    'uyghur',
    'uzbek',
    'vietnamese',
    'welsh',
    'yoruba',
    'zulu'
  ];
//all Books route
router.get('/', isAuth, async (req, res) => {
    const email = req.session.email;
    const user = await User.findOne({ email })
    const recentSearches = user.recentSearches;
    let searchOptions = { user: user }
    let query = Book.find(searchOptions)
    let booksField = "All Books";
    //adding fuzzy as 2 if req add Levenshtein distance to handle wrong spells
    if (req.query.title != null && req.query.title != '') {
        const fuzzyRegex = new RegExp('.*' + req.query.title.split('').join('.{0,2}') + '.*', 'i');
        query = query.regex('title', fuzzyRegex);
        // No need to wait here as it may happen in the backend...?
        updateRecentSearches(email, req.query.title);
      }
    //adding fuzzy as 2 if req add Levenshtein distance to handle wrong spells
    if (req.query.description != null && req.query.description != '') {
        const fuzzyRegex = new RegExp('.*' + req.query.description.split('').join('.{0,2}') + '.*', 'i');
        query = query.regex('description', fuzzyRegex);
      }
      
    if (req.query.percentageCompleted != null && req.query.percentageCompleted != '')
        query = query.gte('percentageCompleted', req.query.percentageCompleted/100)
    if (req.query.publishedBefore != null && req.query.publishedBefore != '')
        query = query.lte('publishDate', req.query.publishedBefore)
    if (req.query.publishedAfter != null && req.query.publishedAfter != '')
        query = query.gte('publishDate', req.query.publishedAfter)
    if (req.query.language != null && req.query.language != '')
        query = query.where('language').equals(req.query.language);
    if (req.query.type != null && req.query.type != '')
        query = query.where('type').equals(req.query.type);
    if (req.query.progress != null && req.query.progress != '')
        query = query.where('progress').equals(req.query.progress);

    const sortBy = req.query.sortBy;
    const sort = req.query.sort;
    try {
        let pageNumber = parseInt(req.query.page) || 1; // Get the requested page number from the query string
        const pageSize = 20; // Number of items to load per page
        let sortOptions = {};
        sortOptions[sortBy] = sort;
        const queryResult = await query.sort(sortOptions).exec();
        const books = queryResult;
        let filteredBooks = books;
        if (req.query.notes != null && req.query.notes != '') {
            let queryChapters = [];
            for (const book of queryResult) {
                queryChapters = queryChapters.concat(book.chapterNotes);
            }

            queryChapters = queryChapters.filter(query => {
              const fuzzyRegex = new RegExp('.*' + req.query.notes.split('').join('.{0,2}') + '.*', 'i');
              return fuzzyRegex.test(query.notesMarkdown) || fuzzyRegex.test(query.description);
            });

            filteredBooks = books.filter(book => {
                const bookChapters = book.chapterNotes;
                return bookChapters.some(chapter => queryChapters.includes(chapter));
            });
          }

          filteredBooks = filteredBooks.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
        res.render('books/index', {
            books: filteredBooks,
            booksField: booksField,
            searchOptions: req.query,
            sortBy: sortBy,
            sort: sort,
            filterToggle: req.query.filterToggle,
            recentSearches: recentSearches,
            current: pageNumber, 
            pages: Math.ceil(queryResult.length / pageSize),
            allLanguages: allLanguages
        })
    }
    catch(err) {
        console.log(err);
        res.redirect('/')
    }
});
//all favourite Books route
router.get('/favourites', isAuth, async (req, res) => {
    const email = req.session.email;
    const user = await User.findOne({ email })
    const recentSearches = user.recentSearches;
    let searchOptions = { user: user , isFavourite: true}
    let query = Book.find(searchOptions)
    let booksField = "Favourite Books";
    //adding fuzzy as 2 if req add Levenshtein distance to handle wrong spells
    if (req.query.title != null && req.query.title != '') {
        const fuzzyRegex = new RegExp('.*' + req.query.title.split('').join('.{0,2}') + '.*', 'i');
        query = query.regex('title', fuzzyRegex);
        // No need to wait here as it may happen in the backend...?
        updateRecentSearches(email, req.query.title);
      }
    //adding fuzzy as 2 if req add Levenshtein distance to handle wrong spells
    if (req.query.description != null && req.query.description != '') {
        const fuzzyRegex = new RegExp('.*' + req.query.description.split('').join('.{0,2}') + '.*', 'i');
        query = query.regex('description', fuzzyRegex);
      }
      
    if (req.query.percentageCompleted != null && req.query.percentageCompleted != '')
        query = query.gte('percentageCompleted', req.query.percentageCompleted/100)
    if (req.query.publishedBefore != null && req.query.publishedBefore != '')
        query = query.lte('publishDate', req.query.publishedBefore)
    if (req.query.publishedAfter != null && req.query.publishedAfter != '')
        query = query.gte('publishDate', req.query.publishedAfter)
    if (req.query.language != null && req.query.language != '')
        query = query.where('language').equals(req.query.language);
    if (req.query.type != null && req.query.type != '')
        query = query.where('type').equals(req.query.type);
    if (req.query.progress != null && req.query.progress != '')
        query = query.where('progress').equals(req.query.progress);

    const sortBy = req.query.sortBy;
    const sort = req.query.sort;
    try {
        let pageNumber = parseInt(req.query.page) || 1; // Get the requested page number from the query string
        const pageSize = 20; // Number of items to load per page
        let sortOptions = {};
        sortOptions[sortBy] = sort;
        const queryResult = await query.sort(sortOptions).exec();
        const books = queryResult;
        let filteredBooks = books;
        if (req.query.notes != null && req.query.notes != '') {
            let queryChapters = [];
            for (const book of queryResult) {
                queryChapters = queryChapters.concat(book.chapterNotes);
            }

            queryChapters = queryChapters.filter(query => {
              const fuzzyRegex = new RegExp('.*' + req.query.notes.split('').join('.{0,2}') + '.*', 'i');
              return fuzzyRegex.test(query.notesMarkdown) || fuzzyRegex.test(query.description);
            });

            filteredBooks = books.filter(book => {
                const bookChapters = book.chapterNotes;
                return bookChapters.some(chapter => queryChapters.includes(chapter));
            });
          }

          filteredBooks = filteredBooks.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
        res.render('books/index', {
            books: filteredBooks,
            booksField: booksField,
            searchOptions: req.query,
            sortBy: sortBy,
            sort: sort,
            filterToggle: req.query.filterToggle,
            recentSearches: recentSearches,
            current: pageNumber, 
            pages: Math.ceil(queryResult.length / pageSize),
            allLanguages: allLanguages
        })
    }
    catch(err) {
        console.log(err);
        res.redirect('/')
    }
});

//all daily Books route
router.get('/dailyBooks', isAuth, async (req, res) => {
    const email = req.session.email;
    const user = await User.findOne({ email })
    const recentSearches = user.recentSearches;
    let searchOptions = { user: user , isDailyBook: true}
    let query = Book.find(searchOptions)
    let booksField = "Dialy Books";
    //adding fuzzy as 2 if req add Levenshtein distance to handle wrong spells
    if (req.query.title != null && req.query.title != '') {
        const fuzzyRegex = new RegExp('.*' + req.query.title.split('').join('.{0,2}') + '.*', 'i');
        query = query.regex('title', fuzzyRegex);
        // No need to wait here as it may happen in the backend...?
        updateRecentSearches(email, req.query.title);
      }
    //adding fuzzy as 2 if req add Levenshtein distance to handle wrong spells
    if (req.query.description != null && req.query.description != '') {
        const fuzzyRegex = new RegExp('.*' + req.query.description.split('').join('.{0,2}') + '.*', 'i');
        query = query.regex('description', fuzzyRegex);
      }
      
    if (req.query.percentageCompleted != null && req.query.percentageCompleted != '')
        query = query.gte('percentageCompleted', req.query.percentageCompleted/100)
    if (req.query.publishedBefore != null && req.query.publishedBefore != '')
        query = query.lte('publishDate', req.query.publishedBefore)
    if (req.query.publishedAfter != null && req.query.publishedAfter != '')
        query = query.gte('publishDate', req.query.publishedAfter)
    if (req.query.language != null && req.query.language != '')
        query = query.where('language').equals(req.query.language);
    if (req.query.type != null && req.query.type != '')
        query = query.where('type').equals(req.query.type);
    if (req.query.progress != null && req.query.progress != '')
        query = query.where('progress').equals(req.query.progress);

    const sortBy = req.query.sortBy;
    const sort = req.query.sort;
    try {
        let pageNumber = parseInt(req.query.page) || 1; // Get the requested page number from the query string
        const pageSize = 20; // Number of items to load per page
        let sortOptions = {};
        sortOptions[sortBy] = sort;
        const queryResult = await query.sort(sortOptions).exec();
        const books = queryResult;
        let filteredBooks = books;
        if (req.query.notes != null && req.query.notes != '') {
            let queryChapters = [];
            for (const book of queryResult) {
                queryChapters = queryChapters.concat(book.chapterNotes);
            }

            queryChapters = queryChapters.filter(query => {
              const fuzzyRegex = new RegExp('.*' + req.query.notes.split('').join('.{0,2}') + '.*', 'i');
              return fuzzyRegex.test(query.notesMarkdown) || fuzzyRegex.test(query.description);
            });

            filteredBooks = books.filter(book => {
                const bookChapters = book.chapterNotes;
                return bookChapters.some(chapter => queryChapters.includes(chapter));
            });
          }

          filteredBooks = filteredBooks.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
        res.render('books/index', {
            books: filteredBooks,
            booksField: booksField,
            searchOptions: req.query,
            sortBy: sortBy,
            sort: sort,
            filterToggle: req.query.filterToggle,
            recentSearches: recentSearches,
            current: pageNumber, 
            pages: Math.ceil(queryResult.length / pageSize),
            allLanguages: allLanguages
        })
    }
    catch(err) {
        console.log(err);
        res.redirect('/')
    }
});

// new Book route
router.get('/new', isAuth, async (req, res) => {
    renderNewPage(req, res, new Book())
});
//show book route
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('author').exec()
        const user = await User.findById(book.user)
        if (req.session.email != user.email) {
            res.redirect('/')
            console.log("Invalid user accessed Book");
            return
        }
        book.lastOpenedAt = new Date();
        await book.save()
        res.render('books/show', { book: book })
    } catch (err) {
        console.log(err);
        res.redirect('/')
    }
});
//Edit book route
router.get('/:id/edit', isAuth, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        const user = await User.findById(book.user)
        if (req.session.email != user.email) {
            res.redirect('/')
            return
        }
        renderEditPage(req, res, book)
    } catch {
        res.redirect('/')
    }
});
//Open all notes route
router.get('/:id/notes', isAuth, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        const user = await User.findById(book.user)
        if (req.session.email != user.email) {
            res.redirect('/')
            return
        }
        let queryChapters = book.chapterNotes;
        //adding fuzzy as 2 if req add Levenshtein distance to handle wrong spells
        if (req.query.notes != null && req.query.notes != '') {
        queryChapters = queryChapters.filter(query => {
            const fuzzyRegex = new RegExp('.*' + req.query.notes.split('').join('.{0,2}') + '.*', 'i');
            return fuzzyRegex.test(query.notesMarkdown) || fuzzyRegex.test(query.description);
        });
        }
        const sortedNotes = queryChapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
        res.render("books/notes/index", {title: book.title, bookId: book.id, chapters: sortedNotes , searchOptions: req.query });
    } catch(err) {
        console.log(err);
        res.redirect('/')
    }
});
//new notes route
router.get('/:id/notes/new', isAuth, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        const user = await User.findById(book.user)
        if (req.session.email != user.email) {
            res.redirect('/')
            return
        }
        const largestChapterNumber = book.chapterNotes.reduce((maxChapterNumber, chapter) => {
            return chapter.chapterNumber > maxChapterNumber ? chapter.chapterNumber : maxChapterNumber;
        }, 0);
        // console.log(largestChapterNumber);
        res.render("books/notes/new", {bookId: req.params.id, chapter: new Chapter({chapterNumber: largestChapterNumber+1})});

    } catch (err) {
        console.log(err);
        res.redirect('/')
    }
});
//show notes
router.get('/:bookId/notes/:chapterId/show', isAuth, async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId)
        const user = await User.findById(book.user)
        if (req.session.email != user.email) {
            res.redirect('/')
            return
        }
        let chapterObj = {}
        book.chapterNotes.forEach(chapter => {
            if (chapter.id === req.params.chapterId){
                // console.log(chapter);
                chapterObj = chapter;
                return 
            }
        });

        if(chapterObj === null)
            return res.render("books/notes/index", {title: book.title, bookId: req.params.bookId , chapters: book.chapterNotes, errorMessage: "Notes not found"});

        return res.render("books/notes/show", {bookId: req.params.bookId , chapter: chapterObj});


    } catch (err) {
        console.log(err);
        res.redirect('/')
    }
});
//edit notes
router.get('/:bookId/notes/:chapterId/edit', isAuth, async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId)
        const user = await User.findById(book.user)
        if (req.session.email != user.email) {
            res.redirect('/')
            return
        }
        let chapterObj = {}
        book.chapterNotes.forEach(chapter => {
            if (chapter.id === req.params.chapterId){
                // console.log(chapter);
                chapterObj = chapter
                return
            }
        });
        
        if(chapterObj === null)
            return res.render("books/notes/index", { title: book.title, bookId: req.params.bookId , chapters: book.chapterNotes, errorMessage: "Notes not found"});
        
        return res.render("books/notes/edit", {bookId: req.params.bookId , chapter: chapterObj});
        

    } catch (err) {
        console.log(err);
        res.redirect('/')
    }
});
//update notes
router.put('/:bookId/notes/:chapterId/edit', isAuth, async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.bookId)
        const user = await User.findById(book.user)
        if (req.session.email != user.email) {
            res.redirect('/')
            return
        }
        let chapterObj = {}
        book.chapterNotes.forEach(chapter => {
            if (chapter.id === req.params.chapterId){
                // console.log(chapter);
                chapter.chapterNumber = req.body.chapterNumber;
                chapter.title = req.body.title;
                chapter.description = req.body.description
                chapter.notesMarkdown = req.body.notesMarkdown
                chapterObj = chapter
                return
            }
        });
        
        if(chapterObj === null)
            return res.render("books/notes/index", { title: book.title, bookId: req.params.bookId , chapters: book.chapterNotes, errorMessage: "Notes not found Please create New chapter"});
        
        book.lastModifiedAt = new Date();
        book.version += 1;
        await book.save()
        res.redirect(`/files/books/${req.params.bookId}/notes/${req.params.chapterId}/show`)
    }
    catch (error) {
        console.log(error)
        if (book == null) {
            res.redirect('/')
        } else {
            renderEditPage(req, res, book, true)
        }
    }
})
//Update book
router.put('/:id', isAuth, async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        const user = await User.findById(book.user)
        if (req.session.email != user.email) {
            res.redirect('/')
            return
        }
    let publishDate = new Date();
    let driveLink = ''
    let pagesCompleted = 0;
    let percentageCompleted = 0;
    if (req.body.publishDate) {
        publishDate = req.body.publishDate
    }
    if(req.body.type === "ebook" && req.body.driveLink){
        driveLink = req.body.driveLink
    }
    if(req.body.progress === "inProgress"){
        if(req.body.pagesCompleted > 0 && req.body.pagesCompleted < req.body.pageCount){
            pagesCompleted = req.body.pagesCompleted;
            percentageCompleted = req.body.pagesCompleted/req.body.pageCount;
        } else if(req.body.pagesCompleted >= req.body.pageCount){
            
            pagesCompleted = req.body.pageCount-1;
            percentageCompleted = pagesCompleted/req.body.pageCount;
        } else {
            pagesCompleted = 1;
            percentageCompleted = pagesCompleted/req.body.pageCount;
        }
    } else if(req.body.progress === "completed"){
        pagesCompleted = req.body.pageCount;
        percentageCompleted = 100;
    } else {
        pagesCompleted = 0;
        percentageCompleted = 0;
    }
        book.title = req.body.title
        book.author = req.body.author
        book.type = req.body.type
        book.progress = req.body.progress
        book.driveLink = driveLink
        book.publishDate = new Date(publishDate)
        book.pageCount = req.body.pageCount
        book.copies = req.body.copies
        book.pagesCompleted = pagesCompleted
        book.percentageCompleted = Math.round(percentageCompleted * 100) / 100
        book.language = req.body.language
        book.description = req.body.description
        book.lastModifiedAt = new Date()
        book.version += 1
        if (req.body.cover != null && req.body.cover !== '') {
            saveCover(book, req.body.cover)
        }
        await book.save()
        res.redirect(`/files/books/${book.id}`)
    }
    catch (error) {
        console.log(error)
        if (book == null) {
            res.redirect('/')
        } else {
            renderEditPage(req, res, book, true)
        }
    }
})
//delete notes
router.delete('/:bookId/notes/:chapterId/delete', isAuth, async (req, res) => {
    let book;
    try {
        book = await Book.findById(req.params.bookId);
        const user = await User.findById(book.user);
        if (req.session.email !== user.email) {
            res.redirect('/');
            return;
        }
        
        const chapterIndex = book.chapterNotes.findIndex((chapter) => chapter.id === req.params.chapterId);
        if (chapterIndex === -1) {
            return res.render("books/notes/index", { title: book.title, bookId: req.params.bookId, chapters: book.chapterNotes, errorMessage: "Chapter not found" });
        }

        book.chapterNotes.splice(chapterIndex, 1); // Remove the chapter from the array
        book.lastModifiedAt = new Date();
        book.version += 1;
        await book.save();
        res.redirect(`/files/books/${req.params.bookId}/notes`);
    } catch (error) {
        console.log(error);
        if (book == null) {
            res.redirect('/');
        } else {
            renderEditPage(req, res, book, true);
        }
    }
});
// delete all books
router.delete('/deleteAll', isAuth, async (req, res) => {
    const email = req.session.email;
    const user = await User.findOne({ email })
    let book
    try {
        await Book.deleteMany({ user: user })
        res.redirect('/files/books')
    }
    catch (error) {
        console.log(error)
        if (book != null) {
            res.render(`books/show`, {
                book: book,
                errorMessage: 'Could not remove Books'
            })
        } else {
            res.redirect('/files/books')
        }
    }
})
//delete book
router.delete('/:id', isAuth, async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        const user = await User.findById(book.user)
        if (req.session.email != user.email) {
            res.redirect('/')
            return
        }
        await book.deleteOne()
        res.redirect('/files/books')
    }
    catch (error) {
        console.log(error)
        if (book != null) {
            res.render(`books/show`, {
                book: book,
                errorMessage: 'Could not remove Book'
            })
        } else {
            res.redirect('/files/books')
        }
    }
})
//new book route
router.post('/', isAuth, async (req, res) => {
    const email = req.session.email
    //publish date check
    let publishDate = new Date();
    let driveLink = ''
    let pagesCompleted = 0;
    let percentageCompleted = 0;
    if (req.body.publishDate) {
        publishDate = req.body.publishDate
    }
    if(req.body.type === "ebook" && req.body.driveLink){
        driveLink = req.body.driveLink
    }
    if(req.body.progress === "inProgress"){
        if(req.body.pagesCompleted > 0 && req.body.pagesCompleted < req.body.pageCount){
            pagesCompleted = req.body.pagesCompleted;
            percentageCompleted = req.body.pagesCompleted/req.body.pageCount;
        } else if(req.body.pagesCompleted >= req.body.pageCount){
            
            pagesCompleted = req.body.pageCount-1;
            percentageCompleted = pagesCompleted/req.body.pageCount;
        } else {
            pagesCompleted = 1;
            percentageCompleted = pagesCompleted/req.body.pageCount;
        }
    } else if(req.body.progress === "completed"){
        pagesCompleted = req.body.pageCount;
        percentageCompleted = 100;
    } else {
        pagesCompleted = 0;
        percentageCompleted = 0;
    }

    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        type: req.body.type,
        language: req.body.language,
        pagesCompleted: pagesCompleted,
        percentageCompleted: Math.round(percentageCompleted * 100) / 100,
        driveLink: driveLink,
        progress: req.body.progress,
        publishDate: publishDate,
        pageCount: req.body.pageCount,
        copies: req.body.copies,
        description: req.body.description,
        user: await User.findOne({ email }),
        lastModifiedAt: new Date(),
        lastOpenedAt: new Date(),
        createdAt: new Date(),
        version: 1
    })
    if (req.body.cover)
        saveCover(book, req.body.cover)
    try {
        const newBook = await book.save()
        res.redirect(`books/${newBook.id}`)
    }
    catch (error) {
        console.log(error)
        renderNewPage(req, res, book, true)
    }
})
//new notes post route
router.post('/:id/newNotes', isAuth, async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        const user = await User.findById(book.user)
        if (req.session.email != user.email) {
            res.redirect('/')
            return
        }
        let chapter = new Chapter({
            chapterNumber: req.body.chapterNumber,
            title: req.body.title,
            description: req.body.description,
            notesMarkdown: req.body.notesMarkdown
        })
        book.chapterNotes.push(chapter);
        book.lastModifiedAt = new Date();
        book.version += 1;
        await book.save()
        res.redirect('notes')
    }
    catch (error) {
        console.log(error)
        res.render("books/notes/index", { title: book.title, bookId: book.id, chapters: book.chapterNotes, errorMessage: "Error creating notes"})
    }
})
//add to favorites
router.post('/:id/addOrRemoveFav', isAuth, async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        const user = await User.findById(book.user)
        if (req.session.email != user.email) {
            res.redirect('/')
            return
        }
        
        book.isFavourite = !(book.isFavourite);
        book.lastModifiedAt = new Date();
        book.version += 1;
        await book.save()
        res.render("books/show", { book: book});
    }
    catch (error) {
        console.log(error)
        res.render("books/show", { book: book, errorMessage: "Error adding to Favourites"})
    }
})
//add to dailybook
router.post('/:id/addOrRemoveDailyReadBook', isAuth, async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        const user = await User.findById(book.user)
        if (req.session.email != user.email) {
            res.redirect('/')
            return
        }
        
        book.isDailyBook = !(book.isDailyBook);
        book.lastModifiedAt = new Date();
        await book.save()
        res.render("books/show", { book: book});
    }
    catch (error) {
        console.log(error)
        res.render("books/show", { book: book, errorMessage: "Error adding to dailyReadbooks"})
    }
})
async function renderNewPage(req, res, book, hasError = false) {
    renderFormPage(req, res, book, 'new', hasError)
}
async function renderEditPage(req, res, book, hasError = false) {
    renderFormPage(req, res, book, 'edit', hasError)
}
async function renderFormPage(req, res, book, form, hasError = false) {
    const email = req.session.email
    try {
        const user = await User.findOne({ email })
        const authors = await Author.find({ user: user }).sort({ name: 1 })
        const params = {
            authors: authors,
            book: book,
            allLanguages: allLanguages
        }
        if (hasError) {
            if (form === 'edit')
                params.errorMessage = 'Error Updating book'
            else if (form === 'new')
                params.errorMessage = 'Error Creating book'
            else
                params.errorMessage = 'Error'
        }
        res.render(`books/${form}`, params)
    }
    catch {
        res.redirect('/books')
    }
}
function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}
module.exports = router

