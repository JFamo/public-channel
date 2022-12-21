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
    $("#ab1").attr("src", roomData["channelData"][role][0]);
    $("#ab2").attr("src", roomData["channelData"][role][1]);
    $("#ab3").attr("src", roomData["channelData"][role][2]);
    $("#ab4").attr("src", roomData["channelData"][role][3]);
}

// Handler for providing attacker data
function handleAttacker(roomData){
    document.getElementById("aliceBobDisplay").style.display = "none";
    document.getElementById("attackerDisplay").style.display = "block";
    for(var i = 0; i < 20; i ++){
        $("#att" + (i+1)).attr("src", roomData["channelData"]["all"][i]);
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