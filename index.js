var hereUrl = 'https://1.base.maps.api.here.com/maptile/2.1/maptile/newest/normal.day/{z}/{x}/{y}/256/png8?app_id=S3SY3GkmTPi6s8GZduuc&app_code=XwZ98yV24DTB-8PYwEU1mQ';

var foodPointStyle = new ol.style.Style({
  image: new ol.style.Circle({
    radius: 7,
    fill: new ol.style.Fill({color: 'black'}),
    stroke: new ol.style.Stroke({
      color: [255,0,0], width: 2
    })
  })
});

var touristPointStyle = new ol.style.Style({
  image: new ol.style.Circle({
    radius: 7,
    fill: new ol.style.Fill({color: 'yellow'}),
    stroke: new ol.style.Stroke({
      color: [255,0,0], width: 2
    })
  })
});

var transportPointStyle = new ol.style.Style({
  image: new ol.style.Circle({
    radius: 7,
    fill: new ol.style.Fill({color: 'white'}),
    stroke: new ol.style.Stroke({
      color: [255,0,0], width: 2
    })
  })
});

var styleFunction = function(feature) {
  const {category} = feature.getProperties();
  if (category === 'tourist') {
    return touristPointStyle
  } else if (category === 'food') {
    return foodPointStyle;
  } else if (category === 'transport') {
    return transportPointStyle;
  }
  return foodPointStyle;
};

var vectorSource = new ol.source.Vector({
  features: (new ol.format.GeoJSON()).readFeatures(allFeatures)
});

var vectorSourceFile = new ol.source.Vector({
  url: 'data/features.geojson',
  format: new ol.format.GeoJSON()
});

var vectorLayer = new ol.layer.Vector({
  source: vectorSource,
  style: styleFunction
});

var mousePositionControl = new ol.control.MousePosition({
  coordinateFormat: ol.coordinate.createStringXY(4),
  projection: 'EPSG:4326',
  undefinedHTML: '&nbsp;'
});

var mousePositionControl2 = new ol.control.MousePosition({
  coordinateFormat: ol.coordinate.createStringXY(0),
  projection: 'EPSG:3857',
  undefinedHTML: '&nbsp;'
});

var selectPointerMove = new ol.interaction.Select({
  condition: ol.events.condition.singleclick
});

selectPointerMove.on('select', (evt) => {
  if (evt.selected && evt.selected.length > 0) {
    var feature = evt.selected[0];
    var coordinates = feature.getGeometry().flatCoordinates;
    if (coordinates) {
      var title = feature.getProperties().title;
      document.getElementById('popup').innerHTML = buildPopupHTML(feature);
      overlay.setPosition(coordinates);
    }
  } else {
    overlay.setPosition(undefined);
  }
});

var buildPopupHTML = (feature) => {
  const {title, description, link} = feature.getProperties();
  return `
  <h10>${title}</h10>
  <hr>
  <h11>${description}</h11>
  <h10><a href=${link} target='_blank'>Link</a></h10>
  `;
}

var overlay = new ol.Overlay({
  positioning: 'bottom-right',
  element: document.getElementById('popup'),
  position: undefined
});

var coordinatesOverlay = new ol.Overlay({
  positioning: 'bottom-right',
  element: document.getElementById('coordinates-popup'),
  position: undefined
});

var map = new ol.Map({
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM()
    }),
    //   new ol.layer.Tile({
    //   visible: false,
    //   preload: Infinity,
    //   source: new ol.source.XYZ({
    //     url: hereUrl,
    //     attributions: 'Map Tiles &copy; ' + new Date().getFullYear() + ' ' +
    //       '<a href="http://developer.here.com">HERE</a>'
    //   })
    // }),
    vectorLayer
  ],
  target: 'map',
  view: new ol.View({
    center: [-1033500, 4700000],
    zoom: 11,
    minZoom: 8
  }),
  controls: ol.control.defaults().extend([mousePositionControl2]),
  interactions: ol.interaction.defaults().extend([selectPointerMove]),
  overlays: new ol.Collection([overlay, coordinatesOverlay])
});

map.on('singleclick', (evt) => {
  const coordPos = coordinatesOverlay.getPosition();
  if (coordPos) {
    coordinatesOverlay.setPosition(undefined);
  } else {
    showCoordinatePopup(evt);
  }
});

var showCoordinatePopup = (evt) => {
  const coordinates = evt.coordinate;
  const pixel = map.getPixelFromCoordinate(coordinates);
  const featuresAtPixel = map.getFeaturesAtPixel(pixel);
  if (featuresAtPixel.length === 0) {
    const stringCoord = ol.coordinate.format(coordinates, '[{x},{y}]', 0);
    document.getElementById('coordinates-popup').innerHTML = `<h10>${stringCoord}</h10>`;
    coordinatesOverlay.setPosition(coordinates);
  }
}
