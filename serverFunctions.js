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

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function fisherYatesShuffle(array){
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
}

function createRoomData(){
    return {"players": {}, "status": "waiting", "round": 0, "submissions": {}, "channelData": {}};
}

function createNewPlayerData(name){
    return [generateRandomPlayerId(), {"name": name, "role":"attacker"}];
}

function assignRoles(someRoomData){
    var playerIds = Object.keys(someRoomData["players"]);
    var playerCount = playerIds.length;
    var aliceIndex = getRandomIndex(playerCount);
    var bobIndex;
    do{
        bobIndex = getRandomIndex(playerCount);
    } while(bobIndex == aliceIndex);

    for(var i = 0; i < playerCount; i ++){
        if(i == aliceIndex){
            someRoomData["players"][playerIds[i]]["role"] = "alice";
        }
        else if(i == bobIndex){
            someRoomData["players"][playerIds[i]]["role"] = "bob";
        }
        else{
            someRoomData["players"][playerIds[i]]["role"] = "attacker";
        }
    }

    return someRoomData;
}

function buildImageArrayFromIndices(base, images, ...indices){
    var out = [];
    for(index of indices){
        out.push(base + "/" + images[index]);
    }
    out = fisherYatesShuffle(out);
    return out;
}

function dealCards(someRoomData, categories){
    var basePath = "./static/images";
    var clientPath = "images";
    var imageCount = 20;

    // Choose random category
    var categoryIndex = getRandomIndex(categories.length);
    var category = categories[categoryIndex];

    // Select category directory
    var categoryFolders = fs.readdirSync(basePath);
    var catPath = basePath + "/" + categoryFolders[categoryIndex];
    clientPath = clientPath + "/" + categoryFolders[categoryIndex];

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
    someRoomData["channelData"]["all"] = buildImageArrayFromIndices(clientPath, images, 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19);
    someRoomData["channelData"]["alice"] = buildImageArrayFromIndices(clientPath, images, selectedIndices[0], selectedIndices[1], selectedIndices[2], selectedIndices[3]);
    someRoomData["channelData"]["bob"] = buildImageArrayFromIndices(clientPath, images, selectedIndices[0], selectedIndices[1], selectedIndices[2], selectedIndices[4]);

    // Return updated room data
    return someRoomData;
}

function getPlayerRole(someRoomData, playerId){
    return someRoomData["players"][playerId]["role"];
}

function getPlayerNickname(someRoomData, playerId){
    return someRoomData["players"][playerId]["name"];
}

function getRolePlayerId(someRoomData, role){
    var playerKeys = Object.keys(someRoomData["players"]);
    for(let i = 0; i < playerKeys.length; i ++){
        if(getPlayerRole(someRoomData, playerKeys[i]) == role){
            return playerKeys[i];
        }
    }
    return 0;
}

// Function to assess the game and build a results object
function buildResults(someRoomData){

    // Setup vars
    var results = {"agreement": true, "compromised": false, "paths": {}, "crackers": []};
    var roundKeys = Object.keys(someRoomData["submissions"]);
    var matches = [];

    var aliceId = getRolePlayerId(someRoomData, "alice");
    var bobId = getRolePlayerId(someRoomData, "bob");

    // Iterate rounds
    for(let i = 0; i < roundKeys.length; i ++){

        var thisRound = someRoomData["submissions"][roundKeys[i]];

        // Check for alice/bob mismatch
        if(thisRound[aliceId] != thisRound[bobId]){
            results["agreement"] = false;
        }

        // Iterate players
        for(const [playerId, submission] of Object.entries(thisRound)){

            // DEBUG
            console.log(`Evaluating ${playerId} with ${submission} out of ${JSON.stringify(someRoomData)}`);

            // Build or add to object for this player's submissions
            if(playerId in results["paths"]){
                results["paths"][playerId]["images"].push(submission);
            }
            else{
                results["paths"][playerId] = {"name": getPlayerNickname(someRoomData, playerId), "role": getPlayerRole(someRoomData, playerId), "images": [submission]};
            }

            // Check for attackers with a match
            if(playerId != aliceId && playerId != bobId){

                // On first round, add to matches if this attacker has a match
                if(i <= 0){
                    if(submission == thisRound[aliceId]){
                        matches.push(playerId);
                    }
                }
                // On other rounds, remove if not matching
                else{
                    if(submission != thisRound[aliceId]){
                        matches = matches.filter(id => id != playerId);
                    }
                }

            }

        }

    }

    // After all rounds, check for complete attacker matches
    if(matches.length > 0){
        results["compromised"] = true;
        results["crackers"] = matches;
    }

    // Return results to be sent to clients
    return results;

}

module.exports = { generateRandomRoomCode, createNewPlayerData, createRoomData, assignRoles, dealCards, buildResults };