/*
Basic map details
*/
const originalMapCenter = [37.80822410973752, -122.27024219885426]
let map = L.map('map', {
    center: originalMapCenter,
    zoom: 16
});
map.zoomControl.setPosition('topright');

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
let editLayerGroup = L.layerGroup().addTo(map);
let keepersLayerGroup = L.layerGroup().addTo(map);
let overlayMaps = {};

const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.token
}

let greeting = document.getElementById('welcome-user');
const username = localStorage.getItem('username');

const logoutButton = document.getElementById("logout-button");
const loginLink = document.getElementById("login-link");
logoutButton.addEventListener("click", logout);

if (username != null) {
    greeting.innerHTML = "Welcome, " + username + "!";
    logoutButton.classList.remove('hidden')
    loginLink.classList.add('hidden')
} else {
    greeting.innerHTML = "In order to save selections, please...";
    logoutButton.classList.add('hidden')
    loginLink.classList.remove('hidden')
}

function logout(event) {
	event.preventDefault();
    localStorage.removeItem('username');
    greeting.innerHTML = "";
    logoutButton.classList.add('hidden')
    document.location.href = "/";
}

function recenterOnCurrent() {
    let latlngs = [];
    let lats = [];
    let lngs = [];

    Object.keys(map._layers).forEach(layerId => {
        const layer = map._layers[layerId];
        if ('_latlng' in layer) {
            latlngs.push(layer._latlng);
            lats.push(layer._latlng.lat);
            lngs.push(layer._latlng.lng);
        }
    })
    if (latlngs.length === 0) {
        return
    }

    function sum(arr) {
        return arr.reduce(function (a, b) {
            return a + b;
        }, 0);
    }

    const center = [
        sum(lats)/lats.length,
        sum(lngs)/lngs.length,
    ];
    map.panTo(center);
    map.fitBounds(L.latLngBounds(latlngs), Zoom=19);
}

/*
    Validate empty fields and also text field length.
 */
function validateForm() {
    let title = document.getElementById('create-form-title-input').value;
    let desc = document.getElementById('create-form-desc-input').value;
    let layer = document.getElementById('create-form-layer-input').value;

    if (title === "" || desc === "" || layer === "") {
        return [false, "All fields are required"];
    } else if (desc.length > 140) {
        return [false, "Description is capped at 140 characters."];
    } else {
        return [true, ""]
    }
}

/*
    Clear markers from editLayerGroup
 */
function clearEditLGMarkers() {
    editLayerGroup.clearLayers();
}

/*
    Create a marker with given lat long and add to
      dedicated edit Layer Group.
    Return the marker's unique id
 */
function createEditLayerWithMarker(latlng) {
    let marker = L.marker(latlng).addTo(editLayerGroup);
    let marker_id = L.stamp(marker);
    return marker_id;
}

function onMapClick(e) {
    const dialog = document.getElementById("create-form-dialog");
    dialog.showModal();
    let marker = L.marker(e.latlng)
    let marker_id = L.stamp(marker);
    document.getElementById('create-form-lat').value = e.latlng.lat
    document.getElementById('create-form-lng').value = e.latlng.lng
}
map.on('click', onMapClick);


/*
    Marker Form functionality

    Includes:
    - Form handling -- display, hide
    - Submit marker
 */
function resetCreateForm() {
    document.getElementById('create-vs-edit-form').textContent = 'create';
    document.getElementById('create-form-title-input').textContent = '';
    document.getElementById('create-form-desc-input').textContent = '';
    document.getElementById('create-form-layer-input').textContent = 'faves';
    document.getElementById('create-form-lat').value = '';
    document.getElementById('create-form-lng').value = '';
}

function hideDialog() {
    /*
        Increase width of map to 100%
        Hide Form div
        Recenter map in new dimensions
     */
    const dialog = document.getElementById("create-form-dialog");
    const keepMarker = document.getElementById('create-vs-edit-form').textContent == 'edit'
    clearEditLGMarkers();
    recenterOnCurrent();
    dialog.close();
    resetCreateForm();
}

const submitMarker = document.getElementById("submit-marker");
submitMarker.addEventListener("submit", onMarkerSubmit);

const cancelSubmitButton = document.getElementById("cancel-form-button");
cancelSubmitButton.addEventListener("click", hideDialog);

/*
Primary method for creating a new marker for the current map.

Fails without a token and API returns an error message that is displayed in
 the form.
*/
function onMarkerSubmit(e) {
    event.preventDefault();
    // grab data from the form and add lat lon
    const jsonData = {
        title: document.getElementById('create-form-title-input').value,
        description: document.getElementById('create-form-desc-input').value,
        layer: document.getElementById('create-form-layer-input').value,
        lat: document.getElementById('create-form-lat').value,
        lng: document.getElementById('create-form-lng').value,
    };
    // If we're editing an existing marker, handle differently
    const createOrEdit = document.getElementById('create-vs-edit-form').textContent;
    const markerId = document.getElementById('popup');
    if (markerId !== null) {
        jsonData['id'] = parseInt(markerId.getAttribute('data-marker-id'));
    }


    // Set up options for the POST fetch request
    const options = {
        method: createOrEdit == 'create' ? 'POST' : 'PATCH',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json', // Set content type to JSON
            'Authorization': 'Bearer ' + localStorage.token
        },
        body: JSON.stringify(jsonData) // Convert JSON data to a string and set it as the request body
    };

    let [isValid, error] = validateForm();
    if (!isValid) {
        e.preventDefault();
        displayError("form-error-div", error);
    } else {
        // Submit the POST request
        fetch('/pin', options)
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
                console.log('Wrote marker and retrieved again ', data);
                // Reset state of create form
                resetCreateForm();
                document.location.href = "/"
            })
            .catch(error => {
                // Handle any errors that occurred during the fetch
                console.error('Fetch error:', error);
            });
    }
}

