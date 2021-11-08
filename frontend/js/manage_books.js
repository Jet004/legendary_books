// Clear search output
const clearSearchOutput = () => {
    // Get the search output element
    let bookSearchOutput = document.getElementsByClassName('search-output')[0]
    // Clear the existing output values
    bookSearchOutput.innerHTML = ''
    // Reset display settings
    bookSearchOutput.style.display = 'block'
}

//----------------------------- START Add Book -----------------------------//

// Set click event listenter on add book button
document.getElementById('add-book-btn').addEventListener('click', () => {
    let passedValidity = true
    // Get form element and convert data to json
    const form = document.getElementById('book-form')

    // Validate form data
    let formPassedValidation = validateFormOnSubmit(() => {
        // coverImagePath must contain a file
        if(form.coverImagePath.files.length <= 0){
            validityCheckFailed(form.coverImagePath, true)
            passedValidity = passedValidity && false   
        }
        // The book genre select should not be set to 'default'
        if(form.genre.value === 'default'){
            validityCheckFailed(form.genre, true)
            passedValidity = passedValidity && false
        }
        return (passedValidity ? true : false)
    })
    // return if form data doen't pass validation to prevent fetch request from running
    if(!formPassedValidation) return

    // Convert form data to object
    let formObject = Object.fromEntries(new FormData(form))
    // Set filename for file to be saved in server
    let extension = `.${formObject.coverImagePath.type.split('/')[1]}`
    let filename = Date.now() + extension
    // Set coverImage path to be added to database - file name is current timestamp,
    // file extension taken from file object's type property
    formObject.coverImagePath = `frontend/cover-images/${filename}`
    // Convert the form data object to a JSON string
    const formDataJSON = JSON.stringify(formObject)

    // Send request to server and handle response
    fetch('/api/books/add', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: formDataJSON
    })
        .then(res => {
            if(res.status == 200){
                return res.json()
            } else {
                return Promise.reject(res.json())
            }
        })
        .then(data => {
            // Create new form data
            const formData = new FormData()
            // Get file element
            const coverImage = document.getElementById('coverImagePath').files[0]
            
            // Add file and data to formData
            formData.append('file', coverImage, filename)
            
            // Send image to server to be saved in file system
            fetch('/api/books/cover', {
                method: "POST",
                body: formData
            })
                .then(res => {
                    if(!res.ok){
                        return Promise.reject(res.json())
                    }
                    return res.json()
                })
                .then(fileResponseData => {
                    // Update bookID form field to prevent user updating incorrect book
                    document.getElementById('bookID').value = data.bookID
                    clearSearchOutput()
                    // Clear file input to prevent uploading the wrong image when updating
                    let fileElement = document.getElementById('coverImagePath')
                    fileElement.value = ""
                    alert(data.status)
                })
                .catch(error => console.log(error))
        })
        .catch(error => {console.log(error)})
})

//----------------------------- END Add Book -----------------------------//

//----------------------------- START Update book -----------------------------//

// Set event listener on update book button
document.getElementById('update-book-btn').addEventListener('click', () => {
    // Get form element and convert data to JSON object
    const form = document.getElementById('book-form')
    const formObject = Object.fromEntries(new FormData(form))
    
    // Get book id from hidden element to pass in request URI
    const bookID = form['bookID']

    // Check if a new cover image has been supplied
    let newCoverImage = form['coverImagePath']
    if(!newCoverImage.value){
        // No new cover image, set image path to empty string
        formObject.coverImagePath = ''
    } else {
        // Set filename for file to be saved in server
        let extension = `.${formObject.coverImagePath.type.split('/')[1]}`
        let filename = Date.now() + extension
        // Set coverImage path to be added to database - file name is current timestamp,
        // file extension taken from file object's type property
        formObject.coverImagePath = `frontend/cover-images/${filename}`
    }

    // Convert the form data object to a JSON string
    const formDataJSON = JSON.stringify(formObject)

    // Validate form data with extra requirements
    let formPassedValidation = validateFormOnSubmit(() => {
        let passedValidity = true
        // bookID must be present from searching for a book
        if(!bookID.value){
            validityCheckFailed(bookID, true)
            passedValidity = passedValidity && false
        }

        // The book genre select should not be set to 'default'
        if(form.genre.value === 'default'){
            validityCheckFailed(form.genre, true)
            passedValidity = passedValidity && false
        }
        
        return (passedValidity ? true : false)
    })

    // Return if form data doen't pass validation to prevent fetch request from running
    if(!formPassedValidation) return


    // Send request to server and handle response
    fetch(`/api/books/update`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: formDataJSON
    })
        .then(res => {
            if(!res.ok){
                // Database update failed, prevent file upload
                return Promise.reject(res.json())
            }

            // Database update ok, proceed to file upload if file supplied
            return res.json()
        })
        .then(data => {
            // Only run fetch to upload file if there is a file to upload
            if(formObject.coverImagePath){
                // Create new form data
                const formData = new FormData()
                // Get file element
                const coverImage = document.getElementById('coverImagePath').files[0]
                // Add file and data to formData
                formData.append('file', coverImage, formObject.coverImagePath)
                
                // Send image to server to be saved in file system
                fetch('/api/books/cover', {
                    method: "POST",
                    body: formData
                })
                    .then(res => {
                        if(!res.ok){
                            return Promise.reject(res.json())
                        }
                        return res.json()
                    })
                    .then(fileResponse => {
                        // Alert that book updated successfully
                        alert(data)
                    })
                    .catch(error => {
                        console.log(error)
                        alert(data + " " + "but there was an error updating the cover image")
                    })
            } else {
                // Alert that book updated successfully
                alert(data)
            }
            // Clear search output regardless of result
            clearSearchOutput()
        })
        .catch(error => {
            console.log(error)
        })
})


