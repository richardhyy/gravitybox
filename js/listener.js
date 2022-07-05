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
            loadModelFromLocal(modelFile);
        }

        if (gravityFile) {
            loadGravityFieldFromLocal(gravityFile);
        }
    });
});