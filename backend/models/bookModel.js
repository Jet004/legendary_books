// Import database connection and query wrapper so we can write
// database qureies in this file
const db = require('./database')

module.exports.getAllBooks = () => {
    return db.query("SELECT * FROM books;")
}

module.exports.getBookById = (bookID) => {
    return db.query(
        "SELECT * FROM books WHERE bookID = ?;",
        [bookID]
    )
}

module.exports.addBook = (bookValues) => {
    return db.query(
        "INSERT INTO books(bookTitle, originalTitle, yearPublished, genre, millionsSold, originalLanguage, coverImagePath, authorID) "+
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?);",
        [bookValues.bookTitle, bookValues.originalTitle, bookValues.yearPublished, bookValues.genre, bookValues.millionsSold, bookValues.originalLanguage, bookValues.coverImagePath, bookValues.authorID]
    )
}

module.exports.updateBook = (bookValues) => {
    return db.query(
        "UPDATE books SET bookTitle = ?, originalTitle = ?, yearPublished = ?, genre = ?, millionsSold = ?, originalLanguage = ?, coverImagePath = ?, authorID = ? " +
        "WHERE bookID = ?;",
        [bookValues.bookTitle, bookValues.originalTitle, bookValues.yearPublished, bookValues.genre, bookValues.millionsSold, bookValues.originalLanguage, bookValues.coverImagePath, bookValues.authorID, bookValues.bookID]
    )
}

module.exports.deleteBook = (bookID) => {
    return db.query(
        "DELETE FROM books WHERE bookID = ?;",
        [bookID]
    )
}

module.exports.searchBookName = (queryString) => {
    queryString = `%${queryString}%`
    return db.query(
        "SELECT * FROM books WHERE bookTitle LIKE ?",
        [queryString]
    )
}