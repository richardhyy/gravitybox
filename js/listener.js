let visualization = new Visualization();
let library = new Library();

$("#library-btn").on("click", function () {
    removeIntroductionFlashing();

    // Show library
    let libraryDiv = $("#library");
    let offcanvas = new bootstrap.Offcanvas(libraryDiv);
    offcanvas.show();
});

$("#load-btn").on('click', function() {
    removeIntroductionFlashing();

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
            } else {
                showErrorToast("Unsupported file type: " + file.name);
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

        // Show tip if not both model and gravity field are loaded
        if (files.length === 1) {
            showTipToast("Select both model (.glb) and gravity field (.csv) files to display them together.");
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
$("#singleColorOption").css('display', visualization.colorSlicing ? 'none' : 'block');
$("#singleColorInput").val(Visualization.rgbaToRgbCssHexColor(visualization.singleColor.toRgba()));

const optionModal = new bootstrap.Modal(document.getElementById('optionModal'));
$("#option-btn").on('click', function() {
    optionModal.show();
});

$("#colorSlicingCheck").on('change', function() {
    // Show/hide single color input
    let checked = $(this).prop('checked');
    $("#singleColorOption").css('display', checked ? 'none' : 'block');
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
    if (!colorSlicing) {
        // Only update the single color if the color slicing is disabled
        let singleColor = $("#singleColorInput").val();
        if (Visualization.rgbaToRgbCssHexColor(visualization.singleColor.toRgba()) !== singleColor) {
            visualization.singleColor = new Cesium.Color.fromCssColorString(singleColor);
            renderConfigChanged = true;
        }
    }

    if (renderConfigChanged) {
        visualization.drawGravityFiled();
    }
    optionModal.hide();
});
