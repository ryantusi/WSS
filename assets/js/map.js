var map = L.map('map', {
    zoomControl: false,         // Disable zoom control
    scrollWheelZoom: false,     // Disable zoom by scroll
    doubleClickZoom: false,     // Disable zoom by double-click
    dragging: false,            // Disable dragging (panning)
}).setView([22, 0], 2);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 2,   // Lock zoom level
    minZoom: 2,   // Lock zoom level
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map); 

// Define fictional ship supply data per country with ISO codes
var shipSupplyData = {
    "USA": 500,
    "CAN": 250,
    "BRA": 120,
    "GBR": 300,
    "RUS": 400,
    "IND": 600,
    "CHN": 750,
    "AUS": 200,
    "ZAF": 150,
    "FRA": 275,
    "DEU": 325
};

// Function to assign color based on ship supply numbers
function getColor(supplies) {
    return supplies > 700 ? '#800026' :
           supplies > 500 ? '#BD0026' :
           supplies > 300 ? '#E31A1C' :
           supplies > 200 ? '#FC4E2A' :
           supplies > 100 ? '#FD8D3C' :
                            '#FED976';
}

// Style each country based on the ship supplies
function style(feature) {
    var supplies = shipSupplyData[feature.properties.ISO_A3] || 0;  // Use ISO_A3 code to match data
    return {
        fillColor: getColor(supplies),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

// Highlight on hover
function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });
    layer.bringToFront();
    info.update(layer.feature.properties);
}

// Reset the highlight when not hovered
function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

// Zoom to country on click
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

// Define interactions with each country
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

// Add GeoJSON data for world countries
var geojson = new L.GeoJSON.AJAX("https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson", {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);

// Control for displaying ship supply info
var info = L.control();
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

// Update the info box on hover
info.update = function (props) {
    this._div.innerHTML = '<h4>Ship Supplies Worldwide</h4>' + (props ?
        '<b>' + props.ADMIN + '</b><br />' + (shipSupplyData[props.ISO_A3] || 0) + ' supplies'
        : 'Hover over a country');
};

info.addTo(map);

// Legend for the map
var legend = L.control({ position: 'bottomright' });
legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 100, 200, 300, 500, 700],
        labels = [];

    // Create a colored square for each supply range
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map);