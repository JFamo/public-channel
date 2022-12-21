// Main file for game client
// @author Joshua Famous 2022

// Setup socket and get info
var socket = io();

// Categorize HTML elements
var alerts = ["errorHeader"];

// Current room code
var thisCode = "";

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

// Invalid room handler
socket.on("error", (data) => {
    $('#errorHeader').css("display", "block");
    $('#errorHeader').html(data);
});

// Room data update handler
socket.on("roomUpdate", (...data) => {

    // Update room code locally
    thisCode = data[1];

    // Remove alerts
    for(alertId of alerts){
        document.getElementById(alertId).style.display = "none";
    }
    // Remove login screen
    document.getElementById("loginDisplay").style.display = "none";
    // Activate room screen
    document.getElementById("waitingDisplay").style.display = "block";

    // Display room code
    $('#roomCodeHeader').html(data[1]);
    
    // Display room data
    $('#roomPlayerList').html("");
    var htmlString = "";
    for(player of data[0]["players"]){
        htmlString += player["name"] + "<br>";
    }
    $('#roomPlayerList').html(htmlString);

    // Count of players in room (3 necessary)
    var playerCount = data[0]["players"].length;

    // Open start room function if enough players are in
    if(playerCount >= 3){
        document.getElementById("startRoomButton").style.display = "block";
    }
    else{
        document.getElementById("startRoomButton").style.display = "none";
    }
});