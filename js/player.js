export default class Player{

    constructor(){
        this.x = 0;
        this.y = 3;
        this.z = -1;
        this.size = 1;
        this.mesh = null;
        this.jumpColwdown = 600;
        this.lastjumpTime = 0;
        this.jumptime = 350;
        this.jump = false;
        


    }

    createPlayer(scene){
        this.mesh = BABYLON.MeshBuilder.CreateSphere("player", {}, scene);
        this.mesh.position = new BABYLON.Vector3(this.x, this.y, this.z);
        this.mesh.checkCollisions = true;
        this.mesh.size = this.size;
        var materialPlayer = new BABYLON.StandardMaterial("playerMaterial", scene);
        materialPlayer.diffuseColor = new BABYLON.Color3(0.1, 0.5, 0.1);
        this.mesh.material = materialPlayer;

    }

    moveLeft(){
        this.mesh.moveWithCollisions(new BABYLON.Vector3(-0.1,0,0));

    }
    moveRight(){
        this.mesh.moveWithCollisions(new BABYLON.Vector3(0.1,0,0));
    }
    moveUp(){
        
        this.lastjumpTime = Date.now();
        
    }
    gravity(){
        this.mesh.moveWithCollisions(new BABYLON.Vector3(0,-0.2,0));
    }
    RespawnIsDead(){
        if(this.mesh.position.y < -4){
            this.Respawn();
        }
    }
    Respawn(){
        this.mesh.position = new BABYLON.Vector3(this.x, this.y, this.z);
    }
    moveUpPlat(){
        this.mesh.position.y += 0.03;
    }

}