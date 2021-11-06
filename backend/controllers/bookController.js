// Import express so we can create routes in this file
const express = require('express')
const fileUpload = require('express-fileupload')
const fs = require('fs')

const router = express.Router()

// // Import express validation middleware
const { param, body, validationResult } = require('express-validator')

// Import book model so I can query the database from this file
const bookModel = require('../models/bookModel')
// Import bookAuthor model so I can search for books with author data included
const bookAuthorModel = require('../models/bookAuthorModel')

//--------------------- Define Validation Criteria ---------------------//










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

// GET /api/books/:id - get book by id
router.get('/books/:id', (req,res) => {
    const bookID = req.params.id

    // TODO: Sanitise input

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
router.get('/books/search/:input', (req,res) => {
    // Get input data from request parameter
    const input = req.params.input
    
    // TODO: Sanitise input

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
    if(!req.files){
        // No file, respond with 400
        res.status(400).json("no file detected")
    } else {
        // Save file to file system
        let file = req.files.file
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
router.post('/books/add', (req,res) => {
    // Get form data from request body
    let book = req.body
    
    // TODO: Sanitise input
    
    // run add book query from book model
    bookModel.addBook(book)
        .then(result => {
            // Respond with id
            res.status(200).json({
                "status": "Book added to database with id: " + result.insertId,
                "bookID": result.insertId
            })
        })
        .catch(error => {
            // Database returned an error, log error and respond with 500
            console.log(error)
            res.status(500).json("query error")
        })
})

// PATCH /api/books/:id update book
router.patch('/books/update', (req,res) => {
    // Get form data from request body
    let book = req.body
    
    // TODO: Sanitise input

    // If bookTitle is updated (query using bookID) then we need to rename the cover image file to
    // reflect the new book title using fs module
    // Get existing book details
    let bookDetailsBeforeUpdate = {}
    // Query the database for existing details
    bookModel.getBookById(book.bookID)
        .then(results => {
            // Check if there are any results
            if(results.length > 0){
                // We have our book, save details to variable
                bookDetailsBeforeUpdate = results[0]
                // Check if the bookTitle has been updated
                if(book.bookTitle != bookDetailsBeforeUpdate.bookTitle){
                    // Book title has been updated. Update the cover image filename to reflect this
                    let oldFilePath = bookDetailsBeforeUpdate.coverImagePath
                    let newFilePath = book.coverImagePath
                    fs.renameSync(oldFilePath, newFilePath)
                }
                // Book title has not been updated, pass through to database update
            } else {
                // Couldn't find book, respond with not found
                res.status(404).json("book not found")
            }
        })
        .catch(error => {
            // Database returned an error, log the error then respond with server error
            console.log(error)
            res.status(500).json("query error")
        })

    // Update book details in the database
    bookModel.updateBook(book)
        .then(result => {
            // Check if update was successful
            if(result.affectedRows > 0){
                // Update successful, respond with 200
                res.status(200).json("sucessfully updated book with id: " + book.bookID)
            } else {
                // Update failed, respond with 400
                res.status(400).json("could not update book - no book with id: " + book.bookID)
            }
        })
        .catch(error => {
            // Database returned an error, log error and respond with server error
            console.log(error)
            res.status(500).json("query error")
        })
})

// DELETE /api/books/:id
router.delete('/books/:id', (req,res) => {
    const bookID = req.params.id

    // TODO: Sanitise id

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
})

module.exports = router