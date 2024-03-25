var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);
var scene = new BABYLON.Scene(engine);

//display debug layer
//scene.debugLayer.show();

var camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2, 10, new BABYLON.Vector3(0, 100, 110), scene);
camera.setTarget(BABYLON.Vector3.Zero());
camera.attachControl(canvas, true);

var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

// import de la carte
const map = await BABYLON.SceneLoader.ImportMeshAsync("", "../assets/map/", "Map1.glb", scene);
map.meshes[0].position = new BABYLON.Vector3(-80, 0, 0);
map.meshes[0].scaling = new BABYLON.Vector3(5, 5, 5);

	// Ground
	var groundTexture = new BABYLON.Texture("../assets/textures/water.png", scene);
	groundTexture.vScale = groundTexture.uScale = 4.0;
	var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
	groundMaterial.diffuseTexture = groundTexture;
	var ground = BABYLON.Mesh.CreateGround("ground", 1000, 1000, 32, scene, false);
	ground.material = groundMaterial;
    ground.position.y = -5;

	// Water
	var waterMesh = BABYLON.Mesh.CreateGround("waterMesh", 1000, 1000, 32, scene, false);
	var water = new BABYLON.WaterMaterial("water", scene, new BABYLON.Vector2(1024, 1024));
	water.backFaceCulling = true;
	water.bumpTexture = new BABYLON.Texture("../assets/textures/waterbump.jpg", scene);
	water.windForce = -5;
	water.waveHeight = 0.5;
	water.bumpHeight = 0.1;
	water.waveLength = 0.1;
	water.colorBlendFactor = 0;
	water.addToRenderList(ground);
	waterMesh.material = water;
    waterMesh.position.y = -4.9;


// materiaux
var redMaterial = new BABYLON.StandardMaterial("redMaterial", scene);
var lightGreenMaterial = new BABYLON.StandardMaterial("lightGreenMaterial", scene);
var greenMaterial = new BABYLON.StandardMaterial("greenMaterial", scene);
var darkGreenMaterial = new BABYLON.StandardMaterial("darkGreenMaterial", scene);
var purpleMaterial = new BABYLON.StandardMaterial("purpleMaterial", scene);
redMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0); // rouge
lightGreenMaterial.diffuseColor = new BABYLON.Color3(0.5, 1, 0); // vert clair
greenMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0); // vert
darkGreenMaterial.diffuseColor = new BABYLON.Color3(0, 0.5, 0); // vert foncé
purpleMaterial.diffuseColor = new BABYLON.Color3(0.5, 0, 0.5); // violet

var houseSize = 15;

// creation du quadrillage au sol
for (var x = 0; x < 25; x++) {
    for (var z = 0; z < 25; z++) {
        var cell = BABYLON.MeshBuilder.CreateBox("cell_" + x + "_" + z, { size: 5 }, scene);
        cell.position.x = (x - 12) * 5;
        cell.position.y = 0;
        cell.position.z = (z - 12) * 5;
        if ((x + z) % 2 !== 0) {
            cell.material = lightGreenMaterial;


        } else {
            cell.material = darkGreenMaterial;
        }
        cell.actionManager = new BABYLON.ActionManager(scene);
        cell.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function (evt) {
                var pickedMesh = evt.meshUnderPointer;
                if (pickedMesh && pickedMesh.name.startsWith("cell")) {
                    var coords = pickedMesh.name.split("_").slice(1);
                    var x = parseInt(coords[0]);
                    var z = parseInt(coords[1]);
                    addHouse(x, z);
                }
            }));
    }
}

/**ajout d'une maison */
function addHouse(x, z) {
    var house = BABYLON.MeshBuilder.CreateBox("cube_" + x + "_" + z, { size: houseSize, height: 7 }, scene);
    house.position.x = (x - 12) * 5;
    house.position.y = 1.5;
    house.position.z = (z - 12) * 5;
    house.material = purpleMaterial;
}
var buildingButton = document.getElementById("buildingButton");
    buildingButton.addEventListener("click", function() {
        houseSize = 15;
            });
var houseButton = document.getElementById("houseButton");
    houseButton.addEventListener("click", function() {
        houseSize = 5;
            });


engine.runRenderLoop(function () {
    // position de la souris
    var pickResult = scene.pick(scene.pointerX, scene.pointerY);

    // creation/maj de la zone de selection
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

/**mise a jour de la zone de selection */
function updateHighlightCube(x, z) {
    // suppression de la zone de selection precedente si elle existe
    removeHighlightCube();

    // creer une nouvelle zone de selection
    var highlightCube = BABYLON.MeshBuilder.CreateBox("highlightCube", { size: houseSize ,height:0.5}, scene);
        
    highlightCube.position.x = (x - 12) * 5;
    highlightCube.position.y = 2.5;
    highlightCube.position.z = (z - 12) * 5;
    highlightCube.material = redMaterial;

    var afterRenderFunction = function() {
        removeHighlightCube();
        scene.unregisterAfterRender(afterRenderFunction); // Désenregistre la fonction after render après l'avoir exécutée une fois
    };

    scene.registerAfterRender(afterRenderFunction);
}

/** Supprimer la zone de selection*/
function removeHighlightCube() {
    var highlightCube = scene.getMeshByName("highlightCube");
    if (highlightCube) {
        highlightCube.dispose();
    }
}

// redimensionnement de la fenêtre
window.addEventListener("resize", function () {
    engine.resize();
});