//----------------------------- END Update Book -----------------------------//

//----------------------------- START Delete Book -----------------------------//

// Set event listener on delete book button
document.getElementById('delete-book-btn').addEventListener('click', () => {
    // Get book id so we know which book to delete
    const bookID = document.getElementById('bookID')
    
    // Validate form data with extra requirements
    let formPassedValidation = () => {
        let passedValidity = true
        if(!bookID.value){
            validityCheckFailed(bookID, true)
            passedValidity = passedValidity && false
        }
        return (passedValidity ? true : false)
    }
    // Return if form data doen't pass validation to prevent fetch request from running
    if(!formPassedValidation()) return
    
    // Ask for confirmation that user actually wants to delete the book
    const confirmed = confirm("Are you sure you want to delete this book?")

    // Only send request if user has confirmed the deletion
    if(!confirmed) return  

    // Send request to server and handle response
    fetch(`/api/books/${bookID.value}`,{
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            clearSearchOutput()
            clearFormFields()
            alert(data)
        })
})

//----------------------------- END Delete Book -----------------------------//

//----------------------------- START Book Search -----------------------------//

// Get book search box element so we can create a dynamic search box
const bookSearch = document.getElementById('bookSearch')

// Set event listener for input to search box
bookSearch.addEventListener('input', () => {
    // Get the output element so we can clear values and print new ones
    let bookSearchOutput = document.getElementById('book-search-output')
    // Clear the previous output values
    bookSearchOutput.innerHTML = ''

    // Get the current input value within the search box
    const inputData = bookSearch.value

    // Validate search input data
    let formPassedValidation = () => {
        let passedValidity = true
        // Remove any forced error display
        removeErrorForceDisplay(bookSearch)
        // Check to see if input data conforms to the pattern for a book title
        if(!bookSearch.checkValidity()){
            // Validity check failed, stop search and display error
            validityCheckFailed(bookSearch, true)
            passedValidity = passedValidity && false
        } else if(!bookSearch.value){
            // Stop fetch from running when there is no input data
            passedValidity = passedValidity && false
        }
        return (passedValidity ? true : false)
    }
    // return if form data doen't pass validation to prevent fetch request from running
    if(!formPassedValidation()) return

    // Send data to backend to retrieve books matching the given string
    fetch(`/api/books/search/${inputData}`)
        .then(response => response.json())
        .then(data => {
            // Handle output when no results
            if(data === 'no results'){
                bookSearchOutput.innerHTML += `<div class="output-row">-- No results --</div>`
                // Need to return to prevent the search box being populated with undefined values
                return
            }

            // Handle output when there is a db error
            if(data === 'query error'){
                bookSearchOutput.innerHTML = `<div class="output-row">Error: ${data}</div>`
                // Need to return to prevent the search box being populated with undefined values
                return
            }

            // Populate the search output box
            for(let row of data){
                bookSearchOutput.innerHTML += `<div class="output-row" id="${row.bookID}">${row.bookTitle}</div>`
            }

            // Set event handlers on result rows to populate form with book data when clicked
            // Get all result rows
            let books = document.querySelectorAll('#book-search-output > .output-row')
            
            for(let book of books){
                book.addEventListener('click', () => {
                    // Get the data for the selected book
                    let dataToPopulate = data.find(item => item.bookID == book.id)
                    // Get form elements
                    let formElements = document.getElementsByTagName('form')[0].elements
                    // Populate the form with the book's data
                    for(let elem of formElements){
                        // Fill form with selected book/author data
                        if(elem.name && elem.name != 'coverImagePath'){
                            // Enter author name into author search field
                            if(elem.name == 'authorSearch'){
                                elem.value = dataToPopulate.authorName
                            } else {
                                elem.value = dataToPopulate[elem.name]
                            }
                        }
                    }
                    // Close the search output box
                    bookSearchOutput.style.display = 'none'
                    bookSearch.value = book.innerHTML
                })
            }

        })
})

