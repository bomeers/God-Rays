import { useState } from 'react'
import React from 'react'
import ReactDOM from 'react-dom';
import $ from 'jquery';
import './App.css'
import connectTTL from './components/TikTokLive'

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
