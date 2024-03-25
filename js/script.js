var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);
var scene = new BABYLON.Scene(engine);

    // display debug layer
    //scene.debugLayer.show();

// Creation de la camera
var camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2, 10, new BABYLON.Vector3(0, 100, 110), scene);
camera.setTarget(BABYLON.Vector3.Zero());
camera.attachControl(canvas, true);

// Create a light
var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

// Create materials
var orangeMaterial = new BABYLON.StandardMaterial("orangeMaterial", scene);
orangeMaterial.diffuseColor = new BABYLON.Color3(1, 0.5, 0); // Orange color
var whiteMaterial = new BABYLON.StandardMaterial("whiteMaterial", scene);
whiteMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1); // White color
var blackMaterial = new BABYLON.StandardMaterial("blackMaterial", scene);
blackMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0); // Black color
var greenMaterial = new BABYLON.StandardMaterial("greenMaterial", scene);
greenMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0); // Green color

// Create ground cells
for (var x = 0; x < 25; x++) {
    for (var z = 0; z < 25; z++) {
        var cell = BABYLON.MeshBuilder.CreateBox("cell_" + x + "_" + z, { size: 5 }, scene);
        cell.position.x = (x - 12) * 5;
        cell.position.y = 0;
        cell.position.z = (z - 12) * 5;

        if ((x + z) % 2 !== 0) {
            cell.material = blackMaterial;


        } else {
            cell.material = whiteMaterial;
        }
        cell.actionManager = new BABYLON.ActionManager(scene);
        cell.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function (evt) {
                var pickedMesh = evt.meshUnderPointer;
                if (pickedMesh && pickedMesh.name.startsWith("cell")) {
                    var coords = pickedMesh.name.split("_").slice(1);
                    var x = parseInt(coords[0]);
                    var z = parseInt(coords[1]);
                    addCube(x, z);
                }
            }));
    }
}

// Function to add cube
function addCube(x, z) {
    var cube = BABYLON.MeshBuilder.CreateBox("cube_" + x + "_" + z, { size: 15, height: 7 }, scene);
    cube.position.x = (x - 12) * 5;
    cube.position.y = 1.5;
    cube.position.z = (z - 12) * 5;
    cube.material = orangeMaterial; // Red material for the cube
}


engine.runRenderLoop(function () {
    // Get the pick result
    var pickResult = scene.pick(scene.pointerX, scene.pointerY);

    // Create or update the highlight cube
    if (pickResult.hit && pickResult.pickedMesh.name.startsWith("cell")) {
        var coords = pickResult.pickedMesh.name.split("_").slice(1);
        var x = parseInt(coords[0]);
        var z = parseInt(coords[1]);
        updateHighlightCube(x, z);
    } else {
        removeHighlightCube();
    }

    scene.render();
});

// Function to update the highlight cube
function updateHighlightCube(x, z) {
    // Remove the previous highlight cube if exists
    removeHighlightCube();

    // Create a new highlight cube
    var highlightCube = BABYLON.MeshBuilder.CreateBox("highlightCube", { size: 15 ,height:0.5}, scene);
        
    highlightCube.position.x = (x - 12) * 5;
    highlightCube.position.y = 2.5;
    highlightCube.position.z = (z - 12) * 5;
    highlightCube.material = greenMaterial;

    var afterRenderFunction = function() {
        removeHighlightCube();
        scene.unregisterAfterRender(afterRenderFunction); // Unregister the after render function after executing it once
    };

    scene.registerAfterRender(afterRenderFunction);
}

// Function to remove the highlight cube
function removeHighlightCube() {
    var highlightCube = scene.getMeshByName("highlightCube");
    if (highlightCube) {
        highlightCube.dispose();
    }
}

// Handle window resize
window.addEventListener("resize", function () {
    engine.resize();
});