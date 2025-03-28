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
        // Convert JSON data to a string and set it as the request body
    };

    // Submit the POST request
    fetch('/login', options)
        .then(response => {
            // Check if the request was successful
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // Parse the response as JSON
            return response.json();
        })
        .then(data => {
            // Handle the response by setting Auth headers and local storage
            console.log('Wrote marker and retrieved again ', data);
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            document.location.href = "/";
        })
        .catch(error => {
            // Handle any errors that occurred during the fetch
            console.error(error);
        });
}
