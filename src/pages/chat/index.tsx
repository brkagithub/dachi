import type { NextPage } from "next";
import { trpc } from "../../utils/trpc";
import { signIn, signOut } from "next-auth/react";
import Navbar from "../../components/Navbar";
import NextLink from "next/link";
import Head from "next/head";

const Home: NextPage = () => {
  //const hello = trpc.useQuery(["example.hello", { text: "from tRPC" }]);
  const { data: meData, isLoading } = trpc.useQuery(["user.me"], {
    refetchOnWindowFocus: false,
  }); /*const fillDb = trpc.useMutation(["user.fillDb"]);*/
  const { data: friends, isLoading: isLoadingFriends } = trpc.useQuery([
    "match.getFriends",
  ]);
  if (isLoading) {
    return (
      <>
        <Head>
          <title>Inbox</title>
        </Head>
        <div className="text-center pt-4">loading...</div>
      </>
    );
  }

  if (isLoadingFriends) {
    return (
      <>
        <Head>
          <title>Inbox</title>
        </Head>
        <div className="text-center pt-4">loading chats...</div>
      </>
    );
  }

  if (friends && friends.length == 0) {
    return (
      <>
        <Head>
          <title>Inbox</title>
        </Head>
        <Navbar me={meData} />
        <div className="max-w-2xl mx-auto pt-8 pr-4 pl-4 md:pl-2 md:pr-2">
          <h1 className="text-2xl text-indigo-200">
            You have no friends added right now. Click find friends in the
            navbar.
          </h1>
        </div>
      </>
    );
  }

  if (meData) {
    return (
      <>
        <Head>
          <title>Inbox</title>
        </Head>
        <Navbar me={meData}></Navbar>
        <div className="max-w-2xl mx-auto pt-8 pr-4 pl-4 md:pl-2 md:pr-2">
          <h1 className="text-2xl font-semibold text-indigo-200">My chats</h1>
          <div className="mx-auto pt-4">
            {friends?.map((friend) => (
              <NextLink
                href={`chat/${
                  (friend.requestInitiatorId != meData.id &&
                    friend.requestInitiator.name) ||
                  (friend.requestTargetId != meData.id &&
                    friend.requestTarget.name)
                }`}
                key={friend.id}
              >
                <div className="flex items-center cursor-pointer border border-indigo-400 rounded-3xl p-2 mb-4 h-32">
                  <div className="flex justify-start items-center w-full">
                    <img
                      className="h-16 w-16 rounded-full"
                      src={
                        (friend.requestInitiatorId != meData.id &&
                          friend.requestInitiator.image) ||
                        (friend.requestTargetId != meData.id &&
                          friend.requestTarget.image) ||
                        ""
                      }
                    ></img>
                    <div className="p-4"></div>
                    <div className="flex justify-between w-full items-center">
                      <div className="flex flex-col">
                        <div className="text-left underline">
                          @
                          {(friend.requestInitiatorId != meData.id &&
                            friend.requestInitiator.name) ||
                            (friend.requestTargetId != meData.id &&
                              friend.requestTarget.name)}
                        </div>
                        <div className="text-sm text-left pb-2">
                          {(friend.requestInitiatorId != meData.id &&
                            friend.requestInitiator.firstName) ||
                            (friend.requestTargetId != meData.id &&
                              friend.requestTarget.firstName)}
                        </div>
                        <div className="text-sm text-left text-gray-400">
                          {friend.lastMessage[0]?.body
                            ? friend.lastMessage[0]?.body.length > 23
                              ? friend.lastMessage[0]?.body.substring(0, 23) +
                                "..."
                              : friend.lastMessage[0]?.body
                            : "start a conversation..."}
                        </div>
                      </div>
                      {friend.lastMessage[0]?.timestamp &&
                        (new Date().toDateString() ===
                        friend.lastMessage[0].timestamp.toDateString() ? (
                          <div className="flex flex-col items-center">
                            <div className="pr-1 text-sm pb-1">
                              {friend.lastMessage[0]?.timestamp.getHours()}:
                              {friend.lastMessage[0]?.timestamp.getMinutes()}
                            </div>
                            {friend.numUnseenMsgs > 0 && (
                              <div className="flex items-center justify-center rounded-full bg-red-600 w-6 h-6">
                                {friend.numUnseenMsgs}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <div className="pr-1 text-sm pb-1">
                              {friend.lastMessage[0]?.timestamp
                                .toISOString()
                                .substring(0, 10)}
                            </div>
                            {friend.numUnseenMsgs > 0 && (
                              <div className="flex items-center justify-center rounded-full bg-red-600 w-6 h-6">
                                {friend.numUnseenMsgs}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </NextLink>
            ))}
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <Head>
        <title>Inbox</title>
      </Head>
      <Navbar me={meData}></Navbar>
      Not signed in <br />
      <button onClick={() => signIn("discord")}>Sign in with Discord</button>
    </>
  );
};

export default Home;
