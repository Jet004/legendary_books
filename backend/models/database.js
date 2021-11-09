// Import the mysql2 middleware so we can connect to the database
const mysql = require('mysql2')

// Create a connection pool
const connection = mysql.createPool({
    host: 'localhost',
    port: '8889',
    user: 'root',
    password: 'root',
    database: 'legendaryBooks'
})


// This wrapper will allow the use of promise functions like 
// .then and .catch so that we can use it in an async way 
// along with expressJS
const query = (sql, parameters) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, parameters, (error, results) => {
            if(error){
                reject(error)
            } else {
                resolve(results)
            }
        })
    })
}

module.exports = { query, connection }