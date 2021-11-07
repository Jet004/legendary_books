// Code to check validity of passwords
//  // Check that passwords match
//  let password = document.getElementById("password");
//  let confirmPassword = document.getElementById("confirm-password");

//  // Check that there are no empty values
//  if (password && confirmPassword) {
//      // Check that passwords match
//      if (password.value != confirmPassword.value) {
//          //Set custom error message
//          confirmPassword.setCustomValidity("Passwords must match");

//          //Set error div to error message
//          let errorDiv = document.querySelector(
//              "#" + confirmPassword.parentNode.getAttribute("id") + "> .error"
//          );
//          errorDiv.innerHTML = confirmPassword.validationMessage;
//          // Set error flag to prevent form from submitting
//          errorCheck = false;
//      }
//  }

// Clear search output
const clearSearchOutput = () => {
    // Get the search output element
    let userSearchOutput = document.getElementsByClassName('search-output')[0]
    // Clear the existing output values
    userSearchOutput.innerHTML = ''
    // Reset display settings
    userSearchOutput.style.display = 'block'
}

//----------------------------- START Add User -----------------------------//

// Set click event listenter on add user button
document.getElementById('add-user-btn').addEventListener('click', () => {
    // Get form element and convert data to json
    const form = document.getElementById('user-form')
    const formDataJSON = JSON.stringify(Object.fromEntries(new FormData(form)))

    // Validate form data
    let formPassedValidation = validateFormOnSubmit()
    // return if form data doen't pass validation to prevent fetch request from running
    if(!formPassedValidation) return

    // Send request to server and handle response
    fetch('/api/users/add', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: formDataJSON
    })
        .then(res => res.json())
        .then(data => {
            // Update userID form field to prevent user updating incorrect user
            document.getElementById('userID').value = data.userID
            clearSearchOutput()
            alert(data.message)
        })
})

//----------------------------- END Add User -----------------------------//

//----------------------------- START Update User -----------------------------//

// Set event listener on update user button
document.getElementById('update-user-btn').addEventListener('click', () => {
    // Get form element and convert data to JSON
    const form = document.getElementById('user-form')
    const formDataJSON = JSON.stringify(Object.fromEntries(new FormData(form)))
    
    // Get user id from hidden element to pass in request URI
    const userID = form['userID']

    // Validate form data with extra requirements
    let formPassedValidation = validateFormOnSubmit(() => {
        if(!userID.value){
            validityCheckFailed(userID, true)
            return false
        }
        return true
    })
    // return if form data doen't pass validation to prevent fetch request from running
    if(!formPassedValidation) return

    // Send request to server and handle response
    fetch(`/api/users/update`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: formDataJSON
    })
        .then(res => res.json())
        .then(data => {
            clearSearchOutput()
            alert(data.message)
        })
})


//----------------------------- END Update User -----------------------------//

//----------------------------- START Delete User -----------------------------//

// Set event listener on delete user button
document.getElementById('delete-user-btn').addEventListener('click', () => {
    // Get user id so we know which user to delete
    const userID = document.getElementById('userID')
    
    // Validate form data with extra requirements
    let formPassedValidation = () => {
        if(!userID.value){
            validityCheckFailed(userID, true)
            return false
        }
        return true
    }
    // return if form data doen't pass validation to prevent fetch request from running
    if(!formPassedValidation()) return
    
    // Ask for confirmation that user actually wants to delete the user
    const confirmed = confirm("Are you sure you want to delete this user?")

    // Only send request if user has confirmed the deletion
    if(confirmed){
        // Send request to server and handle response
        fetch(`/api/users/${userID.value}`,{
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                clearSearchOutput()
                clearFormFields()
                alert(data.message)
            })
    }
})

//----------------------------- END Delete User -----------------------------//

//----------------------------- START User Search -----------------------------//

// Get user search box element so we can create a dynamic search box
const userSearch = document.getElementById('userSearch')

// Set event listener for input to search box
userSearch.addEventListener('input', () => {
    // Get the output element so we can clear values and print new ones
    let userSearchOutput = document.getElementById('user-search-output')
    // Clear the previous output values
    userSearchOutput.innerHTML = ''

    // Get the current input value within the search box
    const inputData = userSearch.value

    // Validate search input data
    let formPassedValidation = () => {
        // Remove any forced error display
        removeErrorForceDisplay(userSearch)
        // Check to see if input data conforms to the pattern for a name
        if(!userSearch.checkValidity()){
            // Validity check failed, stop search and display error message
            validityCheckFailed(userSearch, true)
            return false
        } else if(!userSearch.value){
            // Stop fetch from running when there is no input data
            return false 
        } else {
            return true
        }
    }
    // return if form data doen't pass validation to prevent fetch request from running
    if(!formPassedValidation()) return

    // Send data to backend to retrieve users matching the given string
    fetch(`/api/users/search/${inputData}`)
        .then(response => response.json())
        .then(data => {
            // Handle output when no results
            if(data.message === 'no results'){
                userSearchOutput.innerHTML += `<div class="output-row">-- No results --</div>`
                // Need to return to prevent the search box being populated with undefined values
                return
            }

            // Handle output when there is a db error
            if(data.message === 'query error'){
                userSearchOutput.innerHTML = `<div class="output-row">Error: ${data.message}</div>`
                // Need to return to prevent the search box being populated with undefined values
                return
            }

            // Populate the search output box
            for(let row of data.users){
                userSearchOutput.innerHTML += `<div class="output-row" id="${row.userID}">${row.username} - ${row.firstName} ${row.lastName}</div>`
            }

            // Set event handlers on result rows to populate form with user data when clicked
            // Get all result rows
            let users = document.querySelectorAll('.output-row')
            for(let user of users){
                user.addEventListener('click', () => {
                    // Get the data for the selected user
                    let dataToPopulate = data.users.find(item => item.userID == user.id)
                    console.log(dataToPopulate)
                    // Get form elements
                    let formElements = document.getElementsByTagName('form')[0].elements
                    // Populate the form with the user's data
                    for(let elem of formElements){
                        if(elem.name && elem.name != 'password'){
                            elem.value = dataToPopulate[elem.name]
                        }
                    }
                    // Close the search output box
                    userSearchOutput.style.display = 'none'
                    userSearch.value = user.innerHTML
                })
            }

        })
})

// Set focus event listener to allow the result output box to be displayed
userSearch.addEventListener('focus', () => {
    // Get the output element so we can open the output list if there are values
    let userSearchOutput = document.getElementById('user-search-output')

    userSearchOutput.style.display = 'block'

    // Set event listener to close the output list when user clicks off of the search box
    document.onclick = (e) => {
        if(e.target.id !== 'userSearch'){
            userSearchOutput.style.display = 'none'
            document.onclick = ''
        }
    }

    // Set event listener to close the output list when user tabs off of the search box
    document.onkeydown = (e) => {
        if(e.key === 'Tab'){
            userSearchOutput.style.display = 'none'
            document.onkeydown = ''
        }
    }

})

//----------------------------- END User Search -----------------------------//

//----------------------------- START Clear Form Button -----------------------------//

const clearFormFields = () => {
    // Get form elements
    let formElements = document.getElementById('user-form').elements
    // Clear values from each element except buttons
    for(elem of formElements){
        if(elem.getAttribute('type') !== 'button'){
            elem.value = ''
        }
    }

    // Clear search box
    let searchBox = document.getElementById('userSearch')
    searchBox.value = ''
}

// Set click event listener on clear form button
document.getElementById('clear-form-btn').addEventListener('click', clearFormFields)

//----------------------------- END Clear Form Button -----------------------------//
