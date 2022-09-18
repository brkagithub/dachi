import type { NextPage } from "next";
import { trpc } from "../../utils/trpc";
import { signIn, signOut } from "next-auth/react";
import Navbar from "../../components/Navbar";
import NextLink from "next/link";

const Home: NextPage = () => {
  //const hello = trpc.useQuery(["example.hello", { text: "from tRPC" }]);
  const { data: meData, isLoading } = trpc.useQuery(["user.me"], {
    refetchOnWindowFocus: false,
  }); /*const fillDb = trpc.useMutation(["user.fillDb"]);*/
  const { data: friends, isLoading: isLoadingFriends } = trpc.useQuery([
    "match.getFriends",
  ]);
  if (isLoading) {
    return <div className="text-center pt-4">Loading...</div>;
  }

  if (isLoadingFriends) {
    return <div className="text-center pt-4">Loading chats...</div>;
  }

  if (friends && friends.length == 0) {
    return (
      <>
        <Navbar me={meData} />
        <div className="max-w-2xl mx-auto pt-8 pr-4 pl-4 md:pl-2 md:pr-2">
          <h1 className="text-2xl">
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
        <Navbar me={meData}></Navbar>
        <div className="max-w-2xl mx-auto pt-8 pr-4 pl-4 md:pl-2 md:pr-2">
          <h1 className="text-2xl">My chats</h1>
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
                <div className="flex items-center cursor-pointer border rounded-3xl border-gray-400 p-2 mb-4">
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

                        <div className="text-sm text-left">
                          {friend.lastMessage[0]?.body
                            ? friend.lastMessage[0]?.body.length > 23
                              ? friend.lastMessage[0]?.body.substring(0, 23) +
                                "..."
                              : friend.lastMessage[0]?.body
                            : "start a conversation..."}
                        </div>
                      </div>
                      <div className="pr-1 text-sm">
                        {friend.lastMessage[0]?.timestamp
                          .toISOString()
                          .substring(11, 16)}
                      </div>
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
      <Navbar me={meData}></Navbar>
      Not signed in <br />
      <button onClick={() => signIn("discord")}>Sign in with Discord</button>
    </>
  );
};

export default Home;
