const originalMapCenter = [37.923, -121.921]
let map = L.map('map').setView(originalMapCenter, 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
let editLayerGroup = L.layerGroup().addTo(map);
let overlayMaps = {};

function displayForm() {
    /*
        Reduce width of map to make space for Form
        Recenter map in new dimensions
        Display Form div
     */
    document.querySelector('#map').style.width = '60%';
    document.querySelector('#create-form').style.display = 'inline';
    map.invalidateSize();
}

function hideForm() {
    /*
        Increase width of map to 100%
        Hide Form div
        Recenter map in new dimensions
     */
    document.querySelector('#map').style.width = '100%';
    document.querySelector('#create-form').style.display = 'none';
    // map.invalidateSize();
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
Form button functionality
 */
// let btn = document.getElementById('close-form-button');

function submitMarker(e) {
    // grab data from the form
    const jsonData = {
        title: document.getElementById('create-form-title-input').value,
        desc: document.getElementById('create-form-desc-input').value,
        layer: document.getElementById('create-form-layer-input').value,
        lat: editLayerGroup.getLayers()[0].getLatLng().lat,
        lng: editLayerGroup.getLayers()[0].getLatLng().lng
    };

    // Set up options for the fetch request
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // Set content type to JSON
        },
        body: JSON.stringify(jsonData) // Convert JSON data to a string and set it as the request body
    };

    // Make the fetch request with the provided options
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
            // debugger;
            groupNames.forEach((groupName) => {
                let lg = L.layerGroup().addTo(map);
                data[groupName].forEach((item) => {
                    let marker = L.marker([item.lat, item.lng]).addTo(lg);
                    marker.bindPopup("<div class='popup'><h4" +
                        " class='popupTitle'>" + item.title + "</h4><p" +
                        " class='popupDescription'>" + item.desc + "</p><h6" +
                        " class='layer'>" + item.layer + "</h6></div>");
                });
                overlayMaps[groupName] = lg;
            });
            if (Object.keys(overlayMaps).length !== 0) {
                let layerControl = L.control.layers([], overlayMaps).addTo(map);
            }
            // debugger;
        })
        .catch(error => {
            console.error('pin fetch error:', error);
        })
}
