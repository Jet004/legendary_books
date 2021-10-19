const express = require('express')

const server = express()

const port = 8888

server.use(express.static('frontend/views'))



server.listen(port, () => {
    console.log("Server listening on port: " + port)
})