import type { NextPage } from "next";
import { trpc } from "../utils/trpc";
import { signIn } from "next-auth/react";
import Navbar from "../components/Navbar";
import ProfilePage from "../components/Profile";
import React, { FormEventHandler, useEffect, useState } from "react";
import { useChannel } from "../utils/useChannel";
import * as Ably from "ably";

const ChatComponent = () => {
  let inputBox: HTMLElement | null = null;
  let messageEnd: HTMLElement | null = null;

  const [messageText, setMessageText] = useState("");
  const [receivedMessages, setMessages] = useState<Ably.Types.Message[]>([]);
  const messageTextIsEmpty = messageText.trim().length === 0;

  const [channel, ably] = useChannel("chat-demo", (message) => {
    //some user1id + user2id combination instead of chat-demo
    const history = receivedMessages.slice(-199);
    setMessages([...history, message]);
  });

  const sendChatMessage = (messageText: string) => {
    if (channel) {
      (channel as Ably.Types.RealtimeChannelPromise).publish({
        name: "chat-message",
        data: messageText,
      }); //user too
      setMessageText("");
      inputBox?.focus();
    }
  };

  const messages = receivedMessages.map((message, index) => {
    const author =
      message.connectionId ===
      (ably as Ably.Types.RealtimePromise).connection.id
        ? "me"
        : "other";
    return (
      <span key={index} data-author={author}>
        {message.data}
      </span>
    );
  });

  const handleFormSubmission = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendChatMessage(messageText);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.charCode !== 13 || messageTextIsEmpty) {
      return;
    }
    sendChatMessage(messageText);
    event.preventDefault();
  };

  useEffect(() => {
    messageEnd?.scrollIntoView({ behavior: "smooth" });
  });

  return (
    <div>
      <div>
        {messages}
        <div
          ref={(element) => {
            messageEnd = element;
          }}
        ></div>
        <form onSubmit={handleFormSubmission}>
          <textarea
            ref={(element) => {
              inputBox = element;
            }}
            value={messageText}
            placeholder="Type a message..."
            onChange={(e) => setMessageText(e.target.value)}
            // @ts-ignore
            onKeyPress={handleKeyPress} //dont know why ts does this
          ></textarea>
          <button type="submit" disabled={messageTextIsEmpty}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

const Chat: NextPage = () => {
  const { data: meData, isLoading } = trpc.useQuery(["user.me"]);

  if (isLoading) {
    return <div className="text-center pt-4">Loading...</div>;
  }

  if (meData) {
    return (
      <>
        <Navbar me={meData} />
        <ChatComponent />
      </>
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
