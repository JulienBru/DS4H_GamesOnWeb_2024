import MaterialManager from "./materialManager.js";

var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);
var scene = new BABYLON.Scene(engine);

// Création du gestionnaire de matériaux
var materialManager = new MaterialManager(scene);
//display debug layer
//scene.debugLayer.show();

var camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2, 10, new BABYLON.Vector3(0, 100, 110), scene);
camera.setTarget(BABYLON.Vector3.Zero());
camera.attachControl(canvas, true);

var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

// import de la carte
//const map = await BABYLON.SceneLoader.ImportMeshAsync("", "../assets/map/", "Map1.glb", scene);
//map.meshes[0].position = new BABYLON.Vector3(-80, 0, 0);
//map.meshes[0].scaling = new BABYLON.Vector3(5, 5, 5);

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

// Matériaux pour différents types de bâtiments
// var houseMaterial = new BABYLON.StandardMaterial("houseMaterial", scene);
//houseMaterial.diffuseTexture = new BABYLON.Texture("../assets/textures/house.jpg", scene);
var buildingMaterial = new BABYLON.StandardMaterial("buildingMaterial", scene);
buildingMaterial.diffuseTexture = new BABYLON.Texture("../assets/textures/building.jpg", scene);

/**taille du batiment */
var houseSize = 15;
/**type de batiment selectionne */
var selectedBuildingType = "building";
/**Nombres de cellules du plateau */
var numCells = 25;
/**positions occupees par des batiments */
var occupiedPositions = [];

var deleteMode = false;

var gold = 50;

// Boutons pour changer la taille des batiments
var buildingButton = document.getElementById("buildingButton");
buildingButton.addEventListener("click", function() {
    houseSize = 15; // Taille pour les bâtiments
    selectedBuildingType = "building"; // Définit le type comme bâtiment
    deleteMode = false;
});

var houseButton = document.getElementById("houseButton");
houseButton.addEventListener("click", function() {
    houseSize = 5; // Taille pour les maisons
    selectedBuildingType = "house"; // Définit le type comme maison
    deleteMode = false;
});

var deleteButton = document.getElementById("deleteButton");
deleteButton.addEventListener("click", function() {
    deleteMode = true;
    scene.onPointerDown = function (evt, pickResult) {
        if(deleteMode && pickResult.hit && pickResult.pickedMesh.name.startsWith("building_") || pickResult.pickedMesh.name.startsWith("house_")){
            var selectedBuilding = pickResult.pickedMesh;
            removeHouse(selectedBuilding);
            alert("batiment supprimé.");
        }
    }});

function updateGoldDisplay() {
    document.getElementById("gold").innerText = "Or: " + gold;

}

/**Creer des particules de fumée 
 * @param {BABYLON.Vector3} position - Position de la fumée
*/
function createSmokeParticles(position) {
    var particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);
    particleSystem.particleTexture = new BABYLON.Texture("../assets/textures/smoke.jpg", scene);

    particleSystem.emitter = position;
    var emitBoxSize = houseSize/2;
    particleSystem.minEmitBox = new BABYLON.Vector3(-emitBoxSize, 0, -emitBoxSize);
    particleSystem.maxEmitBox = new BABYLON.Vector3(emitBoxSize, 0, emitBoxSize);

    particleSystem.color1 = new BABYLON.Color4(1, 1, 1, 1); // Blanc
    particleSystem.color2 = new BABYLON.Color4(1, 1, 1, 1); // Blanc
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.1); // Transparence

    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.5;

    particleSystem.maxLifeTime = 0.3;

    particleSystem.emitRate = 1000;

    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;

    particleSystem.direction1 = new BABYLON.Vector3(-1, 8, -1);
    particleSystem.direction2 = new BABYLON.Vector3(1, 8, 1);

    particleSystem.minEmitPower = 0.5;
    particleSystem.maxEmitPower = 1;
    particleSystem.updateSpeed = 0.005;
    return particleSystem;
}

