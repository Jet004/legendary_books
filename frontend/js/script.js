//----------------------------- START Log Out User -----------------------------//
// API call to log user out
const logout = () => {
    // No data to be validated, just request logout
    fetch('/api/users/logout', {
        method: "POST"
    })
        .then(response => response.json())
        .then(data => {
            // Check if logout was successful
            if(data.status === "success"){
                // Logout was successful, alert to user and redirect to login page
                alert(data.message)
                localStorage.setItem("userLoggedIn", "false")
                window.location.href = 'login.html'
            }
            // No need to do anything if logout failed. It would mean that there
            // was some kind of network failure. It would return an error which we
            // will catch below in any case.
        })
        .catch(error => {
            // There was some unexpected error, log error and alert user
            console.log("Unexpected error - " + error)
            alert("Logout failed: an unexpected error occured. Contact the site administrator if the problem persists")
        })
}

//----------------------------- END Log Out User -----------------------------//


//----------------------------- START LocalStorage -----------------------------//
// If userLoggedIn not set in localStorage - set to false
let userLoggedIn = localStorage.getItem('userLoggedIn')
if(userLoggedIn != 'true') userLoggedIn = false

console.log(userLoggedIn)


//----------------------------- END LocalStorage -----------------------------//


//----------------------------- START Import Includes -----------------------------//

// Fetch HTML header, nav and footer
const fetchSiteIncludes = () => {
    let [ headerElement ] = document.getElementsByTagName('header')
    let [ navElement ] = document.getElementsByTagName('nav')
    let [ footerElement ] = document.getElementsByTagName('footer')

    fetch('../views/includes/header.html')
        .then(response => response.text())
        .then(data => {
            headerElement.outerHTML = data
            // Set click event listener on logout link to request logout
            document.getElementById('logout-link').addEventListener('click', logout)
            // Get login/logout divs to toggle display
            let loginDiv = document.getElementById('login-cont')
            let logoutDiv = document.getElementById('logout-cont')
            // Toggle login/logout links
            if(userLoggedIn === "true"){
                loginDiv.style.display = "none"
                logoutDiv.style.display = "block"
            } else {
                loginDiv.style.display = "block"
                logoutDiv.style.display = "none"
            }
        })

    fetch('../views/includes/nav.html')
        .then(response => response.text())
        .then(data => {
            navElement.outerHTML = data
        })

    fetch('../views/includes/footer.html')
        .then(response => response.text())
        .then(data => {
            footerElement.outerHTML = data
        })
}

// Call fetch includes function when page loaded
document.addEventListener('load', fetchSiteIncludes())


//----------------------------- END Import Includes -----------------------------//


//----------------------------- START Helper Functions -----------------------------//
function decodeHTMLEntities(text) {
    let entities = [
        ['amp', '&'],
        ['apos', '\''],
        ['#x27', '\''],
        ['#x2F', '/'],
        ['#39', '\''],
        ['#47', '/'],
        ['lt', '<'],
        ['gt', '>'],
        ['nbsp', ' '],
        ['quot', '"']
    ];

    for (let i = 0, max = entities.length; i < max; ++i) 
        text = text.replace(new RegExp('&'+entities[i][0]+';', 'g'), entities[i][1]);

    return text;
}

//----------------------------- END Helper Functions -----------------------------//


//----------------------------- START Form Validation -----------------------------//

// Custome validation messages for each input based on id
const errorMessage = {
    // Book validation error messages
    bookSearch: "Please enter a valid book name",
    bookID: "Search for the book you would like to update/delete",
    coverImagePath: "Please choose a .png, .jpg or .jpeg to upload as a cover image",
    bookTitle: "Please provide a valid book title",
    originalTitle: "Please provide a valid title",
    yearPublished: "Must be a valid year in the past",
    genre: "Select a genre",
    millionsSold: "Provide a number between 0 and 99999",
    originalLanguage: "Please enter a valid language",
    // Author validation error messages
    authorSearch: "Please enter a valid name",
    authorID: "Search for the author you would like to update/delete",
    firstName: "First name should only contain letters and be longer than two characters long",
    lastName: "Last name should only contain letters and be longer than two characters long",
    nationality: "Please provide a valid nationality",
    birthYear: "Please provide a valid year",
    deathYear: "Please provide a valid year",
    // User validation error messages
    userSearch: "Please enter a valid name",
    userID: "Search for the user you would like to update/delete",
    username: "Please enter a valid username",
    email: "Provide a valid email address",
    password: "Your password can only contain: letters, numbers and be longer than 6 characters long",
    permissions: "Please enter a permission level for the user"
};

