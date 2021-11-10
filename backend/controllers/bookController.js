// Import express so we can create routes in this file
const express = require('express')
// Import fs so I can work with files in the file directory
const fs = require('fs')

const router = express.Router()

// Import express validation middleware
const { param, body, validationResult } = require('express-validator')

// Import book model so I can query the database from this file
const bookModel = require('../models/bookModel')
// Import bookAuthor model so I can search for books with author data included
const bookAuthorModel = require('../models/bookAuthorModel')
// Import bookAuthorLog model so I can get all book related information in one object
const bookAuthorLogModel = require('../models/bookAuthorLogModel')
// Import logging model so we can log when books are added or changed
const loggingModel = require('../models/loggingModel')

//--------------------- Define Validation Criteria ---------------------//

// Set out validation criteria for fields common to add/update book
// Sanitise all fields which will conceivably be displayed in future
// using trim to remove leading and trailing white space and escape
// to convert executable code into a safe form
const validateCommon = [
    // bookTitle
    body('bookTitle').exists(checkFalsy = true).withMessage("Exists")
        .matches("[A-Za-z0-9 ,:']").withMessage("Pattern")
        .isLength({min:2, max:100}).withMessage("Length")
        .trim()
        .escape(),
    // originalTitle
    body('originalTitle').exists(checkFalsy = true).withMessage("Exists")
        .matches("[A-Za-z0-9 ,:']").withMessage("Pattern")
        .isLength({min:1, max:100}).withMessage("Length")
        .trim()
        .escape(),
    // authorID
    body('authorID').exists(checkFalsy = true).withMessage("Exists")
        .isInt().withMessage("Type: INT")
        .isLength({min:1, max:10}).withMessage("Length")
        .trim(),
    // yearPublished
    body('yearPublished').exists(checkFalsy = true).withMessage("Exists")
        .isLength({min:1, max:4}).withMessage("Length")
        .isInt().withMessage("Type: INT")
        .trim(),
    // genre
    body('genre').exists(checkFalsy = true).withMessage("Exists")
        .isIn([
            "novel",
            "historical-fiction",
            "fantasy-adventure",
            "fantasy-fiction",
            "mystery",
            "high-fantasy",
            "fiction",
            "fantasy"
        ]).withMessage("In List")
        .trim(),
    // millionsSold
    body('millionsSold').exists().withMessage("Exists")
        .isInt().withMessage("Type: INT")
        .isLength({min: 1, max: 5}).withMessage("Length")
        .trim(),
    // originalLanguage
    body('originalLanguage').exists(checkFalsy = true).withMessage("Exists")
        .isAlpha().withMessage("Type: ALPHA")
        .isLength({min: 3, max: 50}).withMessage("Length")
        .trim()
        .escape()
]

// Set out validation criteria specific to add book
const validateAddBook = [
    // coverImagePath
    body('coverImagePath').exists(checkFalsy = true).withMessage("Exists")
        .matches("frontend/cover-images/[0-9]{2,100}.[jpg|jpeg|png]").withMessage("Pattern")
        .isLength({min:2, max:150}).withMessage("Length")
        .trim(),
]

// Set out validation criteria specific to update book
const validateUpdateBook = [
    // coverImagePath
    body('coverImagePath').exists(checkFalsy = true).withMessage("Exists")
        .if(value => value !== "").withMessage("Condition")
        .matches("frontend/cover-images/[0-9]{2,100}.[jpg|jpeg|png]").withMessage("Pattern")
        .isLength({min:2, max:150}).withMessage("Length")
        .trim(),
]

// Set out validation criteria for user id in req.params
const validateParamBookId = [
    // Sanitise id parameter - only accept numbers
    param('id').exists(checkFalsy = true).withMessage("Exists")
        .isInt().withMessage("Type: INT")
        .trim()
]

// Set out validation criteria for user id in body
const validateBodyBookId = [
    // Sanitise id parameter - only accept numbers
    body('authorID').exists(checkFalsy = true).withMessage("Exists")
        .isInt().withMessage("Type: INT")
        .trim()
]

// Set out validation criteria for book title search
const validateSearchBookTitle = [
    // Sanitise user input - only accept [A-Za-z'.- ]
    param('input').exists(checkFalsy = true).withMessage("Exists")
        .matches("[A-Za-z',\\- ]").withMessage("Pattern")
        .isLength({min:0, max:100}).withMessage("Length")
        .trim()
        .escape()
]


//--------------------- Define Routes ---------------------//

// GET /api/books - get all books
router.get('/books', (req,res) => {
    // No incoming data to sanitise. Just go query the database
    bookModel.getAllBooks()
        .then(result => {
            // Check if there are any results
            if(result.length > 0){
                // We have books, send response
                res.status(200).json(result)
            } else {
                // No books to display
                res.status(404).json("No books found")
            }
        })
        .catch(error => {
            // Database returned an error, log it to server console and respond
            console.log(error)
            res.status(500).json("query error")
        })
})

