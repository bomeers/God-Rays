// let ioConnection = new io();

let viewerCount = 0;
let likeCount = 0;
let diamondsCount = 0;

// $(document).ready(() => {
//     $('#connectButton').click(connectTTL);
//     $('#uniqueIdInput').on('keyup', function (e) {
//         if (e.key === 'Enter') {
//             connectTTL();
//         }
//     });
// })

// function connectTTL() {
//     let uniqueId = $('#uniqueIdInput')?.val();
//     if (uniqueId !== '') {
//         ioConnection.emit('setUniqueId', uniqueId, {
//             enableExtendedGiftInfo: true
//         });
//         $('#stateText').text('Connecting...');
//     } else {
//         alert('no username entered');
//     }
// }

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

function addChatItem(color: string, data: any, text: string, summarize: any) {
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
    //TODO find way to use this without jquery
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

export default {
    // connectTTL
}