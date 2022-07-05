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


$("#rotate-btn").on('click', function() {
    visualization.toggleRotation();
});


// Initialize options
$("#rotationSpeedSlider").val(visualization.rotationInterval);
$("#generalizationSlider").val(visualization.generalization);
$("#colorSlicingCheck").prop('checked', visualization.colorSlicing);

const optionModal = new bootstrap.Modal(document.getElementById('optionModal'));
$("#option-btn").on('click', function() {
    optionModal.show();
});

$("#save-btn").on('click', function() {
    visualization.rotationInterval = 100 - parseInt($("#rotationSpeedSlider").val());

    let renderConfigChanged = false;
    let generalization = parseInt($("#generalizationSlider").val());
    if (visualization.generalization !== generalization) {
        visualization.generalization = generalization;
        renderConfigChanged = true;
    }
    let colorSlicing = $("#colorSlicingCheck").prop('checked');
    if (visualization.colorSlicing !== colorSlicing) {
        visualization.colorSlicing = colorSlicing;
        renderConfigChanged = true;
    }

    if (renderConfigChanged) {
        visualization.drawGravityFiled();
    }
    optionModal.hide();
});