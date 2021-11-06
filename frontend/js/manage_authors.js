// Clear search output
const clearSearchOutput = () => {
    // Get the search output element
    let authorSearchOutput = document.getElementsByClassName('search-output')[0]
    // Clear the existing output values
    authorSearchOutput.innerHTML = ''
    // Reset display settings
    authorSearchOutput.style.display = 'block'
}

//----------------------------- START Add Author -----------------------------//

// Set click event listenter on add author button
document.getElementById('add-author-btn').addEventListener('click', () => {
    // Get form element and convert data to json
    const form = document.getElementById('author-form')
    const formDataJSON = JSON.stringify(Object.fromEntries(new FormData(form)))

    // Validate form data
    let formPassedValidation = validateFormOnSubmit()
    // return if form data doen't pass validation to prevent fetch request from running
    if(!formPassedValidation) return

    // Send request to server and handle response
    fetch('/api/authors/add', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: formDataJSON
    })
        .then(res => res.json())
        .then(data => {
            // Update authorID form field to prevent user updating incorrect author
            document.getElementById('authorID').value = data.authorID
            clearSearchOutput()
            alert(data.status)
        })
})

//----------------------------- END Add Author -----------------------------//

//----------------------------- START Update Author -----------------------------//

// Set event listener on update author button
document.getElementById('update-author-btn').addEventListener('click', () => {
    // Get form element and convert data to JSON
    const form = document.getElementById('author-form')
    const formDataJSON = JSON.stringify(Object.fromEntries(new FormData(form)))
    
    // Get author id from hidden element to pass in request URI
    const authorID = form['authorID']

    // Validate form data with extra requirements
    let formPassedValidation = validateFormOnSubmit(() => {
        if(!authorID.value){
            validityCheckFailed(authorID, true)
            return false
        }
        return true
    })
    // return if form data doen't pass validation to prevent fetch request from running
    if(!formPassedValidation) return

    // Send request to server and handle response
    fetch(`/api/authors/update`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: formDataJSON
    })
        .then(res => res.json())
        .then(data => {
            clearSearchOutput()
            alert(data)
        })
})


//----------------------------- END Update Author -----------------------------//

//----------------------------- START Delete Author -----------------------------//

// Set event listener on delete author button
document.getElementById('delete-author-btn').addEventListener('click', () => {
    // Get author id so we know which author to delete
    const authorID = document.getElementById('authorID')
    
    // Validate form data with extra requirements
    let formPassedValidation = () => {
        if(!authorID.value){
            validityCheckFailed(authorID, true)
            return false
        }
        return true
    }
    // return if form data doen't pass validation to prevent fetch request from running
    if(!formPassedValidation()) return
    
    // Ask for confirmation that user actually wants to delete the author
    const confirmed = confirm("Are you sure you want to delete this author?")

    // Only send request if user has confirmed the deletion
    if(confirmed){
        // Send request to server and handle response
        fetch(`/api/authors/${authorID.value}`,{
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                clearSearchOutput()
                clearFormFields()
                alert(data)
            })
    }
})

//----------------------------- END Delete Author -----------------------------//

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
        // Remove any forced error display
        removeErrorForceDisplay(authorSearch)
        // Check to see if input data conforms to the pattern for a name
        if(!authorSearch.checkValidity()){
            // Validity check failed, stop search and display error message
            validityCheckFailed(authorSearch, true)
            return false
        } else if(!authorSearch.value){
            // Stop fetch from running when there is no input data
            return false 
        } else {
            return true
        }
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

            // Set event handlers on result rows to populate form with author data when clicked
            // Get all result rows
            let authors = document.querySelectorAll('.output-row')
            for(let author of authors){
                author.addEventListener('click', () => {
                    // Get the data for the selected author
                    let dataToPopulate = data.find(item => item.authorID == author.id)
                    // Get form elements
                    let formElements = document.getElementsByTagName('form')[0].elements
                    // Populate the form with the author's data
                    for(let elem of formElements){
                        if(elem.name){
                            elem.value = dataToPopulate[elem.name]
                        }
                    }
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
    let formElements = document.getElementById('author-form').elements
    // Clear values from each element except buttons
    for(elem of formElements){
        if(elem.getAttribute('type') !== 'button'){
            elem.value = ''
        }
    }

    // Clear search box
    let searchBox = document.getElementById('authorSearch')
    searchBox.value = ''
}

// Set click event listener on clear form button
document.getElementById('clear-form-btn').addEventListener('click', clearFormFields)

//----------------------------- END Clear Form Button -----------------------------//
