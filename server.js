const express = require('express')
const fileUpload = require('express-fileupload')
const session = require('express-session')
const mySQLStore = require('express-mysql-session')(session)

const server = express()
const port = 8000

// Import database connection and pass to session db handler
const { connection } = require('./backend/models/database')
const sessionStore = new mySQLStore({}, connection.promise())
// Enable middleware for session management
server.use(session({
    secret: "kjsdbfiuwd7687569832h98eh98dwcwdf",
    resave: false,
    saveUninitialized: false,
    cookie: {secure: false},
    store: sessionStore
}))
// Enable middleware for file uploads
server.use(fileUpload({createParentPath: true}))


// Access Control Middleware
server.use((req, res, next) => {
    // Check if user logged in
    const userLoggedIn = req.session.user != null

    // Define which URLs are allowed whether logged in or not
    const allowedURLs = [
        '/login.html',
        '/js/login.js',
        '/index.html',
        '/js/script.js',
        '/views/includes/header.html',
        '/views/includes/nav.html',
        '/views/includes/footer.html',
        '/list_books.html',
        '/js/list_books.js',
        '/favicon.ico',
        '/api/books',
        '/api/users/login',
        '/css/style.css'
    ]

    // Let user view page if logged in
    if(userLoggedIn){
        next()
    } else {
        // User not logged in, let them through if URL is allowed
        if(allowedURLs.includes(req.originalUrl)){
            next()   
        } else {
            // URL not allowed, redirect to login page
            res.redirect('/login.html')
        }
    }
})

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