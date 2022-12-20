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
var roomData = {};

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
    socket.on('createRoom', (...data) => {
        // Create a unique random code
        var thisCode;
        do{
            thisCode = sf.generateRandomRoomCode();
        }
        while(thisCode in roomData);

        // Get player name
        var thisName = data[0]["name"];

        // Check valid name
        if(thisName.length > 0){

            // Add code and new room
            roomData[thisCode] = sf.createRoomData();
            roomData[thisCode]["players"] = [sf.createNewPlayerData(thisName)];
            console.log(`Creating a room with code ${thisCode}`);
            
            // Add creating user to room
            socket.join(thisCode);

            // Update users in room
            socketio.to(thisCode).emit("roomUpdate", roomData[thisCode], thisCode);

        }
        // Handle invalid name
        else{
            socket.emit("error", "Invalid name!");
        }
    });

    // Handler for joining an existing room
    socket.on('joinRoom', (...data) => {
        // Get code
        var thisCode = data[0]["code"];

        // Check that room exists
        if(thisCode in roomData){

            // Check if room is open for joining
            if(roomData[thisCode]["status"] === "waiting"){
                // Get player name
                var thisName = data[0]["name"];

                // Add player to room
                roomData[thisCode]["players"].push(sf.createNewPlayerData(thisName));

                // Add joining user socket to room
                socket.join(thisCode);

                // Update users in room
                socketio.to(thisCode).emit("roomUpdate", roomData[thisCode], thisCode);
            }
            // Handle room in progress
            else{
                socket.emit("error", "Room is already in progress!");
            }
        }   
        // Handle invalid code
        else{
            socket.emit("error", "Invalid room code!");
        } 
    });
});

// Setup server listening
server.listen(thisPort, () => {
  console.log(`Server live at port ${thisPort}`);
});