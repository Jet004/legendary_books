// Import database connection and query wrapper so we can write
// database qureies in this file
const db = require('./database')

module.exports.getAllAuthors = () => {

}

module.exports.getAuthorById = () => {

}

module.exports.addAuthor = (authorValues) => {
    db.query(
        "INSERT INTO author(firstName, lastName, nationality, birthYear, deathYear) "+
        "VALUES(?, ?, ?, ?, ?)",
        [authorValues.firstName, authorValues.lastName, authorValues.nationality, authorValues.birthYear, authorValues.deathYear]
    )
}