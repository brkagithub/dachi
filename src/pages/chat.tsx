import type { NextPage } from "next";
import { trpc } from "../utils/trpc";
import { signIn } from "next-auth/react";
import Navbar, { meType } from "../components/Navbar";
import React, { useEffect, useState } from "react";

const ChatComponent: React.FC<{
  me: meType | undefined;
}> = ({ me }) => {
  let inputBox: HTMLElement | null = null;
  let messageEnd: HTMLElement | null = null;

  const [messageText, setMessageText] = useState("");
  const [receivedMessages, setMessages] = useState([]);
  const messageTextIsEmpty = messageText.trim().length === 0;

  const messages = receivedMessages.map((message, index) => {
    return <div></div>;
  });

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
        <ChatComponent me={meData} />
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
