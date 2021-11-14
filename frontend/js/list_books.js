// Get all books from database along with author information and logged dates
fetch('/api/books/list')
    .then(response => response.json())
    .then(data => {
        let bookListHTML = ``
        // Iterate over book list
        for(book of data.books){
            // Build DOM book-item from data and only append dateCreated, dateChanged and 
            // update/delete button if user logged in
            if(userLoggedIn){
                bookListHTML += `
                <div class="book-item">
                    <img src="${book.coverImagePath}" alt="Book cover">
                    <div class="book-detail">
                        <div id="bookName"><b>Title: </b>${book.bookTitle}</div>
                        <div id="authorName"><b>Author: </b>${book.authorName}</div>
                        <div id="originalTitle"><b>Original Title: </b>${book.originalTitle}</div>
                        <div id="originalLanguage"><b>Original Language: </b>${book.originalLanguage}</div>
                        <div id="dateCreated"><b>Date Added: </b>${book.dateCreated}</div>
                        <div id="dateChanged"><b>Last Updated Date: </b>${book.dateChanged}</div>
                        <div id="book-buttons">
                            <a href="manage_books.html?id=${book.bookTitle}" id="update-book-btn">Update/Delete</a>
                        </div>
                    </div>
                </div>
                `
            } else {
            bookListHTML += `
                <div class="book-item">
                    <img src="${book.coverImagePath}" alt="Book cover">
                    <div class="book-detail">
                        <div id="bookName"><b>Title: </b>${book.bookTitle}</div>
                        <div id="authorName"><b>Author: </b>${book.authorName}</div>
                        <div id="originalTitle"><b>Original Title: </b>${book.originalTitle}</div>
                        <div id="originalLanguage"><b>Original Language: </b>${book.originalLanguage}</div>
                    </div>
                </div>
                `
            }

        }
        // Append to DOM
        let bookList = document.getElementById('book-list')
        bookList.innerHTML += bookListHTML
            // Limit view of dateCreated/dateUpdated and update/delete buttons to logged in users
    })



// Set click event listener to redirect to manage books and prefill form for update/delete