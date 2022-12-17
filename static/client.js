// Main file for game client
// @author Joshua Famous 2022

// Setup socket and get info
var socket = io();

// Get HTML elements
var elements = {"joinRoomButton":"joinRoomButton", "createRoomButton":"createRoomButton", "joinDisplayButton": "joinDisplayButton"};
for(const [key, value] of Object.entries(elements)){
    elements[key] = document.getElementById(value);
}

// --- Listeners ---

// Room function listeners
elements["joinRoomButton"].addEventListener('click', joinRoom);
elements["createRoomButton"].addEventListener('click', createRoom);
elements["joinDisplayButton"].addEventListener('click', joinDisplay);

// --- Handlers ---

// Join room handler
function joinRoom() {
    socket.emit('joinRoom', {});
}

// Create room handler
function createRoom() {
    socket.emit('createRoom', {});
}

// Join as display handler
function joinDisplay() {
    socket.emit('joinDisplay', {});
}