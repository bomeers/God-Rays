import os
import sys
from twitchio.ext import commands
from TikTokLive import TikTokLiveClient
from TikTokLive.types.events import CommentEvent, ConnectEvent, LikeEvent, GiftEvent, FollowEvent

class bcolors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

# Instantiate the client with the user's username
client: TikTokLiveClient = TikTokLiveClient(unique_id="@kronozeo")

# Define how you want to handle specific events via decorator
@client.on("connect")
async def on_connect(_: ConnectEvent):
    print("Connected to Room ID:", client.room_id)

# TODO: implement like stacking per user
# TODO: implement like leaderboard
async def on_like(event: LikeEvent):
    print(f"❤️  {bcolors.OKCYAN + event.user.nickname + bcolors.ENDC} liked the stream! x{event.likeCount}")

async def on_comment(event: CommentEvent):
    print(f"💬 {bcolors.OKCYAN + event.user.nickname + bcolors.ENDC} -> {event.comment}")

async def on_follow(event: FollowEvent):
    print(f"👍 {bcolors.OKCYAN + event.user.nickname + bcolors.ENDC} followed the host!")

# TODO: implement gift leaderboard
async def on_gift(event: GiftEvent):
    # If it's type 1 and the streak is over
    if event.gift.gift_type == 1 and event.gift.repeat_end == 1:
        print(f"🎁 {bcolors.OKCYAN + event.user.uniqueId + bcolors.ENDC} sent {event.gift.repeat_count}x \"{event.gift.extended_gift.name}\"")

    # It's not type 1, which means it can't have a streak & is automatically over
    elif event.gift.gift_type != 1:
        print(f"🎁 {bcolors.OKCYAN + event.user.uniqueId + bcolors.ENDC} sent \"{event.gift.extended_gift.name}\"")


# Define handling an event via "callback"
client.add_listener("comment", on_comment)
client.add_listener("like", on_like)
client.add_listener("gift", on_gift)
client.add_listener("follow", on_follow)

if __name__ == '__main__':
    client.run()