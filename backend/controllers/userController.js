// Import express so we can set up a router
const express = require('express')
// Set up router so we can define routes in this file
const router = express.Router()

// Import bcrypt
const bcrypt = require('bcrypt')

// Import express validation middleware
const { param, body, validationResult } = require('express-validator')

// Import user model so we can query the user table in the database
const userModel = require('../models/userModel')
const { route } = require('./authorController')
const session = require('express-session')


//--------------------- Define Validation Criteria ---------------------//

// Set out validation criteria for fields common to add/update user
// Sanitise all fields which will conceivably be displayed in future
// using trim to remove leading and trailing white space and escape
// to convert executable code into a safe form
const validateCommon = [
    //username
    body('username').exists(checkFalsy = true).withMessage("Exists")
        .isAlphanumeric().withMessage("Type: ALPHANUMERIC")
        .isLength({min: 3, max: 50}).withMessage("Length")
        .trim()
        .escape(),
    // firstName
    body('firstName').exists(checkFalsy = true).withMessage("Exists")
        .matches("[A-Za-z'. \\-]").withMessage("Pattern")
        .isLength({min:2, max:100}).withMessage("Length")
        .trim()
        .escape(),
    // lastName
    body('lastName').exists(checkFalsy = true).withMessage("Exists")
        .matches("[A-Za-z'. \\-]").withMessage("Pattern")
        .isLength({min:2, max:100}).withMessage("Length")
        .trim()
        .escape(),
    // email
    body('email').exists(checkFalsy = true).withMessage("Exists")
        .isEmail().withMessage("Type: EMAIL")
        .isLength({min: 0, max: 100}).withMessage("Length")
        .notEmpty().withMessage("Not Empty")
        .trim()
        .escape(),
    // permissions
    body('permissions').exists(checkFalsy = true).withMessage("Exists")
        .matches("admin").withMessage("Pattern")
        .trim()
        .escape()
]

// Set out validation criteria specific to add book
const validateAddUser = [
    // password
    body('password').exists().withMessage("Exists - can be empty")
        .notEmpty().withMessage("Not Empty")
        .matches("[A-Za-z0-9]").withMessage("Pattern")
        .isLength({min: 6, max: 50}).withMessage("Length")
        .trim()
]

// Set out validation criteria specific to update book
const validateUpdateUser = [
    // password can be empty (reuses old password from the database)
    body('password').exists().withMessage("Exists - can be empty")
        .if(value => value.notEmpty())
        .matches("[A-Za-z0-9]").withMessage("Pattern")
        .isLength({min: 6, max: 50}).withMessage("Length")
        .trim()
]

// Set out validation criteria for user id in req.params
const validateParamUserId = [
    // Sanitise id parameter - only accept numbers
    param('id').exists(checkFalsy = true).withMessage("Exists")
        .isInt().withMessage("Type: INT")
        .trim()
        .escape()
]

// Set out validation criteria for user id in body
const validateBodyUserId = [
    // Sanitise id parameter - only accept numbers
    body('userID').exists(checkFalsy = true).withMessage("Exists")
        .isInt().withMessage("Type: INT")
        .trim()
        .escape()
]

// Set out validation criteria for book title search
const validateSearchUserName = [
    // Sanitise user input - only accept [A-Za-z'.- ]
    param('input').exists(checkFalsy = true).withMessage("Exists")
        .notEmpty().withMessage("Not Empty")
        .matches("[A-Za-z' \\- ]").withMessage("Pattern")
        .isLength({min:0, max:100}).withMessage("Length")
        .trim()
        .escape()
]


//--------------------- Define Routes ---------------------//

// Define route for /api/users which returns a list of all users
router.get('/users', (req,res) => {
    // No validation required, just query the database
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
router.get('/users/:id', validateParamUserId, (req,res) => {
    // Get userId from request paramaters
    let userID = req.params.id

    // Check for validation errors
    const error = validationResult(req)
    if(!error.isEmpty()){
        // Therer are validation errors, respond with bad request
        return res.status(400).json({ error: error.array() })
    }

    // Query the database for user
    userModel.getUserById(userID)
        .then(results => {
            // Check that we have results
            if(results.length > 0){
                // We have results, respond with 200 OK
                res.status(200).json({
                    "status": "success",
                    "users": results
                })
            } else {
                // No results, respond with not found
                res.status(404).json({
                    "status": "failed",
                    "message": "no user with id: " + userID
                })
            }
        })
        .catch(error => {
            // Database threw an error, log error and respond with server error
            console.log(error)
            res.status(500).json({
                "status": "failed",
                "message": "query error"
            })
        })
})

// Define route for /api/users/search/:input which returns a list of
// users which match a search criteria
router.get('/users/search/:input', validateSearchUserName, (req,res) => {
    // Get user search query from url parameter
    let input = req.params.input

    // Check for validation errors
    const error = validationResult(req)
    if(!error.isEmpty()){
        // There are validation errors, respond with bad request
        return res.status(400).json({ error: error.array() })
    }

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
router.post('/users/add', validateCommon, validateAddUser, (req,res) => {
    // Get user information from request body
    let user = req.body

    // Check for validation errors
    const error = validationResult(req)
    if(!error.isEmpty()){
        // There are validation errors, respond with bad request
        return res.status(400).json({ error: error.array() })
    }

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
router.patch('/users/update', validateCommon, validateUpdateUser, validateBodyUserId, (req,res) => {
    // Get access to update info from request body
    let user = req.body

    // Check for validation errors
    const error = validationResult(req)
    if(!error.isEmpty()){
        // There are validation errors, respond with bad request
        return res.status(400).json({ error: error.array() })
    }

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
router.delete('/users/:id', validateParamUserId, (req,res) => {
    // Get userID from request paramaters
    const userID = req.params.id

    // Check for validation errors
    const error = validationResult(req)
    if(!error.isEmpty()){
        // There are validation errors, respond with bad request
        return res.status(400).json({ error: error.array() })
    }

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

router.post('/users/login', (req,res) => {

    // Get user login credentials from request body
    const loginDetails = req.body

    // Check for validation errors

    // Search databse for username and check if passwords match
    userModel.getAuthByUsername(loginDetails.username)
        .then(results => {
            // Check if we got results
            if(results.length > 0){
                const userCredentials = results[0]
                // We have results, check that user password matched hashed password
                // from the database
                if(bcrypt.compareSync(loginDetails.password, userCredentials.password)){
                    // Passwords match, create user session
                    req.session.user = {
                        userID: userCredentials.userID,
                        permissions: userCredentials.permissions
                    }

                    // Login was successful, respond with 200 OK
                    res.status(200).json({
                        "status": "success",
                        "message": "Login successful"
                    })
                } else {
                    // Login failed, respond with bad request
                    res.status(400).json({
                        "status": "failed",
                        "message": "The username or password are incorrect"
                    })
                }

            } else {
                // No results, respond with bad request
                res.status(400).json({
                    "status": "failed",
                    "message": "No user with username: " + loginDetails.username
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

router.post('/users/logout', (req,res) => {
    // Destroy the session to log the user out, respond with 200 OK
    req.session.destroy()
    res.status(200).json({
        "status": "success",
        "message": "logged out successfully"
    })
})

module.exports = router