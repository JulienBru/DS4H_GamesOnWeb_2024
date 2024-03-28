export default class house {
    
    constructor(x ,z) {
        this.x = x;
        this.z = z;
        this.type = "house";
        this.mesh = null;
    }

    createHouse(scene) {
        //Creation de la maison
        this.mesh = BABYLON.MeshBuilder.CreateBox("cube_" + this.x + "_" + this.z, { size: houseSize, height: 5 }, scene);
        this.mesh.position.x = (this.x - 12) * 5;
        this.mesh.position.y = 1.5;
        this.mesh.position.z = (this.z - 12) * 5;
        this.mesh.material = purpleMaterial;
        
        //particules lors de la creation d'une maison
        var smoke = createSmokeParticles(new BABYLON.Vector3(this.mesh.position.x, this.mesh.position.y + 5, this.mesh.position.z));
        smoke.start();
        setTimeout(function() {
            smoke.stop();
        }, 50);
    }

    destroyHouse() {
        this.mesh.dispose();
    }

}