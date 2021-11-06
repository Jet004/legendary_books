// Import express so we can set up a router and define routes in this file
const express = require('express')
// Create router
const router = express.Router()

// Import express validation middleware
const { param, body, validationResult } = require('express-validator')

// Import author model so routed can perform changes to the database
const authorModel = require('../models/authorModel')


//--------------------- Define Validation Criteria ---------------------//

// Set out validation criteria common to add/update author
// Sanitise all fields which will conceivably be displayed in future
// using trim to remove leading and trailing white space and escape
// to convert executable code into a safe form
const validateCommon = [
    // firstName must match: [A-Za-z'. \\-]{2,100} and not be empty
    body('firstName').exists(checkFalsy = true).withMessage("Exists")
        .matches("[A-Za-z'. \\-]").withMessage("Pattern")
        .isLength({min:2, max:100}).withMessage("Length")
        .trim()
        .escape(),
    // lastName must match: [A-Za-z'. \\-]{2,100} and not be empty
    body('lastName').exists(checkFalsy = true).withMessage("Exists")
        .matches("[A-Za-z'. \\-]").withMessage("Pattern")
        .isLength({min:2, max:100}).withMessage("Length")
        .trim()
        .escape(),
    // nationality must not be empty and must match: [A-Za-z]{2,100}
    body('nationality').exists(checkFalsy = true).withMessage("Exists")
        .matches("[A-Za-z]").withMessage("Pattern")
        .isLength({min:2, max:100}).withMessage("Length")
        .trim()
        .escape(),
    // birthYear is INT, not empty, and 1 - 4 characters long
    body('birthYear').exists(checkFalsy = true).withMessage("Exists")
        .isInt().withMessage("Type: INT")
        .isLength({min:1, max:4}).withMessage("Length")
        .trim()
        .escape(),
    // deathYear is either an empty string or convertable to a number, and 0 - 4 characters long
    body('deathYear').exists().withMessage("Exists")
        .isLength({min:0, max:4}).withMessage("Length")
        .custom(value => value === '' || typeof Number(value) === 'number').withMessage("Custom: <empty string> || INT")
        .trim()
        .escape()
]

// Set out validation criteria for user id in req.params
const validateParamAuthorId = [
    // Sanitise id parameter - only accept numbers
    param('id').exists(checkFalsy = true).withMessage("Exists")
        .isInt().withMessage("Type: INT")
        .trim()
        .escape()
]

// Set out validation criteria for user id in body
const validateBodyAuthorId = [
    // Sanitise id parameter - only accept numbers
    body('authorID').exists(checkFalsy = true).withMessage("Exists")
        .isInt().withMessage("Type: INT")
        .trim()
        .escape()
]

// Set out validation criteria for author name search
const validateSearchAuthorName = [
    // Sanitise user input - only accept [A-Za-z'.- ]
    param('input').exists(checkFalsy = true).withMessage("Exists")
        .matches("[A-Za-z',\\- ]").withMessage("Pattern")
        .isLength({min:0, max:100}).withMessage("Length")
        .trim()
        .escape()
]


//--------------------- Define Routes ---------------------//

// Define route for /api/authors which returns a list of all authors
router.get('/authors', (req,res) => {
    // No incoming data to sanitise. Just go query the database
    authorModel.getAllAuthors()
        .then(result => {
            if(result.length > 0){
                // We have books, send response
                res.status(200).json(result)
            } else {
                // No books to display
                res.status(404).json("No authors found")
            }
        })
        .catch(error => {
            console.log(error)
            res.status(500).json("query error")
        })
})

// Define a route for /api/authors/:id which returns a single author
// with the id specified by the user
router.get('/authors/:id', validateParamAuthorId, (req,res) => {
    // Check for validation errors
    const error = validationResult(req)
    if(!error.isEmpty()){
        // There is a validation error - respond with bad request
        return res.status(400).json({ error: error.array()})
    }

    // Query the database
    authorModel.getAuthorById(req.params.id)
        .then(result => {
            if(result.length > 0){
                // We have a result, respond with result
                res.status(200).json(result)
            } else {
                // No author with that ID, respond with not found
                res.status(404).json("could not get author with id: " + req.params.id)
            }
        })
        .catch(error => {
            console.log(error)
            res.status(500).json("query error")
        })
})

// Define a route for /api/authors/search/:id which returns an array of authors
// which match the name search query
router.get('/authors/search/:input', validateSearchAuthorName, (req,res) => {
    // Check for validation errors
    const error = validationResult(req)
    if(!error.isEmpty()){
        // There is a validation error - respond with bad request
        return res.status(400).json({ error: error.array()})
    }

    authorModel.searchAuthorName(req.params.input)
        .then(results => {
            if(results.length > 0){
                res.status(200).json(results)
            } else {
                res.status(404).json('no results')
            }
        })
        .catch(error => {
            console.log(error)
            res.status(500).json('query error')
        })
})

// Define a route for /api/authors/add to add an author to the database
// based on sanitised form data provided by the user
router.post('/authors/add', validateCommon, (req,res) => {
    // Get form data from request body
    let author = req.body

    // Check for validation errors
    const error = validationResult(req)
    if(!error.isEmpty()){
        // There is a validation error - respond with bad request
        return res.status(400).json({ error: error.array()})
    }
    // Set deathYear to NULL if empty to avoid database query errors
    // (this is the only field which can be empty)
    if(author.deathYear === ''){
        author.deathYear = null
    }

    // Add author to the database
    authorModel.addAuthor(author)
        .then(result => {
            res.status(200).json({
                "status": "Author added to database with id: " + result.insertId,
                "authorID": result.insertId
            })
        })
        .catch(error => {
            console.log(error)
            res.status(500).json("query error - could not add author to database")
        })
})

// Define a route for /api/authors/update to update an author in the database
// based on sanitised form data provided by the user
router.patch('/authors/update', validateCommon, validateBodyAuthorId, (req,res) => {
    // Get form data from request body
    let author = req.body
    
    // Check for validation errors
    const error = validationResult(req)
    if(!error.isEmpty()){
        // There is a validation error - respond with bad request
        return res.status(400).json({ error: error.array() })
    }
    // Set deathYear to NULL if empty to avoid database query errors
    // (this is the only field which can be empty)
    if(author.deathYear === ''){
        author.deathYear = null
    }

    // Update author details in the database
    authorModel.updateAuthor(author)
        .then(result => {
            if(result.affectedRows > 0){
                res.status(200).json("successfully updated author with id: " + author.authorID)
            } else {
                res.status(404).json("could not update author details: no author with id: " + author.authorID)
            }
        })
        .catch(error => {
            console.log(error)
            res.status(500).json("query error")
        })
})

router.delete('/authors/:id', validateParamAuthorId, (req,res) => {
    // Check for validation errors
    const error = validationResult(req)
    if(!error.isEmpty()){
        // There is a validation error - respond with bad request
        return res.status(400).json({ error: error.array() })
    }
    authorModel.deleteAuthor(req.params.id)
        .then(result => {
            if(result.affectedRows > 0){
                res.status(200).json("successfully deleted author with id: " + req.params.id)
            } else {
                res.status(404).json("could not delete author: no author with id: " + req.params.id)
            }
        })
        .catch(error => {
            console.log(error)
            res.status(500).json("query error")
        })
})

module.exports = router