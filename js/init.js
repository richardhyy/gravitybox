let viewerOptions = {
    animation: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    vrButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: true,
    sceneModePicker: false,
    timeline: false,
    navigationHelpButton: false,
    navigationInstructionsInitiallyVisible: false,
    scene3DOnly: true,
    shouldAnimate: true,
};

let viewer = new Cesium.Viewer('cesiumContainer', viewerOptions);
let scene = viewer.scene;
let camera = scene.camera;
let canvas = viewer.canvas;
let globe = scene.globe;
viewer.imageryLayers.removeAll();
viewer.cesiumWidget.creditContainer.style.display = 'none';

globe.show = false
