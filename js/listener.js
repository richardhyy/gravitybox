let visualization = new Visualization();

$("#load-btn").on('click', function() {
    // Load model(.glb) and gravity field files.

    browseFile(function(files) {
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