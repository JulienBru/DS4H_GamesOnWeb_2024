export default class pnj {

    constructor(scene, model) {
        this.scene = scene;
        this.model = model;
        this.currentDirection = this.randomDirection();
        this.elapsedTime = 0;
        this.model.position.y = 2.5;
        // pour avoir une position aléatoire lors de la création du pnj
        //this.model.position.x = Math.random() * 100 - 50;
        //this.model.position.z = Math.random() * 100 - 50;

    }
    //Direction Aleatoire
    randomDirection() {
        var angle = Math.random() * Math.PI * 2; // Angle aléatoire
        return new BABYLON.Vector3(Math.sin(angle), 0, Math.cos(angle)); // Vecteur de direction aléatoire sur le plan XZ
    }


    update() {
        this.model.position.addInPlace(this.currentDirection.scale(0.05));

        this.elapsedTime += this.scene.getEngine().getDeltaTime();

        if (this.elapsedTime > 2000) { //attente de 2 secondes
            this.currentDirection = this.randomDirection();
            this.elapsedTime = 0;
        }
    }
}