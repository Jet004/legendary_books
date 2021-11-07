// Import database connection and query wrapper so we can write
// database qureies in this file
const { query } = require('express')
const db = require('./database')

module.exports.getAllUsers = () => {
    return db.query(
        "SELECT userID, firstName, lastName, email, username, permissions FROM users"
    )
}

module.exports.getUserById = (userID) => {
    return db.query(
        "SELECT userID, firstName, lastName, email, username, permissions FROM users WHERE userID = ?",
        [userID]
    )
}

module.exports.getAuthByUsername = (username) => {
    return db.query(
        "SELECT userID, username, password FROM users WHERE username = ?",
        [username]
    )
}

module.exports.getAuthById = (userID) => {
    return db.query(
        "SELECT userID, username, password FROM users WHERE userID = ?",
        [userID]
    )
}

module.exports.searchUser = (queryString) => {
    queryString = `%${queryString}%`
    return db.query(
        "SELECT userID, firstName, lastName, email, username, permissions FROM users "+
        "WHERE firstName LIKE ? OR lastName LIKE ? OR username LIKE ?",
        [queryString, queryString, queryString]
    )
}

module.exports.addUser = (user) => {
    return db.query(
        "INSERT INTO users(firstName, lastName, email, username, password, permissions) " +
        "VALUES (?, ?, ?, ?, ?, ?)",
        [user.firstName, user.lastName, user.email, user.username, user.password, user.permissions]
    )
}

module.exports.updateUser = (user) => {
    return db.query(
        "UPDATE users SET firstName = ?, lastName = ?, email = ?, username = ?, password = ?, permissions = ? " +
        "WHERE userID = ?",
        [user.firstName, user.lastName, user.email, user.username, user.password, user.permissions, user.userID]
    )
}

module.exports.deleteUser = (userID) => {
    return db.query(
        "DELETE FROM users WHERE userID = ?",
        [userID]
    )
}