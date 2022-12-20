function generateRandomRoomCode(){
    let roomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let codeLength = 4;
    let output = "";
    for(var i = 0; i < codeLength; i ++){
        output += roomChars.charAt(Math.floor(Math.random() * roomChars.length));
    }
    return output;
}

function createRoomData(){
    return {"players": [], "status": "waiting"};
}

function createNewPlayerData(name){
    return {"name": name};
}

module.exports = { generateRandomRoomCode, createNewPlayerData, createRoomData };