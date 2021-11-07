// Import express so we can set up a router
const express = require('express')
// Set up router so we can define routes in this file
const router = express.Router()

// Import bcrypt
const bcrypt = require('bcrypt')
// Import validation middleware
const { param, body, validationResult } = require('express-validator')

// Import user model so we can query the user table in the database
const userModel = require('../models/userModel')
const { route } = require('./authorController')


//--------------------- Define Validation Criteria ---------------------//






//--------------------- Define Routes ---------------------//

// Define route for /api/users which returns a list of all users
router.get('/users', (req,res) => {
    userModel.getAllUsers()
        .then(results => {
            if(results.length > 0){
                // We have results from the database, respond with results
                res.status(200).json(results)
            } else {
                // No results from database, return not found
                res.status(404).json('no users found')
            }
        })
        .catch(error => {
            // Database returned an error, log error and return server error
            console.log(error)
            res.status(500).json(error)
        })
})

// Define route for /api/users/:id which returns a single user by id
router.get('/users/:id', (req,res) => {

})

// Define route for /api/users/search/:input which returns a list of
// users which match a search criteria
router.get('/users/search/:input', (req,res) => {
    // Get user search query from url parameter
    let input = req.params.input

    // Check for validation errors

    // Search the database for metches to the search query
    userModel.searchUser(input)
        .then(results => {
            // Check if database has returned any results
            if(results.length > 0){
                // We have results, respond with success
                res.status(200).json({
                    "status": "success",
                    "users": results
                })
            } else {
                // No results, respond with not found
                res.status(404).json({
                    "status": "failed",
                    "message": "no results"
                })
            }
        })
        .catch(error => {
            // Database threw an error, log the error and respond with server error
            res.status(500).json({
                "status": "failed",
                "message": "query error"
            })
        })
})

// Define route for /api/users/create which creates a new user
router.post('/users/add', (req,res) => {
    // Get user information from request body
    let user = req.body

    // Check for validation errors

    // Hash password before it is saved to the database
    user.password = bcrypt.hashSync(user.password, 6)

    // Add new user to the database
    userModel.addUser(user)
        .then(results => {
            // Respond with success message
            res.status(200).json({
                "status": "success",
                "message": "user successfully added to database with id: " + results.insertId,
                "userID": results.insertId
            })
        })
        .catch(error => {
            // Database returned an error, log error and respond with server error
            console.log(error)
            res.status(500).json({
                "status": "error",
                "message": error
            })
        })
})

// Define route for /api/users/update which updates user information
router.patch('/users/update', (req,res) => {
    // Get access to update info from request body
    let user = req.body

    // Check for validation errors

    // Check if password is to be updated

    // if(user.password){
    //     // Hash password before it is entered into the database
    //     user.password = bcrypt.hashSync(user.password, 6)
    // } else {

    // }

    // Run update query
    // Get user details from database so we can set correct password
    // if it is not to be updated
    userModel.getAuthById(user.userID)
        .then(results => {
            // Check that we have results
            if(results.length <= 0){
                // No result. reject promise chain
                Promise.reject("No user found with id: " + user.userID)
            } else {
                // We have data, set correct password to be inserted in update
                if(user.password){
                    // Hash password before it is entered into the database
                    user.password = bcrypt.hashSync(user.password, 6)
                } else {
                    // User didn't supply new password, use existing one
                    user.password = results[0].password
                }
            }
            // return user object for use in next promise chain item
            return user
        })
        // Sent update query to database
        .then(userModel.updateUser)
        .then(results => {
            // Check that update was successful
            if(results.affectedRows > 0){
                // Update succeeded, return success message
                res.status(200).json({
                    "status": "success",
                    "message": "successfully updated user with id: " + user.userID
                })
            } else {
                // No user found to update, respond with not found
                res.status(404).json({
                    "status": "failed",
                    "message": "could not update user, no user with id: " + user.userID
                })
            }
        })
        .catch(error => {
            // Database returned an error, log error and respond with server error
            console.log(error)
            res.status(500).json({
                "error": error
            })
        })
})

// Define route for /api/users/delete which deletes a user from the database
router.delete('/users/:id', (req,res) => {
    // Get userID from request paramaters
    const userID = req.params.id

    // Check for validation errors

    // Run query to delete user
    userModel.deleteUser(userID)
        .then(results => {
            // Check if successful
            if(results.affectedRows > 0){
                // User was deleted, respond with 200 OK
                res.status(200).json({
                    "status": "success",
                    "message": "successfully deleted user with id: " + userID
                })
            } else {
                // No user found, respond with not found
                res.status(404).json({
                    "status": "failed",
                    "message": "no user found with id: " + userID
                })
            }
        })
        .catch(error => {
            // Database returned an error, log error and respond with server error
            console.log(error)
            res.status(500).json({
                "status": "error",
                "message": error
            })
        })
})

module.exports = router