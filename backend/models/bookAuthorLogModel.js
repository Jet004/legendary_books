// Import database connection and query wrapper so we can write
// database qureies in this file
const db = require('./database')

module.exports.getAllBooksWithAuthorsAndLogs = () => {
    return db.query(
        `SELECT 
            b.bookID, 
            b.bookTitle, 
            b.originalTitle, 
            b.yearPublished, 
            b.genre, 
            b.millionsSold, 
            b.originalLanguage, 
            b.coverImagePath, 
            b.authorID, 
            CONCAT(a.firstName, ' ', a.lastName) AS authorName,
                (SELECT
                    l1.dateCreated
                FROM changelog l1
                WHERE   l1.bookID = b.bookID AND
                        l1.dateCreated IS NOT NULL
                LIMIT 1) AS dateCreated,
                (SELECT
                    l2.dateChanged
                FROM changelog l2
                WHERE   l2.bookID = b.bookID AND
                        l2.dateChanged IS NOT NULL
                ORDER BY dateChanged DESC
                LIMIT 1) as dateChanged
        FROM books b 
        JOIN authors a on (a.authorID = b.authorID)`
    )
}