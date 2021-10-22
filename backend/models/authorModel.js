// Import database connection and query wrapper so we can write
// database qureies in this file
const db = require('./database')

module.exports.getAllAuthors = () => {
    return db.query("SELECT * FROM authors")
}

module.exports.getAuthorById = (id) => {
    return db.query(
        "SELECT * FROM authors WHERE authorID = ?",
        [id]
    )
}

module.exports.addAuthor = (authorValues) => {
    return db.query(
        "INSERT INTO authors(firstName, lastName, nationality, birthYear, deathYear) "+
        "VALUES(?, ?, ?, ?, ?)",
        [authorValues.firstName, authorValues.lastName, authorValues.nationality, authorValues.birthYear, authorValues.deathYear]
    )
}

module.exports.searchAuthorName = (queryString) => {
    queryString = `%${queryString}%`
    return db.query(
        "SELECT authorID, firstName, lastName, nationality, birthYear, deathYear FROM authors WHERE firstName LIKE ? OR lastName LIKE ?",
        [queryString, queryString]
    )
}