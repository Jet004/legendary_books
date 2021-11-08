// Import database so we can query the database from this file
const db = require('./database')

module.exports.logBookAdd = (bookID, changeUserID) => {
    return db.query(
        "INSERT INTO changeLog(dateCreated, bookID, changeUserID) VALUES(?, ?, ?)",
        [Date.now(), bookID, changeUserID]
    )
}

module.exports.logBookChange = (bookID, changeUserID) => {
    return db.query(
        "INSERT INTO changeLog(dateChanged, bookID, changeUserID) VALUES(?, ?, ?)",
        [Date.now(), bookID, changeUserID]
    )
}

module.exports.logUserAdd = (userID, changeUserID) => {
    return db.query(
        "INSERT INTO changeLog(dateCreated, userID, changeUserID) VALUES(?, ?, ?)",
        [Date.now(), userID, changeUserID]
    )
}

module.exports.logUserChange = (userID, changeUserID) => {
    return db.query(
        "INSERT INTO changeLog(dateCreated, bookID, changeUserID) VALUES(?, ?, ?)",
        [Date.now(), userID, changeUserID]
    )
}