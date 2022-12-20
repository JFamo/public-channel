// Main file for game client
// @author Joshua Famous 2022

// Setup socket and get info
var socket = io();

// Get HTML elements
var elementIds = ["joinRoomButton", "createRoomButton", "joinDisplayButton", "nameField", "codeField", "invalidCodeHeader", "roomCodeHeader", "roomPlayerList"];
var alerts = ["invalidCodeHeader"];
var elements = {};
for(id of elementIds){
    elements[id] = document.getElementById(id);
}

// --- Listeners ---

// Room function listeners
elements["joinRoomButton"].addEventListener('click', joinRoom);
elements["createRoomButton"].addEventListener('click', createRoom);
elements["joinDisplayButton"].addEventListener('click', joinDisplay);

// --- Handlers ---

// Join room handler
function joinRoom() {
    socket.emit('joinRoom', {"name": elements["nameField"].value, "code": elements["codeField"].value});
}

// Create room handler
function createRoom() {
    socket.emit('createRoom', {"name": elements["nameField"].value});
}

// Join as display handler
function joinDisplay() {
    socket.emit('joinDisplay', {});
}

// Invalid room handler
socket.on("invalidRoom", () => {
    elements["invalidCodeHeader"].style.display = "block";
});

// Room data update handler
socket.on("roomUpdate", (...data) => {
    // Remove alerts
    for(alertId of alerts){
        elements[alertId].style.display = "none";
    }

    // Display room code
    elements["roomCodeHeader"].innerHTML = data[1];
    
    // Display room data
    elements["roomPlayerList"].innerHTML = "";
    for(player of data[0]["players"]){
        elements["roomPlayerList"].innerHTML += player["name"] + "<br>";
    }
});