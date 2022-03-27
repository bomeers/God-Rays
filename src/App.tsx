import { useState } from 'react'
import './App.css'
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

require('dotenv').config();

const { WebcastPushConnection } = require('tiktok-livestream-chat-connector');
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

let globalConnectionCount = 0;

setInterval(() => { io.emit('statistic', { globalConnectionCount }); }, 5000)

io.on('connection', (socket: any) => {
    let chatConnection: any;

    function disconnectChat() {
        if (chatConnection) {
            chatConnection.disconnect();
            chatConnection = null;
        }
    }

    socket.on('setUniqueId', (uniqueId: any, options: any) => {

        console.log('connecting', uniqueId, options);

        let thisConnection = new WebcastPushConnection(uniqueId, options);

        thisConnection.connect().then((state: any) => {
            disconnectChat();
            chatConnection = thisConnection;
            if (!socket.connected) {
                disconnectChat();
                return;
            }
            socket.emit('setUniqueIdSuccess', state);
        }).catch((err: any) => {
            socket.emit('setUniqueIdFailed', err.toString());
        })

        thisConnection.on('roomUser', (msg: any) => socket.emit('roomUser', msg));
        thisConnection.on('member', (msg: any) => socket.emit('member', msg));
        thisConnection.on('chat', (msg: any) => socket.emit('chat', msg));
        thisConnection.on('gift', (msg: any) => socket.emit('gift', msg));
        thisConnection.on('social', (msg: any) => socket.emit('social', msg));
        thisConnection.on('like', (msg: any) => socket.emit('like', msg));
        thisConnection.on('streamEnd', () => socket.emit('streamEnd'));

        thisConnection.on('connected', () => {
            console.log("chatConnection connected");
            globalConnectionCount += 1;
        });

        thisConnection.on('disconnected', () => {
            console.log("chatConnection disconnected");
            globalConnectionCount -= 1;
        });

        thisConnection.on('error', (err: any) => {
            console.error(err);
        });
    })

    socket.on('disconnect', () => {
        disconnectChat();
        console.log('client disconnected');
    })

    console.log('client connected');
});

// Server frontend files
app.use(express.static('public'));

httpServer.listen(process.env.PORT || 80);

function App() {
    const [count, setCount] = useState(0)

    return (
        <div className="App">
            <div className="head">
                <h1>TikTok LIVE Chat Reader</h1>
                <span className="subTitle">Source: <a href="https://github.com/zerodytrash/TikTok-Chat-Reader">https://github.com/zerodytrash/TikTok-Chat-Reader</a></span>
            </div>

            <div>
                A chat reader for <a href="https://www.tiktok.com/live">TikTok LIVE</a> utilizing <a href="https://github.com/zerodytrash/TikTok-Livestream-Chat-Connector">TikTok-Livestream-Chat-Connector</a> and <a href="https://socket.io/">Socket.IO</a> to forward the data to the client.
            </div>

            <div className="inputFields">
                <p>Enter the <b>@username</b> of a user who is currently live:</p>
                <input type="text" id="uniqueIdInput" />
                <input type="button" id="connectButton" value="connect" />
            </div>

            <table className="splitstatetable">
                <tr>
                    <td>
                        <pre id="stateText"></pre>
                    </td>
                    <td>
                        <div id="roomStats"></div>
                    </td>
                </tr>
            </table>

            <table className="splitchattable">
                <tr>
                    <td>
                        <div className="chatcontainer">
                            <h3 className="containerheader">Chats</h3>
                        </div>
                    </td>
                    <td>
                        <div className="giftcontainer">
                            <h3 className="containerheader">Gifts</h3>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    )
}

export default App