// GET /api/books/list - return all books with author and chagelog data
router.get('/books/list', (req,res) => {
    // No input to validate, just query the database
    bookAuthorLogModel.getAllBooksWithAuthorsAndLogs()
        .then(results => {
            // Check that the database returned results
            if(results.length > 0){
                // We have results, modify data to correct format
                let books = results
                
                for(book of books){
                    // Modify cover image path to the form needed
                    book.coverImagePath = book.coverImagePath.split('/')[2]
                    // Convert date created to date time
                    book.dateCreated = new Date(Number(book.dateCreated)).toLocaleString()
                    // Convert date changed to date time if not null
                    if(book.dateChanged != null){
                        book.dateChanged = new Date(Number(book.dateChanged)).toLocaleString()
                    } else {
                        book.dateChanged = ''
                    }
                }
                // Respond with results
                
                res.status(200).json({
                    "status": "success",
                    "books": results
                })
            } else {
                // No results, respond with not found
                res.status(404).json({
                    "status": "failed",
                    "message": "No books found"
                })
            }
        })
        .catch(error => {
            // Database threw an error, log error and respond with server error
            console.log(error)
            res.status(500).json({
                "status": "error",
                "message": "query error"
            })
        })
})

// GET /api/books/:id - get book by id
router.get('/books/:id', validateParamBookId, (req,res) => {
    const bookID = req.params.id

    // Check for validation errors
    const error = validationResult(req)
    if(!error.isEmpty()){
        // There is a validation error - respond with bad request
        return res.status(400).json({ error: error.array()})
    }

    // Query the database
    bookModel.getBookById(bookID)
        .then(result => {
            // Check if there are any results
            if(result.length > 0){
                // We have a result, respond with id
                res.status(200).json(result)
            } else {
                // No results returned, respond with not found
                res.status(404).json("no book found with id: " + bookID)
            }
        })
        .catch(error => {
            // Database returned an error, log to server console and respond
            console.log(error)
            res.status(500).json("query error")
        })
})

// GET /api/books/search/:input
router.get('/books/search/:input', validateSearchBookTitle, (req,res) => {
    // Get input data from request parameter
    const input = req.params.input
    
    // Check for validation errors
    const error = validationResult(req)
    if(!error.isEmpty()){
        // There is a validation error, respond with bad request
        return res.status(400).json({error: error.array()})
    }

    // Query the database
    bookAuthorModel.searchBooksWithAuthors(input)
        .then(result => {
            // Check if there are any results
            if(result.length > 0){
                // We have results, respond with 200
                res.status(200).json(result)
            } else {
                // There were no matches, respond with 404
                res.status(404).json('no results')
            }
        })
        .catch(error => {
            // Database returned an error, log error and respond with 500
            console.log(error)
            res.status(500).json("query error")
        })
})

// POST /api/books/cover - save cover image to file system
router.post('/books/cover', (req,res) => {
    // Check if a file has actually been received
    if(!req.files){
        // No file, respond with 400
        res.status(400).json("no file detected")
    } else {
        // Get file data
        let file = req.files.file
        
        // Check file type
        let fileExtension = file.name.split('.')[1]
        const allowedExtensions = ["png", "jpg", "jpeg"]

        if(!allowedExtensions.includes(fileExtension)){
            // Wrong file type, respond with bad request
            return res.status(400).json({error: "invalid file type"})
        }

        // Save file to file system
        file.mv('./frontend/cover-images/' + file.name, (error) => {
            // Check if there were any file upload errors
            if(error){
                // There was an upload error, log error and respond with server error
                console.log(error)
                res.status(500).json(error)
            } else {
                // File upload successful, respond with 200 OK
                res.status(200).json({
                    "status": "success",
                    "message": "file upload successful"
                })
            }
        })
    }
})

// POST /api/books/add - add book to db
router.post('/books/add', validateCommon, validateAddBook, (req,res) => {
    // Get form data from request body
    let book = req.body

    // Check for validation errors
    const error = validationResult(req)
    if(!error.isEmpty()){
        // There is a validation error, respond with bad request
        return res.status(400).json({error: error.array()})
    }
    
    // run add book query from book model
    bookModel.addBook(book)
        .then(result => {
            // Respond with id
            res.status(200).json({
                "status": "Book added to database with id: " + result.insertId,
                "bookID": result.insertId
            })
            // Return insertId and logged in userID to pass as input to logging query
            return [result.insertId, req.session.user.userID]
        })
        // Run logging query
        .then(loggingModel.logBookAdd)
        .then(results => {
            // Check that logging was successful
            if(!results.insertId){
                // Logging failed, log failure
                console.log("failed to log addition of book")
            } else {
                // Logging successful, log to console
                console.log("-- Log: New book added to database")
            }
        })
        .catch(error => {
            // Database returned an error, log error and respond with 500
            console.log(error)
            return res.status(500).json("query error")
        })
})

