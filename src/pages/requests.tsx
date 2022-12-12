import type { NextPage } from "next";
import { trpc } from "../utils/trpc";
import { signIn } from "next-auth/react";
import Navbar from "../components/Navbar";
import NextLink from "next/link";
import Head from "next/head";
import ProfileCard from "../components/ProfileCard";

const Requests: NextPage = () => {
  const { data: meData, isLoading } = trpc.useQuery(["user.me"]);
  const { data: friendsRequests, isLoading: isLoadingRequests } = trpc.useQuery(
    ["match.getFriendRequests"]
  );

  // const acceptFriendReqMutation = trpc.useMutation(["match.acceptFriendReq"], {
  //   onSuccess: () => {
  //     utils.invalidateQueries(["match.getFriendRequests"]);
  //   },
  // });
  // const declineFriendReqMutation = trpc.useMutation(
  //   ["match.declineFriendReq"],
  //   {
  //     onSuccess: () => {
  //       utils.invalidateQueries(["match.getFriendRequests"]);
  //     },
  //   }
  // );

  // const utils = trpc.useContext();

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
          <div className="pt-4"> </div>
          {friendsRequests?.map((req) => (
            <ProfileCard
              acceptDecline={true}
              profileInput={req.requestInitiator}
              key={req.id}
            ></ProfileCard>
          ))}
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
