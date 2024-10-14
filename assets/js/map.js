var map = L.map('map', {
    zoomControl: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    dragging: false,
}).setView([22, 0], 2);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 2,
    minZoom: 2,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Define ship supply data per country with ISO codes
var shipSupplyData = {
    "BHR": 151, "BGD": 151, "BRN": 51, "CHN": 501, "HKG": 51, "IND": 1001, "IDN": 501,
    "KWT": 151, "MYS": 501, "MDV": 151, "MMR": 151, "OMN": 501, "PHL": 151, "QAT": 501,
    "SAU": 501, "KOR": 151, "LKA": 501, "TWN": 251, "THA": 251, "TUR": 501, "ARE": 501,
    "VNM": 151, "YEM": 151, "CYP": 51, "DNK": 51, "FRA": 51, "IRL": 51, "NLD": 51, 
    "NOR": 51, "GBR": 51, "CAN": 51, "PAN": 151, "USA": 151, "BRA": 51, "EGY": 151, 
    "ZAF": 51, "MAR": 51, "RUS": 151, "CHL": 51, "MEX": 51, "GRC": 1001, "ESP": 51, 
    "DEU": 51, "ITA": 51 
};

// Function to assign color based on ship supply numbers
function getColor(supplies) {
    return supplies > 1000 ? '#800026' :
           supplies > 500  ? '#BD0026' :
           supplies > 250  ? '#E31A1C' :
           supplies > 150  ? '#FC4E2A' :
           supplies > 50   ? '#FD8D3C' :
                             '#FED976';
}

// Style each country based on ship supplies
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
        '<b>' + props.ADMIN + '</b><br />'
        : 'Hover over a country');
};

info.addTo(map);

// Legend for the map
var legend = L.control({ position: 'bottomright' });
legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 50, 150, 250, 500, 1000],
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
