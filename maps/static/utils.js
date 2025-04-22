function displayError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block'; // Make the error message visible
}

function clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = '';
    errorElement.style.display = 'none'; // Hide the error message
}

function loadUserObject() {
    // Set up options for the POST fetch request
    const options = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json', // Set content type to JSON
            'Authorization': 'Bearer ' + localStorage.token
        }
    };

    // Submit the POST request
    fetch('/user', options)
        .then(response => {
            // Check if the request was successful
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            // Parse the response as JSON
            return response.json();
        })
        .then(data => {
            // Handle the JSON data
            console.log('Retrieved user: ', data);
            localStorage.user = data
        })
        .catch(error => {
            // Handle any errors that occurred during the fetch
            console.error('Fetch error:', error);
        });
}
