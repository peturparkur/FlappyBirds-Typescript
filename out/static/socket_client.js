//const PORT : number = 4040;
const PORT = 4040; //for docker?
const address = "localhost";
const client = new WebSocket("ws://" + address + ":" + PORT); //connect to server
let clientId = null;
client.onclose = function (event) {
    console.log("close code: ", event.code);
};
export { client, clientId };
