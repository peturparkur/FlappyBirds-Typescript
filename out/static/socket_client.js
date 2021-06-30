//const PORT : number = 4040;
const PORT = 4040; //for docker?
const address = "ec2-18-133-247-153.eu-west-2.compute.amazonaws.com";
const client = new WebSocket("ws://" + address + ":" + PORT); //connect to server
let clientId = null;
client.onclose = function (event) {
    console.log("close code: ", event.code);
};
export { client, clientId };
