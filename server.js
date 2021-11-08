const express = require('express')
const fileUpload = require('express-fileupload')
const session = require('express-session')

const server = express()

const port = 8000

// Enable middleware for file uploads
server.use(fileUpload({createParentPath: true}))
// Enable middleware for session management
server.use(session({
    secret: "kjsdbfiuwd7687569832h98eh98dwcwdf",
    resave: false,
    saveUninitialized: false,
    cookie: {secure: false}
}))

// TODO: Access Control Middleware


// Enable middleware for JSON and urlencoded form data
server.use(express.json())
server.use(express.urlencoded({extended: true}))

// Connect static routes
server.use(express.static('frontend'))
server.use(express.static('frontend/views'))
server.use(express.static('frontend/cover-images'))

// Import author routes and add to api
const authorController = require('./backend/controllers/authorController')
server.use('/api', authorController)
// Import book routes and add to api
const bookController = require('./backend/controllers/bookController')
server.use('/api', bookController)
// Import user routes and add to api
const userController = require('./backend/controllers/userController')
server.use('/api', userController)


// Start server
server.listen(port, () => {
    console.log("Server listening on port: " + port)
})