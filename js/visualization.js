class Visualization {
    gravityField;
    magnitudeRange;
    rotationInterval = 50;
    rotationAxes = [0, 0, 0.2]; // Z-Axis for 0.2 deg per frame by default
    #currentRotationInterval = 50;
    rotationTimer = null;
    generalization = 50;
    colorSlicing = true;
    singleColor = Cesium.Color.AQUA;

    #modelEntity = null;
    #isGravityFieldLoaded = false;

    constructor() {
        this.gravityField = [];
        this.magnitudeRange = [Number.MIN_VALUE, Number.MAX_VALUE];
    }

    clear(model = true, gravityField = true) {
        if (model) {
            viewer.entities.remove(this.#modelEntity);
            this.#modelEntity = null;
        }
        if (gravityField) {
            viewer.entities.removeAll();
            if (this.#modelEntity) {
                // Re-add the model
                viewer.entities.add(this.#modelEntity);
                viewer.trackedEntity = this.#modelEntity;
            }
        }
    }

    get isRotating() {
        return this.rotationTimer !== null;
    }

    toggleRotation() {
        if (this.rotationTimer) {
            clearInterval(this.rotationTimer);
            this.rotationTimer = null;
        } else {
            let instance = this;
            let rotate = function() {
                // Check if the rotation interval has changed
                if (instance.#currentRotationInterval !== instance.rotationInterval) {
                    clearInterval(instance.rotationTimer);
                    instance.#currentRotationInterval = instance.rotationInterval;
                    instance.rotationTimer = setInterval(rotate, instance.rotationInterval);
                }
                // Rotate the camera
                if (instance.rotationAxes[0] !== 0) {
                    camera.rotate(Cesium.Cartesian3.UNIT_X, Cesium.Math.toRadians(instance.rotationAxes[0]));
                }
                if (instance.rotationAxes[1] !== 0) {
                    camera.rotate(Cesium.Cartesian3.UNIT_Y, Cesium.Math.toRadians(instance.rotationAxes[1]));
                }
                if (instance.rotationAxes[2] !== 0) {
                    camera.rotate(Cesium.Cartesian3.UNIT_Z, Cesium.Math.toRadians(instance.rotationAxes[2]));
                }
            };
            this.rotationTimer = setInterval(rotate, this.rotationInterval);
        }
    }

    loadModel(url, name, scale = 800) {
        // Remove the old model
        if (this.#modelEntity) {
            viewer.entities.remove(this.#modelEntity);
        }

        let origin = Cesium.Cartesian3.fromArray([0, 0, 0]);
        this.#modelEntity = viewer.entities.add({
            name: name,
            position: origin,
            orientation: Cesium.Transforms.headingPitchRollQuaternion(
                origin, new Cesium.HeadingPitchRoll(
                    Cesium.Math.toRadians(180),
                    Cesium.Math.toRadians(90),
                    0)
            ),
            model: {
                uri: url,
                minimumPixelSize: 128,
                maximumScale: 20000,
                scale: scale,
            }
        });
        viewer.trackedEntity = this.#modelEntity;
    }

    loadModelFromLocal(file) {
        this.loadModel(URL.createObjectURL(file), file.name);
    }

    drawGravityFiled() {
        showProcessingToast("Rendering...");
        if (!this.#isGravityFieldLoaded) {
            // Do not do clear() if the gravity field has not been loaded
            this.clear(false, true);
        }
        Visualization.displayGravityField(this.gravityField, this.maginitudeRange, this.singleColor, this.colorSlicing, this.generalization);
    }

    /**
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
     * @param data The gravity field data in CSV format
     */
    async parseAndLoadGravityField(data) {
        const promise = new Promise((resolve, reject) => {
            setTimeout(() => {
                let lines = data.split('\n');
                this.gravityField = [];

                let minMagnitude = Number.MAX_VALUE;
                let maxMagnitude = Number.MIN_VALUE;

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
                        this.gravityField.push({
                            x: x,
                            y: y,
                            z: z,
                            vx: vx,
                            vy: vy,
                            vz: vz,
                            magnitude: magnitude,
                        });

                        // Update min and max magnitude
                        if (magnitude < minMagnitude) {
                            minMagnitude = magnitude;
                        }
                        if (magnitude > maxMagnitude) {
                            maxMagnitude = magnitude;
                        }
                    }
                }

                this.maginitudeRange = [minMagnitude, maxMagnitude];
                resolve();
            }, 0);
        });


        showProcessingToast("Loading gravity field...", 1000);
        promise.then(() => {
            this.drawGravityFiled();
        });
    }

    loadGravityFieldFromLocal(file) {
        let reader = new FileReader();

        let instance = this;
        reader.onload = function (e) {
            let data = e.target.result;
            instance.parseAndLoadGravityField(data);
        }
        reader.readAsText(file);
    }


    // MARK: - Helper methods

    static SCALE_FACTOR = 1.5e6;

    static createArrowEntity(id, start, direction, magnitude, color = Cesium.Color.AQUA) {
        // console.log("createArrowEntity: " + id + ", " + start + ", " + direction + ", " + magnitude);
        const scaledDirection = new Cesium.Cartesian3();
        Cesium.Cartesian3.multiplyByScalar(direction, Visualization.SCALE_FACTOR, scaledDirection);
        const scaledEnd = new Cesium.Cartesian3();
        Cesium.Cartesian3.add(start, scaledDirection, scaledEnd);
        // let endPosition = Cesium.Cartesian3.add(Cesium.Cartesian3.fromArray(position), Cesium.Cartesian3.multiplyByScalar(Cesium.Cartesian3.fromArray(direction), scale));
        return viewer.entities.add({
            id: id,
            polyline: {
                positions: [start, scaledEnd],
                width: 5,
                arcType: Cesium.ArcType.NONE,
                material: new Cesium.PolylineArrowMaterialProperty(color),
            }
        });
    }

    static generateColorSlices(magnitudeRange) {
        let colorSlices = [];
        let minMagnitude = magnitudeRange[0] * Visualization.SCALE_FACTOR;
        let maxMagnitude = magnitudeRange[1] * Visualization.SCALE_FACTOR;
        let magnitudeRangeLength = maxMagnitude - minMagnitude;
        let colorSlicing = magnitudeRangeLength / 10;
        for (let i = 0; i < colorSlicing; i++) {
            let red = Math.floor(255 * (i / colorSlicing));
            let green = Math.floor(255 * (1 - i / colorSlicing));
            let blue = Math.floor(128 * (1 - i / colorSlicing));
            let rgba = red | (green << 8) | (blue << 16) | 255 << 24;
            colorSlices.push(Cesium.Color.fromRgba(rgba));
        }
        return colorSlices;
    }

    static rgbaToCssColor(rgba) {
        let red = rgba & 255;
        let green = (rgba >> 8) & 255;
        let blue = (rgba >> 16) & 255;
        let alpha = (rgba >> 24) & 255;
        return "rgba(" + red + "," + green + "," + blue + "," + alpha + ")";
    }

    static rgbaToRgbCssHexColor(rgba) {
        let red = rgba & 255;
        let green = (rgba >> 8) & 255;
        let blue = (rgba >> 16) & 255;
        return "#" + ((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1);
    }

    static displayGravityField(gravityField, magnitudeRange, defaultColor, colorSlicing = true, generalization = 0) {
        let colorSlices = colorSlicing ? Visualization.generateColorSlices(magnitudeRange) : [];
        let colorCount = colorSlices.length;
        let color = defaultColor; // Declare outside the loop for better performance

        // Update legend
        $('#legend').css('display', 'block');
        // let labelContainer = $('#gradient-bar-label-container');
        let gradientBar = $('#gradient-bar');
        if (colorSlicing) {
            // Update gradient bar
            let minColor = Visualization.rgbaToCssColor(colorSlices[0].toRgba());
            let maxColor = Visualization.rgbaToCssColor(colorSlices[colorCount - 1].toRgba());
            gradientBar.css('background', 'linear-gradient(to right, ' + minColor + ' 0%, ' + maxColor + ' 100%)');
            // Update gradient bar labels
            $('#gradient-bar-label-min').text(magnitudeRange[0].toExponential());
            $('#gradient-bar-label-max').text(magnitudeRange[1].toExponential());
        } else {
            // Update gradient bar
            gradientBar.css('background', Visualization.rgbaToCssColor(color.toRgba()));
        }

        let arraySize = gravityField.length;
        for (let i = 0; i < arraySize; i += generalization) {
            if (i + generalization >= arraySize) {
                // Reached the end of the array.
                break;
            }

            let gravity = gravityField[i];
            let position = Cesium.Cartesian3.fromArray([gravity.x, gravity.y, gravity.z]);
            let direction = Cesium.Cartesian3.fromArray([gravity.vx, gravity.vy, gravity.vz]);
            let magnitude = gravity.magnitude * Visualization.SCALE_FACTOR;
            if (colorSlicing) {
                let colorIndex = Math.floor(magnitude / (magnitudeRange[1] * Visualization.SCALE_FACTOR) * colorCount);
                color = colorSlices[colorIndex];
            }
            try {
                viewer.entities.add(Visualization.createArrowEntity(position.toString(), position, direction, magnitude, color));
            } catch (e) {
                // ignore
            }
        }

        showSuccessToast("Completed loading gravity field.");
    }
}