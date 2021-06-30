const PORT = 4040;
//const PORT = 8080; //for docker?
const client = new WebSocket("ws://ec2-18-133-247-153.eu-west-2.compute.amazonaws.com:" + PORT); //connect to server
let clientId = null;
client.onclose = function (event) {
    console.log("close code: ", event.code);
};
export { client, clientId };
