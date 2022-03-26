
function getTikTokEvents() {
    const { WebcastPushConnection } = require('tiktok-livestream-chat-connector');

    let tiktokUsername = "bigduck209";
    let tiktokChatConnection = new WebcastPushConnection(tiktokUsername);

    tiktokChatConnection.connect()
        .then(state => { console.info(`Connected to roomId ${state.roomId}`); })
        .catch(err => { console.error('Failed to connect', err); })

    // Define the events that you want to handle
    // In this case we listen to chat messages (comments)
    tiktokChatConnection.on('chat', data => {
        console.log(`${data.uniqueId} (userId:${data.userId}) writes: ${data.comment}`);
    })

    // And here we receive gifts sent to the streamer
    tiktokChatConnection.on('gift', data => {
        console.log(`${data.uniqueId} (userId:${data.userId}) sends ${data.giftId}`);
    })
}

export default getTikTokEvents
