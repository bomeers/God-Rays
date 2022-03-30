let { PythonShell } = require('python-shell')
let pyshell = new PythonShell('TTL.py');
const tmi = require('tmi.js');

// Define configuration options
const opts = {
    identity: {
        username: "bigduckttbot",
        password: "oauth:yblm6j0o8x389gqfsjhv7qizhl20c3"
    },
    channels: [
        "bigduck20"
    ]
};

const client = new tmi.client(opts);

client.on('connected', onConnectedHandler);
client.connect();

pyshell.on('message', function (message) {
    console.log(message);
    // client.say('[TikTok] ', message);
});

pyshell.end(function (err, code, signal) {
    if (err) throw err;
    console.log('The exit code was: ' + code);
    console.log('The exit signal was: ' + signal);
    console.log('finished');
});

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
    console.log(`* Connected to ${addr}:${port}`);
}