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


//----------------------------- START Form Validation -----------------------------//

// Custome validation messages for each input based on id
const errorMessage = {
    authorSearch: "Please enter a valid name",
    authorID: "Search for the author you would like to update/delete",
    firstName: "Your first name should only contain letters and be longer than two characters long",
    lastName: "Your last name should only contain letters and be longer than two characters long",
    nationality: "Please provide a valid nationality",
    birthYear: "Please provide a valid year",
    deathYear: "Please provide a valid year",
    email: "Provide a valid email address",
    password: `Your password should contain: a capital letter, a lower case letter, a number, no spaces and be longer than 6 characters long`,
    "confirm-password": "Passwords must match"
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
    //console.log(elem.id + " DISPLAY: " + errorDiv.style.display)
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

// Set for event listeners to handle form validation on form input/change
let [ formElement ] = document.getElementsByTagName('form')
formElement.addEventListener('input', validateOnFormInput)
formElement.addEventListener('change', validateOnFormInput)

// Set input event listener to clear error on search input
let searchElement = document.getElementsByClassName('search')[0]
searchElement.addEventListener('input', (e) => {
    // Remove id field error message
    let idField = document.getElementsByClassName('hidden-id')[0]
    removeErrorForceDisplay(idField)
})

// Set event listener to clear all form error values when search item is seleced
let searchOutput = document.getElementsByClassName('search-output')[0]
let formElements = document.getElementsByTagName('form')[0].elements
searchOutput.addEventListener('click', () => {
    for(elem of formElements){
        if(elem.type != 'button'){
            // Remove all error messages
            removeErrorForceDisplay(elem)
        }
    }

})


//----------------------------- END Form Validation -----------------------------//