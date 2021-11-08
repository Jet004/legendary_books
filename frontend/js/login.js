// API call to log users in
const login = () => {
    // Get user credentials from login form
    const form = document.getElementById('login-form')

    // Validate form data
    let formPassedValidation = validateFormOnSubmit()

    // Return if form doesn't pass validation to prevent fetch from running
    if(!formPassedValidation) return

    // Convert form to json string
    const formDataJSON = JSON.stringify(Object.fromEntries(new FormData(form)))
    
    // Send user credentials to backend to log user in
    fetch('/api/users/login', {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: formDataJSON
    })
        .then(request => request.json())
        .then(data => {
            // Check if login successful
            if(data.status === "success"){
                // Alert user that login was successful
                alert(data.message)
                // Set logged in status to localstorage
                localStorage.setItem("userLoggedIn", "true")
                // Redirect to book list
                window.location.href = 'list_books.html'
            } else {
                // Alert user that login was unsuccessful
                alert(data.message)
            }
        })
}


// Set click event listener on login button
document.getElementById('user-login-btn').addEventListener('click', login)

