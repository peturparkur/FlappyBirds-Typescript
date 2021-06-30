//const PORT : number = 4040;
const PORT : number = 4040; //for docker?
const address : string = "localhost"
const client = new WebSocket("ws://" + address + ":"+PORT); //connect to server

let clientId : string = null;

client.onclose = function(event:CloseEvent){
    console.log("close code: ", event.code);
};


export {client, clientId};