/*
Primary method for creating a new marker for the current map.

Fails without a token and API returns an error message that is displayed in
 the form.
*/
function deleteMarker(e) {
    event.preventDefault();
    const marker_id = parseInt(popup.getAttribute('data-marker-id'));

    // Set up options for the POST fetch request
    const options = {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json', // Set content type to JSON
            'Authorization': 'Bearer ' + localStorage.token
        }
    };

    fetch('/pin/' + marker_id, options)
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
            console.log('Deleted marker.');
            // Reset state of create form
            resetCreateForm();
            document.location.href = "/"
        })
        .catch(error => {
            // Handle any errors that occurred during the fetch
            console.error('Fetch error:', error);
        });
}

/*
Primary method for retrieving the current user's markers and displaying
 them on the map.

Without a token API returns no markers.
*/
function getMarkersAndDisplay() {
    headers = window.structuredClone(defaultHeaders);
    if (!localStorage.token) {
        delete headers['Authorization']
    }
    const options = {
        method: 'GET',
        headers: headers
    }
    fetch('/pins', options)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            console.log(response);
            /*
            Grab apiVersion and tagLine from response header to save in localstorage
            */
            const headers = response.headers;
            localStorage.apiVersion = headers.get('apiVersion');
            localStorage.tagLine = headers.get('tagLine');

            if (response.status === 204) return '';
            return response.json();
        })
        .then(data => {
            /*
            Add all retrieved points to a new LayerGroup with a named key
            in layerGroups
             */
            console.log('Got markers ', data);
            const mdConverter = new showdown.Converter();
            let groupNames = Object.keys(data);
            groupNames.forEach((groupName) => {
                let lg = L.layerGroup().addTo(map);
                data[groupName].forEach((item) => {
                    let marker = L.marker([item.lat, item.lng]).addTo(lg);
                    marker.bindPopup("<div class='popup' id='popup' data-marker-id='" + item.id + "'>" +
                        "<h4 class='popup-title'>" + item.title + "</h4>" +
                        "<div class='popup-description'>" + mdConverter.makeHtml(item.description) + "</div>" +
                        "<div id='popup-footer'><h6 class='popup-layer popup-footer'>" + groupName + "</h6>" +
                        "<img onclick='editDialog();' id='edit-control' class='popup-controls popup-footer edit-control' src='/static/pencil.png' height='10' width='10')>" +
                        "<img onclick='deleteMarker();' id='delete-control' class='popup-controls popup-footer delete-control' src='/static/trash-bin-green.png' height='10' width='10')>" +
                        "</div></div>");
                });
                overlayMaps[groupName] = lg;
            });
            /*
            Add all non-empty layers to the over layer controller
            */
            if (Object.keys(overlayMaps).length !== 0) {
                let layerControl = L.control.layers([], overlayMaps).addTo(map);
            }
            recenterOnCurrent();

            let apiVersionSpan = document.getElementById('apiVersion');
            apiVersionSpan.innerHTML = localStorage.getItem('apiVersion');
            let tagLineSpan = document.getElementById('tagLine');
            tagLineSpan.innerHTML = localStorage.getItem('tagLine');

        })
        .catch(error => {
            console.error('pin fetch error:', error);
        })
}

/*
Edit dialog function
*/
function editDialog() {
    // get marker to get latlng and update form lat lng fields
    const lat = document.getElementById('create-form-lat').value
    const lng = document.getElementById('create-form-lng').value

    // Find initial state
    let title = null;
    let descDiv = null;
    let layer = null;
    const mdConverter = new showdown.Converter();

    const titleNodes = document.getElementsByClassName('popup-title');
    if (titleNodes) {
        title = titleNodes[0];
    }
    const descDivNodes = document.getElementsByClassName('popup-description');
    if (descDivNodes) {
        descDiv = descDivNodes[0];
    }
    const layerNodes = document.getElementsByClassName('popup-layer')
    if (layerNodes) {
        layer = layerNodes[0];
    }
    // Set state of create form to match
    let formTitle = document.getElementById('create-form-title-input');
    formTitle.value = title.innerHTML;
    let formDesc = document.getElementById('create-form-desc-input');
    formDesc.innerHTML = mdConverter.makeMarkdown(descDiv.innerHTML);
    let formLayer = document.getElementById('create-form-layer-input');
    formLayer.value = layer.textContent;
    let formType = document.getElementById('create-vs-edit-form')
    formType.textContent = 'edit';
    // Pop that thang open
    const dialog = document.getElementById("create-form-dialog");
    dialog.showModal();
}

/*
Key bindings because I'm a sucker for keyboard shortcuts
*/
window.addEventListener("keydown", (e) => {
    if (e.defaultPrevented) {
      return; // Do nothing if the event was already processed
    }

    /*
    Escape key closes:
    - create dialog
    - the first (usually only) open marker popup
    */
    if(e.key === "Escape") {
        const dialog = document.getElementById("create-form-dialog");
        if (dialog.open) {
            hideDialog();
        }
        if (document.getElementsByClassName('leaflet-popup-close-button')[0]) {
            document.getElementsByClassName('leaflet-popup-close-button')[0]
            .click();
        }
    }
})
