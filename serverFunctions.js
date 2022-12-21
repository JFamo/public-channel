const fs = require('fs');

function getRandomIndex(count){
    return Math.floor(Math.random() * count);
}

function generateRandomRoomCode(){
    let roomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let codeLength = 4;
    let output = "";
    for(var i = 0; i < codeLength; i ++){
        output += roomChars.charAt(getRandomIndex(roomChars.length));
    }
    return output;
}

function generateRandomPlayerId(){
    let idChars = "0123456789abcdef";
    let idLength = 10;
    let output = "";
    for(var i = 0; i < idLength; i ++){
        output += idChars.charAt(getRandomIndex(idChars.length));
    }
    return output;
}

function createRoomData(){
    return {"players": [], "status": "waiting", "round": 0, "submissions": [], "channelData": {}};
}

function createNewPlayerData(name){
    return {"id": generateRandomPlayerId(), "name": name, "role":"attacker"};
}

function assignRoles(someRoomData){
    var playerCount = someRoomData["players"].length;
    var aliceIndex = getRandomIndex(playerCount);
    var bobIndex;
    do{
        bobIndex = getRandomIndex(playerCount);
    } while(bobIndex == aliceIndex);

    for(var i = 0; i < playerCount; i ++){
        if(i == aliceIndex){
            someRoomData["players"][i]["role"] = "alice";
        }
        else if(i == bobIndex){
            someRoomData["players"][i]["role"] = "bob";
        }
        else{
            someRoomData["players"][i]["role"] = "attacker";
        }
    }

    return someRoomData;
}

function buildImageArrayFromIndices(base, images, ...indices){
    var out = [];
    for(index of indices){
        out.push(base + "/" + images[index]);
    }
    return out;
}

function dealCards(someRoomData, categories){
    var basePath = "./static/images";
    var imageCount = 20;

    // Choose random category
    var categoryIndex = getRandomIndex(categories.length);
    var category = categories[categoryIndex];

    // Select category directory
    var categoryFolders = fs.readdirSync(basePath);
    var catPath = basePath + "/" + categoryFolders[categoryIndex];

    // Print selected category
    console.log(`Selected category at ${catPath}`);

    // Choose random images
    var images = fs.readdirSync(catPath);
    var selectedIndices = [];

    // Shared images
    selectedIndices[0] = getRandomIndex(imageCount);
    do{
        selectedIndices[1] = getRandomIndex(imageCount);
    } while(selectedIndices[1] == selectedIndices[0]);
    do{
        selectedIndices[2] = getRandomIndex(imageCount);
    } while(selectedIndices[2] == selectedIndices[0] || selectedIndices[2] == selectedIndices[1]);

    // Alice/Bob image
    selectedIndices[3] = getRandomIndex(imageCount);
    selectedIndices[4] = getRandomIndex(imageCount);

    // Add selections to room data
    someRoomData["channelData"]["all"] = images;
    someRoomData["channelData"]["alice"] = buildImageArrayFromIndices(basePath, images, selectedIndices[0], selectedIndices[1], selectedIndices[2], selectedIndices[3]);
    someRoomData["channelData"]["bob"] = buildImageArrayFromIndices(basePath, images, selectedIndices[0], selectedIndices[1], selectedIndices[2], selectedIndices[4]);

    console.log(someRoomData["channelData"]["all"]);
    console.log(someRoomData["channelData"]["alice"]);
    console.log(someRoomData["channelData"]["bob"]);

    // Return updated room data
    return someRoomData;
}

module.exports = { generateRandomRoomCode, createNewPlayerData, createRoomData, assignRoles, dealCards };