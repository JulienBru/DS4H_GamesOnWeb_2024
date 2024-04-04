export default class materialManager {
    constructor(scene) {
        this.scene = scene;
        this.materials = this.createMaterials();
    }

    createMaterials() {
        const materials = {};

        // Créer et stocker les matériaux
        materials["redMaterial"] = new BABYLON.StandardMaterial("redMaterial", this.scene);
        materials["redMaterial"].diffuseColor = new BABYLON.Color3(1, 0, 0);

        materials["lightGreenMaterial"] = new BABYLON.StandardMaterial("lightGreenMaterial", this.scene);
        materials["lightGreenMaterial"].diffuseColor = new BABYLON.Color3(0.5, 1, 0);

        materials["greenMaterial"] = new BABYLON.StandardMaterial("greenMaterial", this.scene);
        materials["greenMaterial"].diffuseColor = new BABYLON.Color3(0, 1, 0);

        materials["darkGreenMaterial"] = new BABYLON.StandardMaterial("darkGreenMaterial", this.scene);
        materials["darkGreenMaterial"].diffuseColor = new BABYLON.Color3(0, 0.5, 0);

        materials["purpleMaterial"] = new BABYLON.StandardMaterial("purpleMaterial", this.scene);
        materials["purpleMaterial"].diffuseColor = new BABYLON.Color3(0.5, 0, 0.5);

        return materials;
    }

    getMaterial(name) {
        return this.materials[name];
    }
}
