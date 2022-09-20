import type { NextPage } from "next";
import { trpc } from "../../utils/trpc";
import { signIn } from "next-auth/react";
import Navbar, { meType } from "../../components/Navbar";
import React, { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Pusher from "pusher-js";
import { useRouter } from "next/router";
import { compareStrings } from "../../utils/compareStrings";
import NextLink from "next/link";

//todo: presence, persist msgs in database

type Message = {
  body: string;
  senderName: string;
  timestamp: Date;
};

type TypingData = {
  username: string;
};

const ChatComponent: React.FC<{
  me: meType | undefined;
  recipientName: string;
}> = ({ me, recipientName }) => {
  let messageEnd = useRef<HTMLElement>(null);

  const { data: previousMessages, isLoading: messagesLoading } = trpc.useQuery(
    ["chat.previousMessages", { otherChatterName: recipientName }],
    {
      refetchOnWindowFocus: false,
      onSuccess: () => {
        setReceivedMessages([]);
      },
    }
  );
  const { data: recipientImage, isLoading: imageLoading } = trpc.useQuery(
    ["user.getImageAndFirstNameByName", { name: recipientName }],
    {
      refetchOnWindowFocus: false,
    }
  );

  const sendMessageMutation = trpc.useMutation(["chat.sendMessage"]);
  const userTypingMutation = trpc.useMutation(["chat.userTyping"]);

  const [messageText, setMessageText] = useState("");
  const [typing, setTyping] = useState("");
  const [lastMessageSeen, setLastMessageSeen] = useState(false);
  const [recipientOnline, setRecipientOnline] = useState(false);
  const [receivedMessages, setReceivedMessages] = useState<Message[]>([]); //messages received between render and now
  const [newMsg, setNewMsg] = useState<Message | null>(null); //hook to add new message to receivedMessages

  var clearInterval1 = 900; //0.9 seconds
  var clearTimerId1: ReturnType<typeof setTimeout>;

  useEffect(() => {
    if (!me || !me.name) return;

    const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: "eu",
    });

    let participants = compareStrings(recipientName, me?.name);

    const channel = pusherClient.subscribe(
      `${participants[0]}-${participants[1]}`
    ); //${props.chatterName}-${me?.name}
    channel.bind("message-sent", (data: Message) => {
      //should be object with msgBody, senderName
      setNewMsg(data);
      if (channel.subscriptionCount != 2) {
        setLastMessageSeen(false);
      }
    });
    channel.bind("user-typing", (data: TypingData) => {
      if (data.username !== me.name) {
        var typingText = data.username + " is typing...";
        setTyping(typingText);
        clearTimeout(clearTimerId1);
        clearTimerId1 = setTimeout(function () {
          setTyping("");
        }, clearInterval1);
      }
    });

    channel.bind("pusher:subscription_count", (_: any) => {
      if (channel.subscriptionCount && channel.subscriptionCount >= 2) {
        setRecipientOnline(true);
        setLastMessageSeen(true);
      } else setRecipientOnline(false);
    });

    return () => {
      pusherClient.unsubscribe(`${participants[0]}-${participants[1]}`); //${props.chatterName}-${me?.name}
    };
  }, []);

  useEffect(() => {
    messageEnd?.current?.scrollIntoView({ behavior: "smooth" });
  });

  useEffect(() => {
    //add new message to previous messages
    if (newMsg) {
      console.log("newMsg effect ran, newMsg: ", newMsg);
      setReceivedMessages([...receivedMessages, newMsg]);
      //messageEnd?.current?.scrollIntoView();
    }
  }, [newMsg]);

  const messageTextIsEmpty = messageText.trim().length === 0;

  if (imageLoading) {
    return <div>user data loading...</div>;
  }

  if (messagesLoading) {
    return <div>messages loading...</div>;
  }

  if (!recipientImage) {
    return <div>no such user exists</div>;
  }

  const meClassname = "self-end flex flex-col m-1";
  const recipientClassname = "flex flex-col m-1";

  const messagesBeforeRender = previousMessages?.map((message, index) => {
    return (
      <div
        className={
          message.messageSenderName == recipientName
            ? recipientClassname
            : meClassname
        }
        key={message.id}
      >
        <div className="flex" key={message.id}>
          {message.messageSenderName == recipientName ? (
            <>
              <NextLink href={`/profile/${recipientName}`}>
                <img
                  className="h-10 w-10 rounded-full cursor-pointer"
                  src={recipientImage!.image || ""}
                ></img>
              </NextLink>
              <div className="p-1"></div>
            </>
          ) : (
            <></>
          )}
          <div
            className={
              message.messageSenderName == recipientName
                ? "text-left pt-2 pb-2 rounded-3xl bg-gray-500 text-black flex"
                : "text-right pt-2 pb-2 rounded-3xl bg-gray-300 text-black flex"
            }
            key={message.id}
          >
            <div className="max-w-xxs sm:max-w-xs md:max-w-sm lg:max-w-md break-words pl-3 pr-3 text-left">
              {message.body}
            </div>
            <div className="flex">
              <div className="text-right text-xs pl-2 pr-1 pt-2 self-end">
                {message.timestamp.toISOString().substring(11, 16)}
              </div>
            </div>
          </div>
        </div>
        {index == previousMessages.length - 1 &&
          receivedMessages.length == 0 &&
          message.messageSenderName != recipientName && (
            <div className="text-sm text-right">
              {lastMessageSeen || recipientOnline ? "👁" : "✈"}
            </div>
          )}
      </div>
    );
  });

  const messages = receivedMessages.map((message, index) => {
    return (
      <div
        className={
          message.senderName == recipientName ? recipientClassname : meClassname
        }
        key={index + " "}
      >
        <div className="flex">
          {message.senderName == recipientName ? (
            <>
              <NextLink href={`/profile/${recipientName}`}>
                <img
                  className="h-10 w-10 rounded-full cursor-pointer"
                  src={recipientImage!.image || ""}
                ></img>
              </NextLink>
              <div className="p-1"></div>
            </>
          ) : (
            <></>
          )}
          <div
            className={
              message.senderName == recipientName
                ? "text-left pt-2 pb-2 rounded-3xl bg-gray-500 text-black flex"
                : "text-right pt-2 pb-2 rounded-3xl bg-gray-300 text-black flex"
            }
          >
            <div className="max-w-xxs sm:max-w-xs md:max-w-sm lg:max-w-md break-words pl-3 pr-3 text-left">
              {message.body}
            </div>
            <div className="flex">
              <div className="text-right text-xs pl-2 pr-1 pt-2 self-end">
                {message.timestamp.toString().substring(11, 16)}
              </div>
            </div>
          </div>
        </div>
        {index == receivedMessages.length - 1 &&
          message.senderName != recipientName && (
            <div className="text-sm text-right">
              {lastMessageSeen || recipientOnline ? "👁" : "✈"}
            </div>
          )}
      </div>
    );
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessageMutation.mutate({
      messageBody: messageText,
      recipientName: recipientName,
    });
    setMessageText("");
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.charCode !== 13 || messageTextIsEmpty) {
      return;
    }
    sendMessageMutation.mutate({
      messageBody: messageText,
      recipientName: recipientName,
    });
    setMessageText("");
    e.preventDefault();
  };

  var canPublish = true;
  var throttleTime = 200;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    if (canPublish && me?.name && e.target.value) {
      userTypingMutation.mutate({ recipientName: recipientName });
      canPublish = false;
      setTimeout(function () {
        canPublish = true;
      }, throttleTime);
    }
  };

  return (
    <div className="max-w-2xl mx-auto  h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex flex-col justify-between">
        <div className="flex pb-4">
          <div className="p-2">
            <NextLink href={`/profile/${recipientName}`}>
              <img
                className="h-8 w-8 rounded-full cursor-pointer"
                src={recipientImage!.image || ""}
              ></img>
            </NextLink>
          </div>
          <div className="flex flex-col pl-4">
            <div className="text-xl">{recipientImage!.firstName}</div>
            <div className="text-sm text-gray-400">@{recipientName}</div>
            {recipientOnline ? (
              <div className="text-sm text-green-600">online</div>
            ) : (
              <div className="text-sm text-red-600">offline</div>
            )}
          </div>
        </div>
        <div>
          <div className="overflow-y-scroll h-[calc(100vh-16rem)] pr-4 scrollbar scrollbar-thumb-gray-500 scrollbar-track-gray-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
            <div className="flex flex-col">{messagesBeforeRender}</div>
            <div className="flex flex-col">{messages}</div>
            {typing && (
              <div className={recipientClassname}>
                <div className="flex">
                  <img
                    className="h-10 w-10 rounded-full cursor-pointer"
                    src={recipientImage!.image || ""}
                  ></img>
                  <div className="p-1"></div>

                  <div
                    className={
                      "text-left p-2 rounded-3xl bg-gray-500 text-black italic text-md"
                    }
                  >
                    {typing}
                  </div>
                </div>
              </div>
            )}
            <div
              //@ts-ignore
              ref={messageEnd}
            ></div>
          </div>
          <form onSubmit={handleSubmit} className="pt-3 pb-3 pr-1 pl-1">
            <textarea
              className="text-black w-full rounded-3xl p-2 mb-2 h-16"
              value={messageText}
              placeholder="Message..."
              onChange={(e) => handleTextChange(e)}
              //@ts-ignore
              onKeyPress={handleKeyPress}
            ></textarea>
          </form>
        </div>
      </div>
    </div>
  );
};

const Chat: NextPage = () => {
  const { data: meData, isLoading } = trpc.useQuery(["user.me"], {
    refetchOnWindowFocus: false,
  });
  const { query } = useRouter();

  if (!query.name || typeof query.name !== "string") {
    return null;
  }

  if (isLoading) {
    return <div className="text-center pt-4">Loading...</div>;
  }

  if (meData) {
    return (
      <div>
        <Navbar me={meData} />
        <ChatComponent me={meData} recipientName={query.name} />
      </div>
    );
  }
  return (
    <>
      <Navbar me={meData}></Navbar>
      Not signed in <br />
      <button onClick={() => signIn("discord")}>Sign in with Discord</button>
    </>
  );
};

export default Chat;