const validityCheckFailed = (elem, forceErrorDisplay = false) => {
    // Set custom error message
    elem.setCustomValidity(errorMessage[elem.getAttribute("id")]);
    // Get error div
    let errorDiv = document.querySelector(
        "#" + elem.parentNode.getAttribute("id") + "> .error"
    );

    // Set error div to custom error message
    errorDiv.innerHTML = elem.validationMessage;

    // Set border top styling (Doing so in CSS creates conflicts with the
    // checkbox validation)
    errorDiv.style.borderTop = "1px solid #ef233c";
    if(forceErrorDisplay === true) errorDiv.style.display = 'block'
}

const removeErrorForceDisplay = (elem) => {
    // Reset error message
    elem.setCustomValidity("");
    // Reset error message on hidden id element
    // Get error div and remove forced display
    let errorDiv = document.querySelector(
        "#" + elem.parentNode.getAttribute("id") + "> .error"
    );

    errorDiv.style.removeProperty('display')
}

const checkElementValid = (elem, forceErrorDisplay = false) => {
    // Reset error message and hide error div
    removeErrorForceDisplay(elem)

    // Check validity of current element
    if (!elem.checkValidity()) {
        // Element has not passed validity check
        validityCheckFailed(elem, forceErrorDisplay)
        return false;
    } else {
        // Element has passed validity check
        // Delete any residual error messages
        elem.setCustomValidity("");
        return true;
    }
}

// Define function for validating form before fetch request
// callBack parameter takes a function with extra validation checks
// which resolve to true if passed and false if failed validation
// default value of true is returned if no callback is provided
const validateFormOnSubmit = (callBack = () => true) => {
    // Get all form controls
    const [form] = document.getElementsByTagName("form");

    // Check HTML validity of user input
    let errorCheck = true;
    for (let elem of form.elements) {
        // Check all inputs except buttonss
        if(elem.type != 'button'){
            errorCheck = checkElementValid(elem, true) && errorCheck;
        }
    }

    // Run extra validation tests specific to current fetch request
    // the callBack function is defined in the fetch request which
    // called the validate form function.
    const extraValidityChecksPassed = callBack()
    errorCheck = errorCheck && extraValidityChecksPassed

    if (!errorCheck) {
        // Prevent form submission on form error
        return false;
    } else {
        // Form passed validation - return true
        return true;
    }
}

// Check input validity on input to form and show custom error message depending on
// element id
const validateOnFormInput = (e) => {
    // Capture the element which received input
    const elem = e.target;

    // Validation check for the element
    checkElementValid(elem);
}

// Set form event listeners to handle form validation on input/change
let [ formElement ] = document.getElementsByTagName('form')
if(formElement){
    formElement.addEventListener('input', validateOnFormInput)
    formElement.addEventListener('change', validateOnFormInput)
}

// Set input event listener to clear error on search input
let searchElements = document.getElementsByClassName('search')
if(searchElements){
    for(elem of searchElements){
        elem.addEventListener('input', (e) => {
            // Determine which search bar triggered event and build css selector
            // for the related hidden id field
            let target = e.target.parentNode.id.split('-')[0] + 'ID'
            // Remove id field error message
            let idField = document.getElementById(target)

            removeErrorForceDisplay(idField)
        })
    }
}

// Set event listener to clear all form error values when search item is seleced
let searchOutput = document.getElementsByClassName('search-output')[0]
if(searchOutput){
    let formElements = document.getElementsByTagName('form')[0].elements
    searchOutput.addEventListener('click', () => {
        for(elem of formElements){
            if(elem.type != 'button'){
                // Remove all error messages
                removeErrorForceDisplay(elem)
            }
        }

    })
}


//----------------------------- END Form Validation -----------------------------//
