//const PORT : number = 4040;
const PORT : number = 8080; //for docker?
const client = new WebSocket("ws://localhost:"+PORT); //connect to server

let clientId : string = null;

client.onclose = function(event:CloseEvent){
    console.log("close code: ", event.code);
};


export {client, clientId};