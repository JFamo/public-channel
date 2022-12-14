// Main file for node server
// @author Joshua Famous 2022

// Dependency setup from https://socket.io/get-started/chat
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const socketio = new Server(server);
const sf = require("./serverFunctions.js");

// Vars
const thisPort = 3000;
var roomCodes = {};

// --- Express Endpoints ---

// Setup static files
app.use(express.static(`static`));

// Serve main file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/static/index.html');
});

// Socket connection handler
socketio.on('connection', (socket) => {

    // Log connect event
    console.log('A user connected');

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });

    // --- Room Event Handlers ---

    // Handler for creating a new room
    socket.on('createRoom', () => {
        // Create a unique random code
        var thisCode;
        do{
            thisCode = sf.generateRandomRoomCode();
        }
        while(thisCode in roomCodes);

        // Add code and new room
        roomCodes[thisCode] = {players: 1};
        console.log(`Creating a room with code ${thisCode}`);
    });
});

// Setup server listening
server.listen(thisPort, () => {
  console.log(`Server live at port ${thisPort}`);
});