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
var categories = ["Abstract", "Flags", "Foods", "Furniture", "Shapes", "Tools", "Vehicles"];

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
            var newPlayer = sf.createNewPlayerData(thisName);
            roomData[thisCode]["players"][newPlayer[0]] = newPlayer[1];

            console.log(`Creating a room with code ${thisCode}`);
            
            // Add creating user to room
            socket.join(thisCode);

            // Send player their uid
            socket.emit("playerId", newPlayer[0]);

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
                var newPlayer = sf.createNewPlayerData(thisName);
                // Set players at this new ID to the new player object
                roomData[thisCode]["players"][newPlayer[0]] = newPlayer[1];

                // Add joining user socket to room
                socket.join(thisCode);

                // Send player their uid
                socket.emit("playerId", newPlayer[0]);

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

    // Handler for starting a room
    socket.on('startRoom', (...data) => {
        // Get code
        var thisCode = data[0]["code"];

        // Update room status for start
        roomData[thisCode]["status"] = "playing";
        roomData[thisCode]["round"] = 1;

        // Randomly assign roles
        roomData[thisCode] = sf.assignRoles(roomData[thisCode]);

        // Choose random images
        roomData[thisCode] = sf.dealCards(roomData[thisCode], categories);

        // Send room update with round
        socketio.to(thisCode).emit("roomUpdate", roomData[thisCode], thisCode);
    });

    // Handler for receiving submitted images from users
    socket.on('imageSelection', (...data) => {
        // Get data
        var thisCode = data[0]["code"];
        var thisPlayer = data[0]["player"];
        var thisRole = data[0]["role"];
        var thisPath = data[0]["path"];

        // Ensure this is not old data
        if(thisCode in roomData){
            if(roomData[thisCode]["status"] == "playing"){

                // Get current round
                var thisRound = roomData[thisCode]["round"];

                // DEBUG
                console.log(thisRole + " [" + thisPlayer + "] submitted " + thisPath + " for round " + thisRound);

                // Add submission for round
                if(thisRound in roomData[thisCode]["submissions"]){
                    roomData[thisCode]["submissions"][thisRound][thisPlayer] = thisPath;
                }
                else{
                    roomData[thisCode]["submissions"][thisRound] = {};
                    roomData[thisCode]["submissions"][thisRound][thisPlayer] = thisPath;
                }

                // Check for round end
                var submissionCountForRound = Object.keys(roomData[thisCode]["submissions"][thisRound]).length;
                var playersInRoom = Object.keys(roomData[thisCode]["players"]).length;
                if(submissionCountForRound >= playersInRoom){

                    // Handle end of round
                    roomData[thisCode]["round"] += 1;
                    
                    // Handle end of game
                    if(roomData[thisCode]["round"] >= 5){

                        socketio.to(thisCode).emit("gameEnd", sf.buildResults(roomData[thisCode]));

                    }
                    else{

                        // If continuing, assign new cards and category
                        roomData[thisCode] = sf.dealCards(roomData[thisCode], categories);

                        // Send room update with round
                        socketio.to(thisCode).emit("roomUpdate", roomData[thisCode], thisCode);

                    }

                }

            }
        }
    });
});

// Setup server listening
server.listen(thisPort, () => {
  console.log(`Server live at port ${thisPort}`);
});