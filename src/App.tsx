import { useState } from 'react'
import './App.css'
// @ts-ignore
import { WebcastPushConnection } from 'tiktok-livestream-chat-connector'

function App() {
    const [count, setCount] = useState(0);
    require('dotenv').config();

    const express = require('express');
    const { createServer } = require('http');
    const { Server } = require('socket.io');
    // const { WebcastPushConnection } = require('tiktok-livestream-chat-connector');

    const app = express();
    const httpServer = createServer(app);
    const io = new Server(httpServer, {
        cors: {
            origin: '*'
        }
    });

    let globalConnectionCount = 0;

    setInterval(() => {
        io.emit('statistic', { globalConnectionCount });
    }, 5000)

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






    let ioConnection = new io();

    let viewerCount = 0;
    let likeCount = 0;
    let diamondsCount = 0;

    $(document).ready(() => {
        $('#connectButton').click(connect);
        $('#uniqueIdInput').on('keyup', function (e) {
            if (e.key === 'Enter') {
                connect();
            }
        });
    })

    function connect() {
        let uniqueId = $('#uniqueIdInput').val();
        if (uniqueId !== '') {
            ioConnection.emit('setUniqueId', uniqueId, {
                enableExtendedGiftInfo: true
            });
            $('#stateText').text('Connecting...');
        } else {
            alert('no username entered');
        }
    }

    function sanitize(text: string) {
        return text.replace(/</g, '&lt;')
    }

    function updateRoomStats() {
        $('#roomStats').html(`Viewers: <b>${viewerCount.toLocaleString()}</b> Likes: <b>${likeCount.toLocaleString()}</b> Earned Diamonds: <b>${diamondsCount.toLocaleString()}</b>`)
    }

    function generateUsernameLink(data: any) {
        return `<a class="usernamelink" href="https://www.tiktok.com/@${data.uniqueId}" target="_blank">${data.uniqueId}</a>`;
    }

    function isPendingStreak(data: any) {
        return data.gift.gift_type === 1 && data.gift.repeat_end === 0;
    }

    function addChatItem(color: any, data: any, text: string, summarize: any) {
        let container = $('.chatcontainer');

        if (container.find('div').length > 500) {
            container.find('div').slice(0, 200).remove();
        }

        container.find('.temporary').remove();;

        container.append(`
            <div class=${summarize ? 'temporary' : 'static'}>
                <img class="miniprofilepicture" src="${data.profilePictureUrl}">
                <span>
                    <b>${generateUsernameLink(data)}:</b> 
                    <span style="color:${color}">${sanitize(text)}</span>
                </span>
            </div>
        `);

        container.stop();
        container.animate({
            scrollTop: container[0].scrollHeight
        }, 400);
    }

    function addGiftItem(data: any) {
        let container = $('.giftcontainer');

        if (container.find('div').length > 200) {
            container.find('div').slice(0, 100).remove();
        }

        let streakId = data.userId.toString() + '_' + data.giftId;

        let html = `
            <div data-streakid=${isPendingStreak(data) ? streakId : ''}>
                <img class="miniprofilepicture" src="${data.profilePictureUrl}">
                <span>
                    <b>${generateUsernameLink(data)}:</b> <span>${data.extendedGiftInfo.describe}</span><br>
                    <div>
                        <table>
                            <tr>
                                <td><img class="gifticon" src="${(data.extendedGiftInfo.icon || data.extendedGiftInfo.image).url_list[0]}"></td>
                                <td>
                                    <span>Name: <b>${data.extendedGiftInfo.name}</b> (ID:${data.giftId})<span><br>
                                    <span>Repeat: <b style="${isPendingStreak(data) ? 'color:red' : ''}">x${data.gift.repeat_count.toLocaleString()}</b><span><br>
                                    <span>Cost: <b>${(data.extendedGiftInfo.diamond_count * data.gift.repeat_count).toLocaleString()} Diamonds</b><span>
                                </td>
                            </tr>
                        </tabl>
                    </div>
                </span>
            </div>
        `;

        let existingStreakItem = container.find(`[data-streakid='${streakId}']`);

        if (existingStreakItem.length) {
            existingStreakItem.replaceWith(html);
        } else {
            container.append(html);
        }

        container.stop();
        container.animate({
            scrollTop: container[0].scrollHeight
        }, 800);
    }

    // Control events
    ioConnection.on('setUniqueIdSuccess', (state: any) => {
        // reset stats
        viewerCount = 0;
        likeCount = 0;
        diamondsCount = 0;
        updateRoomStats();
        $('#stateText').text(`Connected to roomId ${state.roomId}`);
    })

    ioConnection.on('setUniqueIdFailed', (errorMessage: any) => {
        $('#stateText').text(errorMessage);
    })

    ioConnection.on('streamEnd', () => {
        $('#stateText').text('Stream ended.');
    })

    // viewer stats
    ioConnection.on('roomUser', (msg: any) => {
        if (typeof msg.viewerCount === 'number') {
            viewerCount = msg.viewerCount;
            updateRoomStats();
        }
    })

    // like stats
    ioConnection.on('like', (msg: any) => {
        if (typeof msg.likeCount === 'number') {
            addChatItem('#447dd4', msg, msg.label.replace('{0:user}', '').replace('likes', `${msg.likeCount} likes`), '')
        }

        if (typeof msg.totalLikeCount === 'number') {
            likeCount = msg.totalLikeCount;
            updateRoomStats();
        }
    })

    // Chat events,
    let joinMsgDelay = 0;
    ioConnection.on('member', (msg: any) => {
        let addDelay = 250;
        if (joinMsgDelay > 500) addDelay = 100;
        if (joinMsgDelay > 1000) addDelay = 0;

        joinMsgDelay += addDelay;

        setTimeout(() => {
            joinMsgDelay -= addDelay;
            addChatItem('#21b2c2', msg, 'joined', true);
        }, joinMsgDelay);
    })

    ioConnection.on('chat', (msg: any) => {
        addChatItem('', msg, msg.comment, '');
    })

    ioConnection.on('gift', (data: any) => {
        addGiftItem(data);

        if (!isPendingStreak(data) && data.extendedGiftInfo.diamond_count > 0) {
            diamondsCount += (data.extendedGiftInfo.diamond_count * data.gift.repeat_count);
            updateRoomStats();
        }
    })

    // share, follow
    ioConnection.on('social', (data: any) => {
        let color = data.displayType.includes('follow') ? '#ff005e' : '#2fb816';
        addChatItem(color, data, data.label.replace('{0:user}', ''), '');
    })

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
