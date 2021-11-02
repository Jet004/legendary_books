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