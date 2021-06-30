import * as http from 'http'; //server setup
import * as WS from "websocket"; //communication
//import * as socketio from "socket.io";

import path from 'path'; //for easier path
import express from "express"; //for starting website

//to solve __dirname doesn't exist
import { fileURLToPath } from 'url';
import { dirname } from 'path';

//import game stuff
import { Game } from './static/bird_game.js';

//utility things
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
//end of solution

const PORT : number = 4040;

let app = express(); //init
app.use("/static/", express.static(path.join(__dirname, "/static/"))); //include the static directory with name /static/
console.log("path: ", path.join(__dirname, "./"));
//app.use(express.static(path.join(__dirname, "./")));


//sending the html file for the game
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/start_page.html"));
});
const server = http.createServer(app); //launch server



//Copied hash function for clientID generation
//#region ClientId generation HashFunction
function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}
// then to call it, plus stitch in '4' in the third group
const guid = () => (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
//#endregion


const WebSocketServer = new WS.server({httpServer : server}); //setup websocket server
//const ioServer = new socketio.Server(server);

class Client{
    id : string;
    connection : WS.connection;
    ready : boolean;

    constructor(identifier : string, connection : WS.connection){
        this.id = identifier;
        this.connection = connection;
        this.ready = false;
    }

    send(data : Buffer | WS.IStringified){
        this.connection.send(data);
    }
}

//connection room
//maybe even include the game
class Room{
    id : string; //identifier
    clients = Array<Client>(); //we assume it's in the same order as birds
    gameId : string;

    constructor(identifier : string, clients : Array<Client>, gameId : string){
        this.id = identifier;
        console.log(clients.length);
        this.clients = clients.slice(0, clients.length+1);
        this.gameId = gameId;
    }

    AddPlayer(client : Client){
        this.clients.push(client);
    }

    PlayerId(client : Client){
        for(let i=0; i<this.clients.length; i++){
            if(this.clients[i] === client) return i;
        }
        return -1; //no id found
    }

    get game(){
        return games.get(this.gameId);
    }

    //return true if all clients are ready
    get ready(){
        if(this.clients.length < 2) return false;
        for(let c of this.clients){
            if(!c.ready) return false;
        }
        return true;
    }

    BroadCast(data : Buffer | WS.IStringified){
        for(let i=0; i<this.clients.length; i++){
            this.clients[i].send(data);
        }
    }

    StartGame(frame_rate : number){
        let game : Game = games.get(this.gameId);
        const intervalId = setInterval(() => {
            if(game.active){
                game.Step(1);

                //send the states
                let payload = {
                    "birds" : game.birds,
                    "obstacles" : game.obstacles,
                    "step" : game.step,
                    "playerId" : -1
                }

                for(let i=0; i<this.clients.length; i++){
                    payload.playerId = i;
                    this.clients[i].send(JSON.stringify({
                        "Method": "GameUpdate",
                        "payload" : payload
                    }));
                }

            }
            else{
                console.log("Winner: ", game.winner, ", with client index: ", game.winner); //-1 means it's a draw

                //Send back a message for who the winner is
                let payload ={
                    //"winnerClientId" : this.clients[game.winner], //might want to back some information about other client, so we can display name
                    "winner" : game.winner,
                    "win" : false
                }

                for(let i=0; i<this.clients.length; i++){
                    if(i === game.winner) payload.win = true
                    else payload.win = false;
                    this.clients[i].send(JSON.stringify({
                        "Method" : "GameOver",
                        "payload" : payload
                    }))
                }

                clearInterval(intervalId);
            }
            

        }, 1000/frame_rate);
    }

}

//const clients = new Map<string, WS.connection>(); //identifiability of clients, could be login system later
const clients = new Map<string, Client>();
const rooms = new Map<string, Room>();
const clientMap = new Map<string, string>(); //maps clientId -> roomId

class GameInstance{
    host : string;
    game : Game;

    constructor(host : string, game : Game){
        this.host = host;
        this.game = game;
    }
}

const games = new Map<string, Game>() //identifiability of games


//currently running games on the server
//let games = new Array<Poker>(0) //create a batch of one

function OriginAllowed(origin : string){
    return true;
}

//broadcast to every client data
function Broadcast(data : object, exclude : Array<WS.connection> = null) : void{
    for(let client of clients){
        let clientConnection:WS.connection = client[1].connection;
        //send to same person?
        if (!exclude.includes(clientConnection)) //if the client connection is not the same send the message
        {
            clientConnection.send(JSON.stringify(data)); //we just send the message to all clients
        }
        else{
            //what to send to the excluded bit
            //clientConnection.send(JSON.stringify("Message has been received"));
        }
    }
}
//broadcast to every client data
function BroadcastOne(data : object, exclude : WS.connection) : void{
    for(let client of clients){
        let clientConnection:WS.connection = client[1].connection;
        //send to same person?
        //exclude.includes(clientConnection)
        if (clientConnection != exclude) //if the client connection is not the same send the message
        {
            clientConnection.send(JSON.stringify(data)); //we just send the message to all clients
        }
        else{
            //what to send to the excluded bit
            //clientConnection.send(JSON.stringify("Message has been received"));
            exclude.send(JSON.stringify("message received")); //temporary respone
        }
    }
}

//client want's to join websocket server
function OnRequest(request : WS.request){

    //check if the origin is allowed
    if (!OriginAllowed(request.origin)){
        console.log("invalid origin trying to connect: ", request.origin);
    }
    console.log("a client connected");

    let protocol = null; //protocol to use
    let connection = request.accept(protocol, request.origin); //this is the websocket connection


    let clientId = guid(); //generate unique identifier

    
    //now want to save the client connection
    //clients.set(clientId, connection); //we save the connection with the identifier
    let client = new Client(clientId, connection);
    clients.set(clientId, client); //add the new client to the clients array

    console.log("Client connected with Id: ", clientId);
    

    //send back the clientID information to the client
    connection.send(JSON.stringify(
        {
            "Method" : "Connect",
            "ClientId" : clientId
        }
    ));

    //now we have the function calls for connection events
    connection.on("close", function(code:number, desc:string){
        console.log(`Connection disconnected with code : ${code}, and description ${desc}`);
        
        //want to remove the connection from the clients array
        console.log("rooms active: ", rooms.keys.length);

    });

    /*
    connection.on("message", function(message : WS.IMessage){
        let msgData = JSON.parse(message.utf8Data); //assume we can parse it with Json
        console.log(msgData)
    });
    */
    connection.on("message", function(message : WS.IMessage){
        let msgData = JSON.parse(message.utf8Data); //assume we can parse it with Json
        console.log(msgData)

        if(msgData.Method === null){
            let respone = {
                "Method" : null,
                "Data" : "Received Message"
            }
            Broadcast(respone); //send the response to clients
        }


        if (msgData.Method === "JoinRoom"){
            let roomId : string = msgData.payload.roomId;
            let clientId : string = msgData.payload.clientId;

            let room : Room = rooms.get(roomId);

            let clt = clients.get(clientId);
            clt.ready = true; //for testing simplicity

            //room.clients.push(clt); //we add the client with given id to the clients associated to the room
            room.AddPlayer(clt);
            console.log(room);
            clientMap.set(clientId, roomId); //so it's easy to find where to send the action data

            client.send(JSON.stringify({
                "Method" : "JoinRoom",
                "payload": {
                    "roomId" : roomId,
                    "message" : "completed"
                }
            }));

            //check if this room can be started
            if(room.ready){
                room.StartGame(10);
            }
        }


        if(msgData.Method === "CreateGame")
        {
            let host : string = msgData.ClientId;
            let numPlayers : number = msgData.numPlayers;
            let width : number = msgData.width;
            let height : number = msgData.height;
            let fwSpeed : number = msgData.fwSpeed;

            let gameId = guid(); //identifier
            let game = new Game(width, height, numPlayers, 9.81, 0.25, fwSpeed);
            games.set(gameId, game); //store the current game with given ID

            let roomId = guid();
            let room = new Room(roomId, new Array<Client>(), gameId) //create a room, add the first client to be the creator
            rooms.set(roomId, room); //store the room into the currently active rooms
            //want to create a new room

            let payload = {
                "roomId" : roomId,
                "gameId" : gameId //might not want to send this
            }

            client.send(JSON.stringify({
                "Method": "CreateGame",
                "payload" : payload
            }));
        }

        if(msgData.Method === "GameAction"){
            let cltId : string = msgData.payload.clientId;
            let action : number = msgData.payload.action;

            let roomId = clientMap.get(cltId);
            let room = rooms.get(roomId);
            let game = room.game;
            let playerIndex = room.PlayerId(client);

            game.Action(playerIndex);
        }


    });
}

/*
function OnMessage(message : WS.IMessage){
    let msgData = JSON.parse(message.utf8Data); //assume we can parse it with Json
    console.log(msgData)

    if(msgData.Method === null){
        let respone = {
            "Method" : null,
            "Data" : "Received Message"
        }
        Broadcast(respone); //send the response to clients
    }

    if(msgData.Method === "Create"){
        let host : string = msgData.ClientId;
        let numPlayers : number = msgData.numPlayers;
        let width : number = msgData.width;
        let height : number = msgData.height;
        let fwSpeed : number = msgData.fwSpeed;

        let gameId = guid(); //identifier
        games.set(gameId, new Game(width, height, numPlayers, 9.81, 1, fwSpeed)); //create the game

        //we now send a reply
        let payload = {
            "Method" : "Create",
            "GameId" : gameId
        }
    }
};*/
WebSocketServer.on("request", OnRequest);

server.listen(PORT, ()=> console.log("server listening on http://localhost:"+PORT));