/**Fonction pour créer le plateau
 * @param {int} boardSize - Taille du plateau
*/
function createBoard(boardSize) {
    for (var x = 0; x < boardSize; x++) {
        for (var z = 0; z < boardSize; z++) {
            var cell = BABYLON.MeshBuilder.CreateBox("cell_" + x + "_" + z, { size: 5 ,height:0.5}, scene);
            cell.position.x = (x - 12) * 5;
            cell.position.y = 0;
            cell.position.z = (z - 12) * 5;
            if ((x + z) % 2 !== 0) {
                cell.material = materialManager.getMaterial("lightGreenMaterial");
            } else {
                cell.material = materialManager.getMaterial("darkGreenMaterial");
            }
        }
    }
}

/**Ajout de l'action de cliquer sur chaque cellule du plateau
 * @param {int} numCells - Nombre de cellules du plateau
*/
function addClickActionToCells(numCells) {
    for (var x = 0; x < numCells; x++) {
        for (var z = 0; z < numCells; z++) {
            var cellName = "cell_" + x + "_" + z;
            var cell = scene.getMeshByName(cellName);

            cell.actionManager = new BABYLON.ActionManager(scene);
            cell.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function (evt) {
                var pickedMesh = evt.meshUnderPointer;
                if (pickedMesh && pickedMesh.name.startsWith("cell")) {
                    var coords = pickedMesh.name.split("_").slice(1);
                    var x = parseInt(coords[0]);
                    var z = parseInt(coords[1]);
                    addHouse(x, z, selectedBuildingType);
                }
            }));
        }
    }
}

/**ajout d'une maison 
 * @param {int} x - position x du batiment
 * @param {int} z - position z du batiment
 * @param {string} type - type de batiment
*/
function addHouse(x, z, type) {
    var newPosX = (x - 12) * 5;
    var newPosZ = (z - 12) * 5;

    var canPlaceBuilding = true; 

    // Vérifiez toutes les constructions existantes pour les zones d'exclusion
    for (var i = 0; i < scene.meshes.length; i++) {
        var mesh = scene.meshes[i];
        if (mesh.name.startsWith("building_") || mesh.name.startsWith("house_")) {
            var existingPosX = mesh.position.x;
            var existingPosZ = mesh.position.z;

            var distanceX = Math.abs(newPosX - existingPosX);
            var distanceZ = Math.abs(newPosZ - existingPosZ);

            // Déterminez la distance d'exclusion en prenant la plus grande valeur pour les constructions concernées
            var exclusionDistanceNew = type === "building" ? 20 : 10; // La distance d'exclusion pour la nouvelle construction
            var exclusionDistanceExisting = mesh.name.startsWith("building_") ? 20 : 10; // La distance pour la construction existante
            var requiredDistance = Math.max(exclusionDistanceNew, exclusionDistanceExisting); 

            // Si la nouvelle construction est dans la zone d'exclusion d'une construction existante, on peut pas la placer 
            if (distanceX < requiredDistance && distanceZ < requiredDistance) {
                canPlaceBuilding = false;
                break;
            }
        }
    }
    // Si aucune zone d'exclusion n'a été trouvée, placez la nouvelle construction
    if (canPlaceBuilding == true && gold > 0) {
        var buildingName = type === "building" ? "building_" : "house_";
        var house = BABYLON.MeshBuilder.CreateBox(buildingName + x + "_" + z, { size: houseSize, height: 7 }, scene);
        house.position.x = newPosX;
        house.position.y = 1.5;
        house.position.z = newPosZ;
        //On utilise darkGreenMaterial pour les buildings et purpleMaterial pour les houses
        house.material = type === "building" ? materialManager.getMaterial("darkGreenMaterial") : materialManager.getMaterial("purpleMaterial");
        //Si c'est un building alors on enlève 20 d'or, si c'est une house alors on enlève 10 d'or
        gold -= type === "building" ? 20 : 10;
        updateGoldDisplay();
        var productionIntervalId = startGoldProduction(houseSize);
        house.productionIntervalId = productionIntervalId;
    } else {
        console.log("Impossible de placer la construction ici en raison de la zone d'exclusion.");
    }
    
}

