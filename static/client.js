// Main file for game client
// @author Joshua Famous 2022

// Setup socket and get info
var socket = io();

// Categorize HTML elements
var alerts = ["invalidCodeHeader"];

// --- Listeners ---

// Room function listeners
$('#joinRoomButton').on('click', joinRoom);
$('#createRoomButton').on('click', createRoom);
$('#joinDisplayButton').on('click', joinDisplay);

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

// Invalid room handler
socket.on("invalidRoom", () => {
    $('#invalidCodeHeader').style.display = "block";
});

// Room data update handler
socket.on("roomUpdate", (...data) => {
    // Remove alerts
    for(alertId of alerts){
        document.getElementById(alertId).style.display = "none";
    }

    // Display room code
    $('#roomCodeHeader').html(data[1]);
    
    // Display room data
    $('#roomPlayerList').html("");
    var htmlString = "";
    for(player of data[0]["players"]){
        htmlString += player["name"] + "<br>";
    }
    $('#roomPlayerList').html(htmlString);
});