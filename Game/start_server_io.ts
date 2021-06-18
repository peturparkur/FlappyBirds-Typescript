import * as http from 'http'; //server setup
import * as socketio from "socket.io";
import { io } from 'socket.io-client';

import path from 'path'; //for easier path
import express from "express"; //for starting website

//to solve __dirname doesn't exist
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { stringify } from 'querystring';

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
    res.sendFile(path.join(__dirname, "/index.html"));
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


const ioServer = new socketio.Server(server);
ioServer.on("connection", (socket : socketio.Socket) =>{
    console.log("a client connected");
    socket.emit("init", {data : "hello world"});
})


server.listen(PORT, ()=> console.log("server listening on http://localhost:"+PORT));