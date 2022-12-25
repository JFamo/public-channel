// Main file for game client
// @author Joshua Famous 2022

// Setup socket and get info
var socket = io();

// Categorize HTML elements
var alerts = ["errorHeader"];

// Current room code
var thisCode = "";
// Player ID
var playerId = "";

// --- Listeners ---

// Room function listeners
$('#joinRoomButton').on('click', joinRoom);
$('#createRoomButton').on('click', createRoom);
$('#joinDisplayButton').on('click', joinDisplay);
$('#startRoomButton').on('click', startRoom);

// --- Handlers ---

// Join room handler
function joinRoom() {
    socket.emit('joinRoom', {"name": $('#nameField').val(), "code": $('#codeField').val()});
}

// Create room handler
function createRoom() {
    socket.emit('createRoom', {"name": $('#nameField').val()});
}

// Join as display handler
function joinDisplay() {
    socket.emit('joinDisplay', {});
}

// Start a new game handler
function startRoom() {
    socket.emit('startRoom', {"code": thisCode});
}

// Submit an image selection handler
function submitImage(e){
    socket.emit('imageSelection', {"code": thisCode, "path": e.data.path, "player": playerId, "role": e.data.role});
}

// Handler for changing from login page to waiting room
function sendToWaitingRoom(players){
    // Remove alerts
    for(alertId of alerts){
        document.getElementById(alertId).style.display = "none";
    }
    // Remove login screen
    document.getElementById("loginDisplay").style.display = "none";
    // Activate room screen
    document.getElementById("waitingDisplay").style.display = "block";
    // Remove game screen
    document.getElementById("gameCycleDisplay").style.display = "none";

    // Display room code
    $('#roomCodeHeader').html(thisCode);

    // Display room data
    $('#roomPlayerList').html("");
    var htmlString = "";
    for(player of Object.values(players)){
        htmlString += player["name"] + "<br>";
    }
    $('#roomPlayerList').html(htmlString);

    // Count of players in room (3 necessary)
    var playerCount = Object.keys(players).length;

    // Open start room function if enough players are in
    if(playerCount >= 3){
        document.getElementById("startRoomButton").style.display = "block";
    }
    else{
        document.getElementById("startRoomButton").style.display = "none";
    }
}

// Handler for providing Alice/Bob data
function handleAliceBob(roomData, role){
    document.getElementById("aliceBobDisplay").style.display = "block";
    document.getElementById("attackerDisplay").style.display = "none";
    for(var i = 0; i < 4; i ++){
        $("#ab" + (i+1)).attr("src", roomData["channelData"][role][i]);
        $("#ab" + (i+1)).off();
        $("#ab" + (i+1)).on('click', {"role": role, "path": roomData["channelData"][role][i]}, submitImage);
    }
}

// Handler for providing attacker data
function handleAttacker(roomData){
    document.getElementById("aliceBobDisplay").style.display = "none";
    document.getElementById("attackerDisplay").style.display = "block";
    for(var i = 0; i < 20; i ++){
        $("#att" + (i+1)).attr("src", roomData["channelData"]["all"][i]);
        $("#att" + (i+1)).off();
        $("#att" + (i+1)).on('click', {"role": "attacker", "path": roomData["channelData"]["all"][i]}, submitImage);
    }
}

// Handler for updating the game
function updateGamePage(roomData){
    // Remove login screen
    document.getElementById("loginDisplay").style.display = "none";
    // Remove room screen
    document.getElementById("waitingDisplay").style.display = "none";
    // Activate game screen
    document.getElementById("gameCycleDisplay").style.display = "block";
    // Remove final screen
    document.getElementById("gameEndDisplay").style.display = "none";

    // Check role
    var myRole = roomData["players"][playerId]["role"];

    // Handle Alice
    if(myRole == "alice" || myRole == "bob"){
        handleAliceBob(roomData, myRole);
    }
    else{
        handleAttacker(roomData);
    }
}

// Invalid room handler
socket.on("error", (data) => {
    $('#errorHeader').css("display", "block");
    $('#errorHeader').html(data);
});

// Room data update handler
socket.on("roomUpdate", (...data) => {

    // Update room code locally
    thisCode = data[1];

    // Handle waiting room update
    if(data[0]["status"] == "waiting"){
        sendToWaitingRoom(data[0]["players"]);
    }

    // Handle game cycle update
    else if(data[0]["status"] == "playing"){
        updateGamePage(data[0]);
    }
});

// Handler for receiving my player id
socket.on("playerId", (data) => {
    playerId = data;
});

// Handler for end of game data
socket.on("gameEnd", (data) => {
    console.log(JSON.stringify(data));

    // Remove login screen
    document.getElementById("loginDisplay").style.display = "none";
    // Remove room screen
    document.getElementById("waitingDisplay").style.display = "none";
    // Remove game screen
    document.getElementById("gameCycleDisplay").style.display = "none";
    // Activate final screen
    document.getElementById("gameEndDisplay").style.display = "block";

    // Show header
    var gameEndText = "";
    if(!data["agreement"]){
        gameEndText = "Attackers Win! Alice and Bob failed to establish a shared code.";
    }
    else if(data["compromised"]){
        gameEndText = "Attackers Win! Alice and Bob's secret code was cracked.";
    }   
    else{
        gameEndText = "Alice and Bob Win! The attackers could not decipher their shared code.";
    }
    $('#gameEndTitle').html(gameEndText);

    // Iterate players to show their selections
    $('#gameEndDisplays').html("");
    var playerIds = Object.keys(data["paths"]);
    for(let i = 0; i < playerIds.length; i ++){
        var thisPlayer = data["paths"][playerIds[i]];

        // Create new section with header
        var thisSection = `<div><h4 class="playerSectionHeader">${thisPlayer["name"]} (${thisPlayer["role"].toUpperCase()})</h4>`;
        thisSection += `<img src="${thisPlayer["images"][0]}" class="finalImage"/>`;
        thisSection += `<img src="${thisPlayer["images"][1]}" class="finalImage"/>`;
        thisSection += `<img src="${thisPlayer["images"][2]}" class="finalImage"/>`;
        thisSection += `<img src="${thisPlayer["images"][3]}" class="finalImage"/>`;
        thisSection += `</div>`;

        // Append Section
        $('#gameEndDisplays').append(thisSection);
    }
});