let inputState = {};

function definirEcouteur(){
    ecouteurClavier();
    //ecouteurSouris();
} 

function ecouteurClavier(){
    window.onkeydown = (event) => {
        switch(event.key){
            case "ArrowUp" || "z" || "Z":
                inputState.up = true;
                break;
            case "ArrowDown" || "s" || "S":
                inputState.down = true;
                break;
            case "ArrowLeft"|| "q" || "Q":
                inputState.left = true;
                break;
            case "ArrowRight"|| "d" || "D":
                inputState.right = true;
                break;
            case "SwitchRight" || "e" || "E":
                inputState.switchRight = true;
                break;
            case "SwitchLeft" || "a" || "A":
                inputState.switchLeft = true;
                break;
        }
    }
    window.onkeyup = (event) => {
        switch(event.key){
            case "ArrowUp" || "z" || "Z":
                inputState.up = false;
                break;
            case "ArrowDown" || "s" || "S":
                inputState.down = false;
                break;
            case "ArrowLeft"|| "q" || "Q":
                inputState.left = false;
                break;
            case "ArrowRight"|| "d" || "D":
                inputState.right = false;
                break;
            case "SwitchRight" || "e" || "E":
                inputState.switchRight = false;
                break;
            case "SwitchLeft" || "a" || "A":
                inputState.switchLeft = false;
                break;
        }
    }
}

export { definirEcouteur, inputState }