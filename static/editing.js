const originalMapCenter = [37.80822410973752, -122.27024219885426]
let map = L.map('map', {
    center: originalMapCenter,
    zoom: 16
});

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
let editLayerGroup = L.layerGroup().addTo(map);
let overlayMaps = {};

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

function displayForm() {
    /*
        Reduce width of map to make space for Form
        Recenter map in new dimensions
        Display Form div
     */
    document.querySelector('#map').style.width = '60%';
    document.querySelector('#create-form').style.display = 'inline';
}

function hideForm() {
    /*
        Increase width of map to 100%
        Hide Form div
        Recenter map in new dimensions
     */
    document.querySelector('#create-form').style.display = 'none';
    document.querySelector('#map').style.width = '100%';
    recenterOnCurrent();
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
    displayForm();
    let marker_id = createEditLayerWithMarker(e.latlng);
    console.log('created edit layer');
}
map.on('click', onMapClick);

/*
    Form submit functionality
 */
function submitMarker(e) {
    // grab data from the form and add lat lon
    const jsonData = {
        title: document.getElementById('create-form-title-input').value,
        description: document.getElementById('create-form-desc-input').value,
        layer: document.getElementById('create-form-layer-input').value,
        lat: editLayerGroup.getLayers()[0].getLatLng().lat,
        lng: editLayerGroup.getLayers()[0].getLatLng().lng
    };

    // Set up options for the POST fetch request
    const options = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json' // Set content type to JSON
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
            })
            .catch(error => {
                // Handle any errors that occurred during the fetch
                console.error('Fetch error:', error);
            });
    }
}

function getMarkersAndDisplay() {
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    }
    fetch('/pins', options)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            /*
                Add all retrieved points to a new LayerGroup with a named key
                in layerGroups
             */
            console.log('Got markers ', data);
            let groupNames = Object.keys(data);
            groupNames.forEach((groupName) => {
                let lg = L.layerGroup().addTo(map);
                data[groupName].forEach((item) => {
                    let marker = L.marker([item.lat, item.lng]).addTo(lg);
                    marker.bindPopup("<div id='popupControls'></div><div" +
                        " class='popup'><h4" +
                        " class='popupTitle'>" + item.title + "</h4><p" +
                        " class='popupDescription'>" + markdown.toHTML(item.description) + "</p><h6" +
                        " class='layer'>" + groupName + "</h6></div>");
                });
                overlayMaps[groupName] = lg;
            });
            if (Object.keys(overlayMaps).length !== 0) {
                let layerControl = L.control.layers([], overlayMaps).addTo(map);
            }
            recenterOnCurrent();
        })
        .catch(error => {
            console.error('pin fetch error:', error);
        })
}
