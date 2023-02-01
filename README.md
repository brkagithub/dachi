# Create T3 App

This is an app bootstrapped according to the [init.tips](https://init.tips) stack, also known as the T3-Stack.

What can you do on the app?

**Easy to sign up and set up your profile**

You sign up/log in with Google or Discord, and your basic info will be imported from there (e.g. profile picture). On your profile, you can edit that information, add your favorite champions, main role and most importantly your League account which other users will be able to see so they can decide whether they'd like to potentially play with you.

### Example profile

![image](https://user-images.githubusercontent.com/29480900/216074396-5854ae06-76c3-43db-a040-24093a0f42c4.png)


**Find friends/Explore**

The app will try to match you with other users based on your preferences (mentioned later). You can either add them as a friend or skip them (you can also block the user and if you notice any offensive language on someone's profile feel free to report it here). Once they accept your friend requests you will be available to see them in your inbox and start chatting with them.

### Find friends page - you can add, block or skip the person

![image](https://user-images.githubusercontent.com/29480900/216074589-e8c516d1-aa98-408c-bb58-ff206ddb67d4.png)

### Your friend requests

![image](https://user-images.githubusercontent.com/29480900/216076348-26e7c5b2-2311-4dbb-89cd-aa183760115f.png)

**Choose your Preferences/Settings**

Are you a Gold ADC main from Europe? You'd probably want to match only with Support mains from EUW/EUNE servers that are Silver, Gold or Plat. Or maybe you're a casual player that mains mid lane and would like to play with players of any other role but mid lane and rank doesn't matter to you, the possibilities are endless with the filtering system. If you do not want to filter your matches you can use the 'Turn off filters' option.

### Choose preferences page

![image](https://user-images.githubusercontent.com/29480900/216076798-0098eb1b-dd69-42ba-ae96-1777dc62df89.png)
![image](https://user-images.githubusercontent.com/29480900/216076904-927ab7e5-4614-4ab6-b943-807ffe1090c4.png)
![image](https://user-images.githubusercontent.com/29480900/216076927-37e4b1e7-2335-4490-9867-b128a07b0c03.png)


**Chat with your friends**

Dachi has a very basic chat functionality - once you've befriended someone - you can send them a message and start a conversation. You can see whether the user's online and whether they've seen the message (eye emoji). Sending images/gifs is not supported as of now, so I'd like to encourage people to move their chats to Discord or a similar platform if they want an even better chatting experience. The chat is built with websockets - making the communication very fast and very very close to real-time (used Pusher websocket service).

### Example chat

![image](https://user-images.githubusercontent.com/29480900/216078111-2ebd83b6-74c5-4cdc-8c51-37a4bb77366d.png)


![image](https://user-images.githubusercontent.com/29480900/216077955-a3ed5d71-bc45-4091-bd01-89517889737b.png)


**TODO**

- separate page to verify riot accounts
- support multiple riot accounts instead of one
- live searching for party/clash
- other games
- reviews
- next image (kinda done)
- unblock list
- SEO twitter cards for example (kinda done)
- prettier logo etc?
- when you name change chat gets weird - change recipientName to recipientId on chat page or make name not changeable
- updating riot acc lasts too long sometimes
- additional checks/notes on what twitter, youtube handles should be, also for pfp
- pusher is currently on EU cluster, while vercel and db are around washington dc - should probably change that
- add people from their profiles
- unblock people
