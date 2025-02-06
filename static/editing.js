const originalMapCenter = [37.923, -121.921]
let map = L.map('map').setView(originalMapCenter, 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
let editLayerGroup = L.layerGroup().addTo(map);
let layerGroups = [];

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
    Create a layer group with a marker
    Add a click event listener to the "close-form" button to remove the layer
 */
function createEditLayerWithMarker(latlng) {
    // let editing = L.layerGroup().addTo(map);
    // let marker = L.marker(latlng).addTo(editing);
    let marker2 = L.marker(latlng).addTo(editLayerGroup);
    let marker_id = L.stamp(marker2);
    // document.getElementById('close-form-button').addEventListener('click',
    //     function (event) {
    //         event.preventDefault();
    //         editing.remove();
    //         editLayerGroup.remove();
    //         console.log('tried to remove edit layer group just now')
    //     });
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
        name: document.getElementById('create-form-name-input').value,
        desc: document.getElementById('create-form-desc-input').value,
        tag: document.getElementById('create-form-tag-input').value,
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
    fetch('/pin/', options)
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
    fetch('/pins/', options)
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
            data.forEach((element) => {
                let lg = L.layerGroup().addTo(map);
                let marker = L.marker([element.lat, element.lng]).addTo(lg);
            });
            // debugger;
        })
        .catch(error => {
            console.error('pin fetch error:', error);
        })
}

function paintMarkers(markers) {
    if (markers != null) {
        markers.forEach((item) => {
            console.log(item)
        });
    }
}