function removeHouse(house){
    stopGoldProduction(house.productionIntervalId);
    var index = occupiedPositions.findIndex(function(occupiedBuilding){
        return occupiedBuilding.position.equals(house.position);
    });
    if(index != -1){
        occupiedPositions.splice(index, 1);
    }
    house.dispose();
}

//taux de production d'or par taille de batiment
var goldProductionRates={
    5:1,// batiment de taille 5
    15:3 //batiment de taille 15
}
function startGoldProduction(houseSize){
    var productionRate = goldProductionRates[houseSize];
    if(productionRate != undefined){
        return setInterval(function(){
            gold += productionRate;
            updateGoldDisplay();
        }, 1000);
    }
}
function stopGoldProduction(intervalId){
    clearInterval(intervalId);
}

/**mise a jour de la zone de selection 
 * @param {int} x - position x de la zone de selection
 * @param {int} z - position z de la zone de selection
*/
function updateHighlightCube(x, z) {
    // suppression de la zone de selection precedente si elle existe
    removeHighlightCube();

    // creer une nouvelle zone de selection
    var highlightCube = BABYLON.MeshBuilder.CreateBox("highlightCube", { size: houseSize ,height:0.5}, scene);
        
    highlightCube.position.x = (x - 12) * 5;
    highlightCube.position.y = 0.5; //au dessus du sol
    highlightCube.position.z = (z - 12) * 5;

    // Vérification de la possibilité d'ajouter un bâtiment à cette position
    var isPossibleToAddBuilding = isBuildingPositionValid(x, z);

    // Définir la couleur en fonction de la possibilité d'ajouter un bâtiment
    if (isPossibleToAddBuilding) {
        highlightCube.material = materialManager.getMaterial("greenMaterial");
    } else {
        highlightCube.material = materialManager.getMaterial("redMaterial");
    }

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

/** Vérifier si la position est valide pour ajouter un bâtiment 
 * @param {int} x - position x
 * @param {int} z - position z
*/
function isBuildingPositionValid(x, z) {
    
    var buildingPosition = new BABYLON.Vector3((x - 12) * 5, 1.5, (z - 12) * 5);
    var buildingSize = new BABYLON.Vector3(houseSize, 7, houseSize);

    // Calculer les positions des coins du bâtiment
    var buildingTopLeft = buildingPosition.clone();
    var buildingBottomRight = buildingPosition.add(buildingSize);

    // Vérifier la collision avec les bâtiments existants
    var isCollision = occupiedPositions.some(function (occupiedBuilding) {
        var occupiedTopLeft = occupiedBuilding.position;
        var occupiedBottomRight = occupiedBuilding.position.add(occupiedBuilding.size);
        /*
        console.log(buildingTopLeft.x< occupiedBottomRight.x);
        console.log(buildingBottomRight.x > occupiedTopLeft.x);
        console.log(buildingTopLeft.z < occupiedBottomRight.z);
        console.log(buildingBottomRight.z > occupiedTopLeft.z);
        */
        // Vérifier la collision dans l'espace 2D (en ignorant la hauteur)
        return (
            buildingTopLeft.x< occupiedBottomRight.x &&
            buildingBottomRight.x > occupiedTopLeft.x &&
            buildingTopLeft.z < occupiedBottomRight.z &&
            buildingBottomRight.z > occupiedTopLeft.z
        );
    });

    return !isCollision;
}

updateGoldDisplay()
// Création du plateau
createBoard(numCells);
// Ajout de l'action de cliquer sur chaque cellule du plateau
addClickActionToCells(numCells);


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

// redimensionnement de la fenêtre
window.addEventListener("resize", function () {
    engine.resize();
});