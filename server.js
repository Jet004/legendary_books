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
        '/open-book.png',
        '/views/includes/header.html',
        '/views/includes/nav.html',
        '/views/includes/footer.html',
        '/list_books.html',
        '/js/list_books.js',
        '/favicon.ico',
        '/api/books/list',
        '/api/users/login',
        '/css/style.css'
    ]

    adminAllowedURLs = [
        '/manage_users.html',
        '/manage_users.js',
        '/api/users',
        '/api/users/:id',
        '/api/users/search/:input',
        '/api/users/add',
        '/api/users/update'
    ]

    const isImage = req.originalUrl.match(/\/[0-9]{13}.png|.jpg|.jpeg/)
    // Redirect to index if accessed '/'
    if(req.originalUrl === "/") res.redirect('index.html')
    if(userLoggedIn && adminAllowedURLs.includes(req.originalUrl)){
        if(req.session.user.permissions === "admin"){
            next()
        } else {
            // User should not be accessing this page, respond with unauthorised
            res.status(401).json({
                "status": "failed",
                "message": "You are not authorised to access this resource"
            })
        }
    } else if(userLoggedIn){
        // Let user view any other page if logged in
        next()
    } else if(allowedURLs.includes(req.originalUrl) || isImage){
        // User not logged in, let them through if URL is allowed
        next()   
    } else {
        // URL not allowed, redirect to login page
        res.redirect('/login.html')
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