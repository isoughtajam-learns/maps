/*
Authentication and authorization functions
*/

const signUpForm = document.getElementById("signUpForm");
signUpForm.addEventListener("submit", onSignUpFormSubmit);

function validateSignUpForm(dataObject) {
    if (dataObject.username === "" || dataObject.password === "" || dataObject.confirmPassword === "") {
        return [false, "All fields are required"];
    } else if (dataObject.password != dataObject.confirmPassword) {
        return [false, "Passwords do not match, please re-enter."];
    } else {
        return [true, ""]
    }
}

function onSignUpFormSubmit(event) {
	event.preventDefault();
	const data = new FormData(event.target);
	const dataObject = Object.fromEntries(data.entries());

    const options = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json' // Set content type to JSON
        },
        body: JSON.stringify(dataObject)
        // Convert JSON data to a string and set it as the request body
    };

    // validate password and confirmation matches
    let [isValid, error] = validateSignUpForm(dataObject);
    // Submit the POST request
    if (!isValid) {
        e.preventDefault();
        displayError("form-error-div", error);
    } else {
        fetch('/signup', options)
            .then(response => {
                // Check if the request was successful
                console.log(response);
                if (response.ok) return response.json();
                return response.json().then(response => {throw new Error(response.error)})
            })
            .then(data => {
                // Handle the response by setting Auth headers and local storage
                console.log('Wrote marker and retrieved again ', data);
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('username', data.username);
                }
                document.location.href = "/"
            })
            .catch(error => {
                // Handle any errors that occurred during the fetch
                console.log(error);
                displayError("form-error-div", error);
            });
    }
}
