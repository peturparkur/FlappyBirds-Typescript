//const PORT : number = 4040;
const PORT = 8080; //for docker?
const client = new WebSocket("ws://localhost:" + PORT); //connect to server
let clientId = null;
client.onclose = function (event) {
    console.log("close code: ", event.code);
};
export { client, clientId };
