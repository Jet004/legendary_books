// Import database connection and query wrapper so we can write
// database qureies in this file
const db = require('./database')

module.exports.searchBooksWithAuthors = (searchQuery) => {
    searchQuery = `%${searchQuery}%`
    return db.query(
        "SELECT b.bookID, b.bookTitle, b.originalTitle, b.yearPublished, b.genre, b.millionsSold, b.originalLanguage, b.coverImagePath, b.authorID, CONCAT(a.firstName, ' ', a.lastName) AS authorName " +
        "FROM books b JOIN authors a on (a.authorID = b.authorID) WHERE bookTitle LIKE ?",
        [searchQuery]
    )
}