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

// Matériaux pour différents types de bâtiments
//var houseMaterial = new BABYLON.StandardMaterial("houseMaterial", scene);
//houseMaterial.diffuseTexture = new BABYLON.Texture("../assets/textures/house.jpg", scene);
var buildingMaterial = new BABYLON.StandardMaterial("buildingMaterial", scene);
buildingMaterial.diffuseTexture = new BABYLON.Texture("../assets/textures/building.jpg", scene);

/**taille du batiment */
var houseSize = 15;
/**Nombres de cellules du plateau */
var numCells = 25;
/**positions occupees par des batiments */
var occupiedPositions = [];

// Boutons pour changer la taille des batiments
var buildingButton = document.getElementById("buildingButton");
    buildingButton.addEventListener("click", function() {
        houseSize = 15;
            });
var houseButton = document.getElementById("houseButton");
    houseButton.addEventListener("click", function() {
        houseSize = 5;
            });

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
                cell.material = lightGreenMaterial;
            } else {
                cell.material = darkGreenMaterial;
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
                    addHouse(x, z);
                }
            }));
        }
    }
}

/**ajout d'une maison 
 * @param {int} x - position x du batiment
 * @param {int} z - position z du batiment
*/
function addHouse(x, z) {
    var buildingPosition = new BABYLON.Vector3((x - 12) * 5, 1.5, (z - 12) * 5);
    var buildingSize = new BABYLON.Vector3(houseSize, 7, houseSize);

    // calcul des positions des coins du batiment
    var buildingTopLeft = buildingPosition.clone();
    var buildingBottomRight = buildingPosition.add(buildingSize);
    
    //verifier la collision avec les batiments existants
    var isCollision = occupiedPositions.some(function(occupiedBuilding) {
        var occupiedTopLeft = occupiedBuilding.position;
        var occupiedBottomRight = occupiedBuilding.position.add(occupiedBuilding.size);


        //verifier la collision dans l'espace 2D (en ignorant la hauteur)
        return (
            buildingTopLeft.x < occupiedBottomRight.x &&
            buildingBottomRight.x > occupiedTopLeft.x &&
            buildingTopLeft.z < occupiedBottomRight.z &&
            buildingBottomRight.z > occupiedTopLeft.z
        );
    });

    if(!isCollision){

        var house = BABYLON.MeshBuilder.CreateBox("cube_" + x + "_" + z, { size: houseSize }, scene);
        house.position.copyFrom(buildingPosition);
        if (houseSize == 5) {//house
        house.material = purpleMaterial;
        } else {//building


            house.material=purpleMaterial;
            //house.material = buildingMaterial;
            
        }
        //ajout de la maison a la liste des positions occupées
        occupiedPositions.push({ position: buildingPosition, size: buildingSize });
        //particules lors de la creation d'un batiment
        var smoke = createSmokeParticles(new BABYLON.Vector3(house.position.x, house.position.y+houseSize / 2, house.position.z));
        smoke.start();
        setTimeout(function() {
            smoke.stop();
        }, 50);

    }

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
        highlightCube.material = greenMaterial;
    } else {
        highlightCube.material = redMaterial;
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

    // Vérifier si le cube est à l'intérieur des limites de la carte
    //if (buildingTopLeft.x < 0 || buildingBottomRight.x > mapWidth || buildingTopLeft.z < 0 || buildingBottomRight.z > mapHeight) {
    //    return false;
    //}

    // Vérifier la collision avec les bâtiments existants
    var isCollision = occupiedPositions.some(function (occupiedBuilding) {
        var occupiedTopLeft = occupiedBuilding.position;
        var occupiedBottomRight = occupiedBuilding.position.add(occupiedBuilding.size);

        // Vérifier la collision dans l'espace 2D (en ignorant la hauteur)
        return (
            buildingTopLeft.x < occupiedBottomRight.x &&
            buildingBottomRight.x > occupiedTopLeft.x &&
            buildingTopLeft.z < occupiedBottomRight.z &&
            buildingBottomRight.z > occupiedTopLeft.z
        );
    });

    return !isCollision;
}

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