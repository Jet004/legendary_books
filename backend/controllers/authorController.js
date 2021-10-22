// Import express so we can set up a router and define routes in this file
const express = require('express')
// Create router
const router = express.Router()
// Import author model so routed can perform changes to the database
const authorModel = require('../models/authorModel')

// Define route for /api/authors which returns a list of all authors
router.get('/authors', (req,res) => {
    authorModel.getAllAuthors()
        .then(result => {
            res.status(200).json(result)
        })
        .catch(error => {
            console.log(error)
            res.status(500).json("query error")
        })
})

// Define a route for /api/authors/:id which returns a single author
// with the id specified by the user
router.get('/authors/:id', (req,res) => {
    // Sanitise id parameter - only accept numbers
    if(isNaN(req.params.id)){
        // Respond with an error
        res.status(400).json("Invalid id - user id must be a number")
    }

    authorModel.getAuthorById(req.params.id)
        .then(result => {
            if(result.length > 0){
                res.status(200).json(result)
            } else {
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
router.get('/authors/search/:id', (req,res) => {
    // TODO: Sanitise user input
    authorModel.searchAuthorName(req.params.id)
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
router.post('/authors/add', (req,res) => {
    // Get form data from request body
    let author = req.body

    // TODO: Sanitise form data
    if(author.deathYear === ''){
        author.deathYear = null
    }

    // Add author to the database
    authorModel.addAuthor(author)
        .then(result => {
            res.status(200).json("Author added to database with id: " + result.insertId)
        })
        .catch(error => {
            console.log(error)
            res.status(500).json("query error - could not add author to database")
        })
})

router.patch('/author/:id', (req,res) => {
    // TODO
})

router.delete('/authors/:id', (req,res) => {
    // TODO
})

module.exports = router