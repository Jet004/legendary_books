// Import express so we can set up a router and define routes in this file
const express = require('express')
// Create router
const router = express.Router()
// Import author model so routed can perform changes to the database
const authorModel = require('../models/authorModel')

// Define route for /api/authors which returns a list of all authors
router.get('/authors', (req,res) => {

})

// Define a route for /api/authors/:id which returns a single author
// with the id specified by the user
router.get('/authors/:id', (req,res) => {

})

// Define a route for /api/authors/add to add an author to the database
// based on sanitised form data provided by the user
router.post('/authors/add', (req,res) => {
    // Get form data from request body
    const author = req.body
    console.log(req)

    // TODO: Sanitise form data


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

module.exports = router