// Set focus event listener to allow the result output box to be displayed
bookSearch.addEventListener('focus', () => {
    // Get the output element so we can open the output list if there are values
    let bookSearchOutput = document.getElementById('book-search-output')

    bookSearchOutput.style.display = 'block'

    // Set event listener to close the output list when user clicks off of the search box
    document.onclick = (e) => {
        if(e.target.id !== 'bookSearch'){
            bookSearchOutput.style.display = 'none'
            document.onclick = ''
        }
    }

    // Set event listener to close the output list when user tabs off of the search box
    document.onkeydown = (e) => {
        if(e.key === 'Tab'){
            bookSearchOutput.style.display = 'none'
            document.onkeydown = ''
        }
    }

})

//----------------------------- END Book Search -----------------------------//

//----------------------------- START Author Search -----------------------------//

// Get author search box element so we can create a dynamic search box
const authorSearch = document.getElementById('authorSearch')

// Set event listener for input to search box
authorSearch.addEventListener('input', () => {
    // Get the output element so we can clear values and print new ones
    let authorSearchOutput = document.getElementById('author-search-output')
    // Clear the previous output values
    authorSearchOutput.innerHTML = ''

    // Get the current input value within the search box
    const inputData = authorSearch.value

    // Validate search input data
    let formPassedValidation = () => {
        let passedValidity = true
        // Remove any forced error display
        removeErrorForceDisplay(authorSearch)
        // Check to see if input data conforms to the pattern for a name
        if(!authorSearch.checkValidity()){
            // Validity check failed, stop search and display error message
            validityCheckFailed(authorSearch, true)
            passedValidity = passedValidity && false
        } else if(!authorSearch.value){
            // Stop fetch from running when there is no input data
            passedValidity = passedValidity && false
        }
        return (passedValidity ? true : false)
    }
    // return if form data doen't pass validation to prevent fetch request from running
    if(!formPassedValidation()) return

    // Send data to backend to retrieve authors matching the given string
    fetch(`/api/authors/search/${inputData}`)
        .then(response => response.json())
        .then(data => {
            // Handle output when no results
            if(data === 'no results'){
                authorSearchOutput.innerHTML += `<div class="output-row">-- No results --</div>`
                // Need to return to prevent the search box being populated with undefined values
                return
            }

            // Handle output when there is a db error
            if(data === 'query error'){
                authorSearchOutput.innerHTML = `<div class="output-row">Error: ${data}</div>`
                // Need to return to prevent the search box being populated with undefined values
                return
            }

            // Populate the search output box
            for(let row of data){
                authorSearchOutput.innerHTML += `<div class="output-row" id="${row.authorID}">${row.firstName} ${row.lastName}</div>`
            }

            // Set event handlers on result rows to populate authorID field with authorID when clicked
            // Get all result rows
            let authors = document.querySelectorAll('#author-search-output > .output-row')
            for(let author of authors){
                author.addEventListener('click', () => {
                    // Get the data for the selected author
                    let dataToPopulate = data.find(item => item.authorID == author.id)
                    // Get authorID element
                    let authorIDElement = document.getElementById('authorID')

                    // Populate the field with the author's id
                    authorIDElement.value = dataToPopulate.authorID
                      
                    // Close the search output box
                    authorSearchOutput.style.display = 'none'
                    authorSearch.value = author.innerHTML
                })
            }

        })
})

// Set focus event listener to allow the result output box to be displayed
authorSearch.addEventListener('focus', () => {
    // Get the output element so we can open the output list if there are values
    let authorSearchOutput = document.getElementById('author-search-output')

    authorSearchOutput.style.display = 'block'

    // Set event listener to close the output list when user clicks off of the search box
    document.onclick = (e) => {
        if(e.target.id !== 'authorSearch'){
            authorSearchOutput.style.display = 'none'
            document.onclick = ''
        }
    }

    // Set event listener to close the output list when user tabs off of the search box
    document.onkeydown = (e) => {
        if(e.key === 'Tab'){
            authorSearchOutput.style.display = 'none'
            document.onkeydown = ''
        }
    }

})

//----------------------------- END Author Search -----------------------------//

//----------------------------- START Clear Form Button -----------------------------//

const clearFormFields = () => {
    // Get form elements
    let formElements = document.getElementById('book-form').elements
    // Clear values from each element except buttons
    for(elem of formElements){
        if(elem.getAttribute('type') !== 'button'){
            if(elem.id == 'genre'){
                elem.value = 'default'
            } else {
                elem.value = ''
            }
        }
    }

    // Clear search box
    let searchBox = document.getElementById('bookSearch')
    searchBox.value = ''
}

// Set click event listener on clear form button
document.getElementById('clear-form-btn').addEventListener('click', clearFormFields)

//----------------------------- END Clear Form Button -----------------------------//
