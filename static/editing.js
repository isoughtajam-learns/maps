const originalMapCenter = [37.923, -121.921]
let map = L.map('map').setView(originalMapCenter, 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

function displayForm() {
    /*
        Reduce width of map to make space for Form
        Recenter map in new dimensions
        Display Form div
     */
    document.querySelector('#map').style.width = '60%';
    document.querySelector('#form').style.display = 'inline';
    map.invalidateSize();
}

function hideForm() {
    /*
        Increase width of map to 100%
        Hide Form div
        Recenter map in new dimensions
     */
    document.querySelector('#map').style.width = '100%';
    document.querySelector('#form').style.display = 'none';
    map.invalidateSize();
}

/*
    Create a layer group with a marker
    Add a click event listener to the "close-form" button to remove the layer
 */
function createEditLayerWithMarker(latlng) {
    let editing = L.layerGroup().addTo(map);
    let marker = L.marker(latlng).addTo(editing);
    var marker_id = L.stamp(marker);
    document.getElementById('close-form').addEventListener('click',
        function (event) {
            event.preventDefault();
            editing.remove();
        });
}

function onMapClick(e) {
    displayForm();
    createEditLayerWithMarker(e.latlng);
}
map.on('click', onMapClick);