// PATCH /api/books/:id update book
router.patch('/books/update', validateCommon, validateUpdateBook, validateBodyBookId, (req,res) => {
    // Get form data from request body
    let book = req.body

    // Check for validation errors
    const error = validationResult(req)
    if(!error.isEmpty()){
        // There was a validartion error, respond with bad request
        return res.status(400).json({error: error.array()})
    }

    // If no new file - set req. coverImagePath to path in db
    // If new file - check that new file type === old file type (db coverImagePath)

    // Delete the existing cover image file if the extension of the new file is different
    // Get existing book details
    let bookDetailsBeforeUpdate = {}
    // Query the database for existing details
    bookModel.getBookById(book.bookID)
        .then(results => {
            // Check if there are any results
            if(results.length > 0){
                // We have our book, save details to variable
                bookDetailsBeforeUpdate = results[0]

                // Get the old and new file paths
                let oldFilePath = bookDetailsBeforeUpdate.coverImagePath
                let newFilePath = book.coverImagePath

                // Check if there is a new file to be saved
                if(newFilePath){
                    // There is a new file, check that the old file still exists
                    if(fs.existsSync(oldFilePath)){
                        // Delete the existing file
                        fs.rmSync(oldFilePath)
                    }
                } else {
                    // No new file, set new file path to old file path to prevent
                    // deleting the old path on update book with no new file
                    book.coverImagePath = oldFilePath
                }
            } else {
                // Couldn't find book, respond with not found
                res.status(404).json("book not found")
                // Return undefined so the next promise chain can be prevented from running
                return Promise.reject("breakPromiseChain")
            }
            // Ready to update book
            return book
        })
        // Update book details in the database
        .then(book => {
            return bookModel.updateBook(book)
        })
        .then(result => {
            // Check if update was successful
            if(result.affectedRows > 0){
                // Update successful, respond with 200
                res.status(200).json("sucessfully updated book with id: " + book.bookID)
                return [book.bookID, req.session.user.userID]
            } else {
                // Update failed, respond with 400
                res.status(400).json("could not update book - no book with id: " + book.bookID)
                // Break promise chain to prevent running queries
                return Promise.reject("breakPromiseChain")
            }
        })
        // Log book updated
        .then(loggingModel.logBookChange)
        .then(results => {
            // Check that logging was successful
            if(results.insertId){
                // Logging successful, log to console
                console.log("-- Log: Changes to book added to database")
            } else {
                // Logging failed, log failure
                console.log("failed to log changes")
            }
        })
        .then(null, (err) => {
            // This then acts like a "catch" to skip running queries when conditions are not met
            // without throwing a real error
            if(err != "breakPromiseChain") throw err
        })
        .catch(error => {
            // Database returned an error, log the error then respond with server error
            console.log(error)
            res.status(500).json("query error")
        })
})

// DELETE /api/books/:id
router.delete('/books/:id', validateParamBookId, (req,res) => {
    const bookID = req.params.id

    // Check for validation errors
    const error = validationResult(req)
    if(!error.isEmpty()){
        // There was a validation error, respond with bad request
        return res.status(400).json({error: error.array()})
    }

    // When we delete the book from the database we also need to delete
    // the cover image in the file system
    // Get file path from database
    bookModel.getBookById(bookID)
        .then(results => {
            // Check that we have book data
            if(results.length > 0) {
                // We have book data, set to variable
                let dbBookData = results[0]
                // Check if cover image file exists
                if(fs.existsSync(dbBookData.coverImagePath)){
                    // Delete cover image from file system
                    fs.rmSync(dbBookData.coverImagePath)
                }

                // Move on to delete database data
                // Run query to delete book from database
                bookModel.deleteBook(bookID)
                .then(result => {
                    // Check if deletion was successful
                    if(result.affectedRows > 0) {
                        // Book was deleted successfully, respond with 200
                        res.status(200).json("successfully deleted book with id: " + bookID)
                    } else {
                        // No book found with the given id, respond with bad request
                        res.status(400).json("failed to delete book - no book with id: " + bookID)
                    }
                })
                .catch(error => {
                    // Database returned an error, log error and respond with server error
                    console.log(error)
                    res.status(500).json("query error")
                })
            } else {
                // No results, respond with 404
                res.status(404).json("book not found")
            }
        })
        .catch(error => {
            // Database returned and error, log error and respond with server error
            console.log(error)
            res.status(500).json("query error")
        })    
})

module.exports = router