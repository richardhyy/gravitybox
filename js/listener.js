let visualization = new Visualization();

$("#load-btn").on('click', function() {
    // Load model(.glb) and gravity field files.
    browseFile(function(files) {
        // Clear previous data
        visualization.clear();
        
        let modelFile = null;
        let gravityFile = null;

        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            if (file.name.endsWith('.glb')) {
                modelFile = file;
            } else if (file.name.endsWith('.csv')) {
                gravityFile = file;
            }
        }

        if (modelFile) {
            console.log("Loading model: " + modelFile.name);
            visualization.loadModelFromLocal(modelFile);
        }

        if (gravityFile) {
            console.log("Loading gravity field: " + gravityFile.name);
            visualization.loadGravityFieldFromLocal(gravityFile);
        }
    });
});


$("#screenshot-btn").on('click', function() {
    let a = document.createElement('a');
    viewer.render();
    a.href = viewer.canvas.toDataURL("image/png");
    a.download = "GravityBox_Export.png";
    a.click();
});


let rotationTimer = null;
$("#rotate-btn").on('click', function() {
    if (rotationTimer) {
        clearInterval(rotationTimer);
        rotationTimer = null;
    } else {
        rotationTimer = setInterval(function() {
            camera.rotate(Cesium.Cartesian3.UNIT_Z, Cesium.Math.toRadians(0.2));
        }, 50);
    }
});