const express = require('express')

const server = express()

const port = 8000

server.use(express.static('frontend'))
server.use(express.static('frontend/views'))

// Enable middleware for JSON and urlencoded form data
server.use(express.json())
server.use(express.urlencoded({extended: true}))

// Import author routes and add to api
const authorController = require('./backend/controllers/authorController')
server.use('/api', authorController)
// Import book routes and add to api
const bookController = require('./backend/controllers/bookController')
server.use('/api', bookController)


// Start server
server.listen(port, () => {
    console.log("Server listening on port: " + port)
})