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
    firstName: "Your first name should only contain letters and be longer than two characters long",
    lastName: "Your last name should only contain letters and be longer than two characters long",
    nationality: "Please provide a valid nationality",
    birthYear: "Please provide a valid year",
    deathYear: "Please provide a valid year",
    email: "Provide a valid email address",
    password: `Your password should contain: a capital letter, a lower case letter, a number, no spaces and be longer than 6 characters long`,
    "confirm-password": "Passwords must match",

};

function checkElementValid(elem, forceErrorDisplay = false) {
    // Reset error message
    elem.setCustomValidity("");
    // Get error div and remove forced display
    let errorDiv = document.querySelector(
        "#" + elem.parentNode.getAttribute("id") + "> .error"
    );
    errorDiv.style.removeProperty('display')
    console.log(elem.parentNode.id)

    // Check validity of current element
    if (!elem.checkValidity()) {
        // Element has not passed validity check
        // Set custom error message
        elem.setCustomValidity(errorMessage[elem.getAttribute("id")]);

        //Set error div to error message
        errorDiv.innerHTML = elem.validationMessage;
        // Set border top styling (Doing so in CSS creates conflicts with the
        // checkbox validation)
        errorDiv.style.borderTop = "1px solid #ef233c";
        if(forceErrorDisplay === true) errorDiv.style.display = 'block'
        console.log(elem.id + " DISPLAY: " + errorDiv.style.display)
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
function validateFormOnSubmit(callBack = () => true) {
    // Get all form controls
    const [form] = document.getElementsByTagName("form");

    // Check HTML validity of user input
    let errorCheck = true;
    for (let elem of form.elements) {
        // Check all inputs except buttonss
        if(elem.type != 'button'){
            console.log(elem.id + "Check validity")
            errorCheck = checkElementValid(elem, true) && errorCheck;
        }
    }

    // Run extra validation tests specific to current fetch request
    errorCheck = errorCheck && callBack()

    if (!errorCheck) {
        // Prevent form submission on form error
        return false;
    } else {
        // Form passed validation - return true
        return true;
    }
}

// Check input validity on input and show custom error message depending on
// element id
function validateOnFormInput(e) {
    // Capture the element which received input
    const elem = e.target;

    // Validation check for the element
    checkElementValid(elem);
}

// Set for event listeners to handle form validation on form input
let [ formElement ] = document.getElementsByTagName('form')
formElement.addEventListener('input', validateOnFormInput)

//----------------------------- END Form Validation -----------------------------//