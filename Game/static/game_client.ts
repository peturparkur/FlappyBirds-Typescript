//import my stuff for easier drawing and calculations
import { Vector2, Circle, Rect} from "./my_classes.js";
import { DrawCircle, DrawRect, InsideCircle, InsideRect } from "./utility.js"
import {Bird, Obstacle} from "./bird_game.js" //we shouldn't know about the game itself to prevent cheating
import { client} from "./socket_client.js"; //for networking

const btnNewGame = <HTMLButtonElement> document.getElementById("btnNewGame");
const btnJoinGame = <HTMLButtonElement> document.getElementById("btnJoinGame");

const gameScreen = document.getElementById("gameScreen");
const initialScreen = document.getElementById("InitialScreen");

const inputGameCode = <HTMLTextAreaElement> document.getElementById("inputGameCode");

const canvas = <HTMLCanvasElement> document.getElementById("canvas1"); //we get the canvas
const context = canvas.getContext("2d"); //we take a visuals as 2d
canvas.width = 800; //set to same as body in HTML
canvas.height = 500;
context.font = "30px Arial"; //idk just something

//Networking
//#region 
let clientId : string = null
client.onmessage = function(message : MessageEvent<any>){
    let data = JSON.parse(message.data);
    console.log("message data: ", data);


    if(data.Method === "Connect"){
        //then we receive the client id
        clientId = data.ClientId;
    }

    if(data.Method === "CreateGame"){
        //game creation is successful we should join the room
        let roomId = data.payload.roomId;
        let gameId = data.payload.gameId;

        let payload = {
            "roomId" : roomId,
            "clientId" : clientId
        }

        client.send(JSON.stringify({
            "Method" : "JoinRoom",
            "payload" : payload
        }));
    }

    if(data.Method === "JoinRoom"){
        let roomId = data.payload.roomId;

        if(data.payload.message === "completed"){
            let inputGameCode = <HTMLTextAreaElement> document.getElementById("inputGameCode");
            inputGameCode.value = roomId;
            console.log("joined room successfully");

        }
    }

    if(data.Method === "GameUpdate"){
        if(gameScreen.style.display != null)
            console.log("gamescreen display: ", gameScreen.style.display);
        if(initialScreen.style.display != null)
            console.log("initialScreen display: ", initialScreen.style.display);
        gameScreen.style.display = "block";
        initialScreen.style.display = "none";

        let playerId = data.payload.playerId;

        let birds : Bird[] = data.payload.birds;
        let obstacles : Obstacle[] = data.payload.obstacles;
        let step : number = data.payload.step;

        console.log("step : ", step);

        ClearCanvas(context);
        RenderGame(context, birds, obstacles, playerId);
    }

    if(data.Method === "GameOver"){
        //then we look for the winner
        let winner = data.payload.winner; //index of the winner
        let win = data.payload.win; //boolean to check if we won
        console.log("Win: ", win, ", Winner: ", winner);
    }

    //now we check if it's game related
    /*
    if(data.method === "StartPoker"){
        console.log("Chinese Poker Start");
    }
    */
}

//#endregion





//clearing the whole canvas
function ClearCanvas(ctx:CanvasRenderingContext2D){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function DrawObstacle(ctx : CanvasRenderingContext2D, obstacle : Rect, screenHeight : number) {
    DrawRect(ctx, new Rect(obstacle.x, 0, obstacle.width, 
                            obstacle.y), "green"); //top side

    DrawRect(ctx, new Rect(obstacle.x, obstacle.y + obstacle.height, obstacle.width, 
                            screenHeight - (obstacle.y + obstacle.height)), "green"); //bottom side
}

//we just need to know where the birds and obstacles are to recreate the visual of the game
function RenderGame(ctx : CanvasRenderingContext2D, birds : Bird[], obstacles : Obstacle[], index : number = -1){
    for(let i=0; i<obstacles.length; i++){
        DrawObstacle(ctx, obstacles[i].rect, canvas.height);
        //DrawRect(ctx, new Rect(obstacles[i].rect.x, 0, obstacles[i].rect.width, canvas.height));
        DrawRect(ctx, obstacles[i].rect, "white", true);
    }

    for(let i=0; i<birds.length; i++){
        if(i === index){
            //DrawCircle(ctx, birds[i].circle, "red");
            continue;
        }
        DrawCircle(ctx, birds[i].circle, "blue"); //other players are blue
    }
    DrawCircle(ctx, birds[index].circle, "red"); //we are red
}

canvas.addEventListener("click", (event : MouseEvent) => {
    //send data for mouse click
    let payload = {
        "clientId": clientId,
        "action": 1 //pressed jump
    }

    client.send(JSON.stringify({
        "Method" : "GameAction",
        "payload" : payload
    }));
});


function RequestCreateGame(numPlayers : number = 2) {
    console.log("fwSpeed: ", canvas.width * 0.05);
    let payload = {
        "Method": "CreateGame",
        "ClientId" : clientId,
        "numPlayers" : numPlayers,
        "width" : canvas.width,
        "height" : canvas.height,
        "fwSpeed" : 0.02
    }
    client.send(JSON.stringify(payload));
}


btnNewGame.addEventListener("click", (event : MouseEvent) =>{
    console.log("request to make game");
    RequestCreateGame(2);
});

btnJoinGame.addEventListener("click", (event : MouseEvent) => {
    console.log(inputGameCode.value);
    let gameCode = inputGameCode.value; //the string Id

    let payload = {
        "roomId" : gameCode,
        "clientId" : clientId
    }
    client.send(JSON.stringify({
        "Method" : "JoinRoom",
        "payload" : payload
    }))
});