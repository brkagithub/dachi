import type { NextPage } from "next";
import { trpc } from "../utils/trpc";
import { signIn } from "next-auth/react";
import Navbar from "../components/Navbar";
import NextLink from "next/link";
import Head from "next/head";

const Requests: NextPage = () => {
  const { data: meData, isLoading } = trpc.useQuery(["user.me"]);
  const { data: friendsRequests, isLoading: isLoadingRequests } = trpc.useQuery(
    ["match.getFriendRequests"]
  );

  const acceptFriendReqMutation = trpc.useMutation(["match.acceptFriendReq"], {
    onSuccess: () => {
      utils.invalidateQueries(["match.getFriendRequests"]);
    },
  });
  const declineFriendReqMutation = trpc.useMutation(
    ["match.declineFriendReq"],
    {
      onSuccess: () => {
        utils.invalidateQueries(["match.getFriendRequests"]);
      },
    }
  );

  const utils = trpc.useContext();

  if (isLoading) {
    return (
      <>
        <Head>
          <title>My requests</title>
        </Head>
        <div className="text-center pt-4">loading...</div>
      </>
    );
  }

  if (isLoadingRequests) {
    return (
      <>
        <Head>
          <title>My requests</title>
        </Head>
        <div className="text-center pt-4">loading requests...</div>
      </>
    );
  }

  if (friendsRequests && friendsRequests.length == 0) {
    return (
      <>
        <Head>
          <title>My requests</title>
        </Head>
        <Navbar me={meData} />
        <div className="max-w-2xl mx-auto pt-8 pr-4 pl-4 md:pl-2 md:pr-2">
          <h1 className="text-2xl text-indigo-200 font-semibold">
            You have no friend requests right now
          </h1>
        </div>
      </>
    );
  }

  if (meData) {
    return (
      <>
        <Head>
          <title>My requests</title>
        </Head>
        <Navbar me={meData} />
        <div className="max-w-2xl mx-auto pt-8 pr-4 pl-4 md:pl-2 md:pr-2">
          <h1 className="text-2xl text-indigo-200 font-semibold">
            My friend requests
          </h1>
          <div className="mx-auto pt-4">
            {friendsRequests?.map((req) => (
              <div
                className="flex justify-between items-center border rounded-3xl border-indigo-400 p-2 mb-4"
                key={req.id}
              >
                <div className="flex justify-start items-center">
                  <NextLink href={`profile/${req.requestInitiator.name}`}>
                    <img
                      className="h-16 w-16 rounded-full cursor-pointer"
                      src={req.requestInitiator.image || ""}
                    ></img>
                  </NextLink>
                  <div className="p-4"></div>
                  <div className="flex flex-col">
                    <NextLink href={`profile/${req.requestInitiator.name}`}>
                      <div className="underline cursor-pointer text-center md:text-left">
                        @{req.requestInitiator.name}
                      </div>
                    </NextLink>

                    <div className="text-sm text-center md:text-left">
                      {req.requestInitiator.firstName}
                    </div>
                    <div className="flex md:items-center flex-col md:flex-row">
                      {req.requestInitiator.tier && (
                        <div className="bg-gray-800 mt-2 pt-1 pb-1 pr-2 pl-2 rounded-lg text-sm mr-2 capitalize text-center md:text-left">
                          {req.requestInitiator.tier.toLowerCase()}
                        </div>
                      )}
                      {req.requestInitiator.role && (
                        <>
                          <div className="bg-gray-800 mt-2 pt-1 pb-1 pr-2 pl-2 rounded-lg text-sm mr-2 text-center md:text-left">
                            {req.requestInitiator.role}
                          </div>
                        </>
                      )}
                      {req.requestInitiator.fav_champion1 && (
                        <div className="bg-gray-800 mt-2 pt-1 pb-1 pr-2 pl-2 rounded-lg text-sm mr-2 text-center md:text-left">
                          {req.requestInitiator.fav_champion1}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end items-center">
                  <div className="flex flex-col p-2 text-center">
                    <div className="text-center"></div>
                    <div>
                      <button
                        onClick={() => {
                          if (
                            req.requestInitiator.id &&
                            !acceptFriendReqMutation.isLoading
                          ) {
                            acceptFriendReqMutation.mutate({
                              requestInitiatorId: req.requestInitiator.id,
                              requestTargetId: meData.id,
                            });
                          }
                        }}
                        type="button"
                        className="text-indigo-400 border border-indigo-400 hover:bg-green-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-green-700 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center"
                      >
                        <svg
                          aria-hidden="true"
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="sr-only">Accept</span>
                      </button>
                    </div>
                    <div className="text-center">accept</div>
                  </div>
                  <div className="flex flex-col pt-2 pl-2 pb-2 text-center">
                    <div>
                      <button
                        onClick={() => {
                          if (
                            req.requestInitiator.id &&
                            !acceptFriendReqMutation.isLoading
                          ) {
                            declineFriendReqMutation.mutate({
                              requestInitiatorId: req.requestInitiator.id,
                              requestTargetId: meData.id,
                            });
                          }
                        }}
                        type="button"
                        className="text-indigo-400 border border-indigo-400 hover:bg-red-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-red-700 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center"
                      >
                        <svg
                          aria-hidden="true"
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="sr-only">Decline</span>
                      </button>
                    </div>
                    <div className="text-center">decline</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <Head>
        <title>My requests</title>
      </Head>
      <Navbar me={meData}></Navbar>
      Not signed in <br />
      <button onClick={() => signIn("discord")}>Sign in with Discord</button>
    </>
  );
};

export default Requests;
