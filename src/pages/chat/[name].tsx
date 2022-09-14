import type { NextPage } from "next";
import { trpc } from "../../utils/trpc";
import { signIn } from "next-auth/react";
import Navbar, { meType } from "../../components/Navbar";
import React, { FormEvent, useEffect, useMemo, useState } from "react";
import Pusher from "pusher-js";
import { useRouter } from "next/router";
import { compareStrings } from "../../utils/compareStrings";

//todo: presence, persist msgs in database

type Message = {
  body: string;
  senderName: string;
  timestamp: Date;
};

const ChatComponent: React.FC<{
  me: meType | undefined;
  recipientName: string;
}> = ({ me, recipientName }) => {
  let inputBox: HTMLElement | null = null;
  let messageEnd: HTMLElement | null = null;

  const pusherClient = useMemo(
    () =>
      new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
        cluster: "eu",
      }),
    []
  );

  const { data: previousMessages, isLoading: messagesLoading } = trpc.useQuery([
    "chat.previousMessages",
    { otherChatterName: recipientName },
  ]);
  const { data: recipientImage, isLoading: imageLoading } = trpc.useQuery([
    "user.getImageByName",
    { name: recipientName },
  ]);
  const sendMessageMutation = trpc.useMutation(["chat.sendMessage"]);

  const [messageText, setMessageText] = useState("");
  const [receivedMessages, setReceivedMessages] = useState<Message[]>([]); //messages received between render and now
  const [newMsg, setNewMsg] = useState<Message | null>(null); //hook to add new message to receivedMessages

  useEffect(() => {
    //add new message to previous messages
    if (newMsg) {
      setReceivedMessages([...receivedMessages, newMsg]);
      messageEnd?.scrollIntoView({ behavior: "smooth" });
    }
  }, [newMsg]);

  useEffect(() => {
    if (!me || !me.name) return;

    let participants = compareStrings(recipientName, me?.name);

    const channel = pusherClient.subscribe(
      `${participants[0]}-${participants[1]}`
    ); //${props.chatterName}-${me?.name}
    channel.bind("message-sent", (data: Message) => {
      //should be object with msgBody, senderName
      setNewMsg(data);
    });

    return () => {
      pusherClient.unsubscribe(`${participants[0]}-${participants[1]}`); //${props.chatterName}-${me?.name}
    };
  }, [pusherClient]);

  //useEffect(() => {}, [receivedMessages]);

  const messageTextIsEmpty = messageText.trim().length === 0;

  if (imageLoading) {
    return <div>user data loading...</div>;
  }

  if (messagesLoading) {
    return <div>messages loading...</div>;
  }

  const meClassname = "self-end flex flex-col m-1";
  const recipientClassname = "flex flex-col m-1";

  const messagesBeforeRender = previousMessages?.map((message) => {
    return (
      <div
        className={
          message.messageSenderName == recipientName
            ? recipientClassname
            : meClassname
        }
      >
        <div className="flex">
          {message.messageSenderName == recipientName ? (
            <>
              <img
                className="h-8 w-8 rounded-full"
                src={recipientImage!.image || ""}
              ></img>
              <div className="p-1"></div>
            </>
          ) : (
            <></>
          )}
          <div
            className={
              message.messageSenderName == recipientName
                ? "text-left p-2 rounded-3xl bg-gray-500 text-black"
                : "text-right p-2 rounded-3xl bg-gray-300 text-black"
            }
          >
            {message.body}
          </div>
        </div>
      </div>
    );
  });

  const messages = receivedMessages.map((message) => {
    return (
      <div
        className={
          message.senderName == recipientName ? recipientClassname : meClassname
        }
      >
        <div className="flex">
          {message.senderName == recipientName ? (
            <>
              <img
                className="h-8 w-8 rounded-full"
                src={recipientImage!.image || ""}
              ></img>
              <div className="p-1"></div>
            </>
          ) : (
            <></>
          )}
          <div
            className={
              message.senderName == recipientName
                ? "text-left p-2 rounded-3xl bg-gray-500 text-black"
                : "text-right p-2 rounded-3xl bg-gray-300 text-black"
            }
          >
            {message.body}
          </div>
        </div>
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

  return (
    <div className="max-w-2xl mx-auto pt-8 pr-4 pl-4 md:pl-2 md:pr-2 flex-grow h-screen">
      <div className="overflow-y-scroll max-h-192">
        <div className="flex flex-col">{messagesBeforeRender}</div>
        <div className="flex flex-col">{messages}</div>
        <div
          ref={(element) => {
            messageEnd = element;
          }}
        ></div>
      </div>
      <form onSubmit={handleSubmit}>
        <textarea
          className="text-black"
          ref={(element) => {
            inputBox = element;
          }}
          value={messageText}
          placeholder="Type a message..."
          onChange={(e) => setMessageText(e.target.value)}
          //@ts-ignore
          onKeyPress={handleKeyPress}
        ></textarea>
        <button
          disabled={messageTextIsEmpty}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-red-500"
        >
          Send message
        </button>
      </form>
    </div>
  );
};

const Chat: NextPage = () => {
  const { data: meData, isLoading } = trpc.useQuery(["user.me"]);
  const { query } = useRouter();

  if (!query.name || typeof query.name !== "string") {
    return null;
  }

  if (isLoading) {
    return <div className="text-center pt-4">Loading...</div>;
  }

  if (meData) {
    return (
      <div className="h-screen">
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
