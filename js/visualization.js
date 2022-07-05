
function createArrowEntity(id, start, direction, magnitude, scale = 1e6) {
    // console.log("createArrowEntity: " + id + ", " + start + ", " + direction + ", " + magnitude);
    const scaledDirection = new Cesium.Cartesian3();
    Cesium.Cartesian3.multiplyByScalar(direction, scale, scaledDirection);
    const scaledEnd = new Cesium.Cartesian3();
    Cesium.Cartesian3.add(start, scaledDirection, scaledEnd);
    // let endPosition = Cesium.Cartesian3.add(Cesium.Cartesian3.fromArray(position), Cesium.Cartesian3.multiplyByScalar(Cesium.Cartesian3.fromArray(direction), scale));
    return viewer.entities.add({
        id: id,
        polyline: {
            positions: [start, scaledEnd],
            width: 5,
            arcType: Cesium.ArcType.NONE,
            material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.AQUA),
        }
    });
}

function displayGravityField(gravityField, generalization = 0) {
    let arraySize = gravityField.length;
    for (let i = 0; i < arraySize; i += generalization) {
        if (i + generalization >= arraySize) {
            // Reached the end of the array.
            break;
        }

        let gravity = gravityField[i];
        let position = Cesium.Cartesian3.fromArray([gravity.x, gravity.y, gravity.z]);
        let direction = Cesium.Cartesian3.fromArray([gravity.vx, gravity.vy, gravity.vz]);
        let magnitude = gravity.magnitude;
        try {
            viewer.entities.add(createArrowEntity(position.toString(), position, direction, magnitude));
        } catch (e) {
            // ignore
        }
    }
}


function loadModelFromLocal(file) {
    viewer.trackedEntity = viewer.entities.add({
        name: file.name,
        position: Cesium.Cartesian3.fromArray([0, 0, 0]),
        model: {
            uri: URL.createObjectURL(file),
            minimumPixelSize: 128,
            maximumScale: 20000,
            scale: 1000,
        }
    });
}

/**
 * Load gravity field and display it on the globe.
 *
 * Gravity field is stored in CSV format.
 * Example:
 *     X,Y,Z,vx,vy,vz,magnitude
 *     863.231,858.334,-894.48,-0.00012133897,-7.708104e-05,0.00014079923,2.012189e-04
 *     -139.379,-111.336,664.522,-5.9072579e-05,7.4224222e-05,-0.00015600021,1.825784e-04
 *     1462.14,800.097,-108.185,-9.3859891e-05,-0.00016077051,1.9851351e-05,1.872189e-04
 *     552.259,776.107,-1311.33,-9.3702723e-05,-5.764331e-05,0.00015872963,1.931270e-04
 *     -834.578,127.638,1596.9,4.0398975e-06,1.8306627e-05,-0.00018179422,1.827583e-04
 * where X, Y, Z is the position, and vx, vy, vz is the direction.
 *
 * @param file {File}
 */
function loadGravityFieldFromLocal(file) {
    let reader = new FileReader();
    reader.onload = function(e) {
        let data = e.target.result;
        let lines = data.split('\n');
        let gravityField = [];

        for (let i = 1; i < lines.length; i++) { // Skip the first line (header)
            let line = lines[i];
            let values = line.split(',');
            if (values.length >= 7) {
                let x = parseFloat(values[0]);
                let y = parseFloat(values[1]);
                let z = parseFloat(values[2]);
                let vx = parseFloat(values[3]);
                let vy = parseFloat(values[4]);
                let vz = parseFloat(values[5]);
                let magnitude = parseFloat(values[6]);
                gravityField.push({
                    x: x,
                    y: y,
                    z: z,
                    vx: vx,
                    vy: vy,
                    vz: vz,
                    magnitude: magnitude,
                });
            }
        }
        displayGravityField(gravityField, 50);
    }
    reader.readAsText(file);
}
