/*
Authentication and authorization functions
*/

const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", onLoginFormSubmit);

function onLoginFormSubmit(event) {
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
    };

    // Submit the POST request
    fetch('/login', options)
        .then(response => {
            // Check if the request was successful
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
            document.location.href = "/";
        })
        .catch(error => {
            // Handle any errors that occurred during the fetch
            displayError("form-error-div", error);
        });
}
