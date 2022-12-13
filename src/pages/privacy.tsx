import type { NextPage } from "next";
import { trpc } from "../utils/trpc";
import { signIn } from "next-auth/react";
import Navbar from "../components/Navbar";
import NextLink from "next/link";
import Head from "next/head";
import ProfileCard from "../components/ProfileCard";

const Requests: NextPage = () => {
  const { data: meData, isLoading } = trpc.useQuery(["user.me"]);
  const { data: blockList, isLoading: isLoadingBlockList } = trpc.useQuery([
    "user.getBlockList",
  ]);

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
          <title>My block list</title>
        </Head>
        <div className="text-center pt-4">loading...</div>
      </>
    );
  }

  if (isLoadingBlockList) {
    return (
      <>
        <Head>
          <title>My block list</title>
        </Head>
        <div className="text-center pt-4">loading block list...</div>
      </>
    );
  }

  if (blockList && blockList.length == 0) {
    return (
      <>
        <Head>
          <title>My block list</title>
        </Head>
        <Navbar me={meData} />
        <div className="max-w-2xl mx-auto pt-8 pr-4 pl-4 md:pl-2 md:pr-2">
          <h1 className="text-2xl text-indigo-200 font-semibold">
            You haven't blocked anyone yet
          </h1>
        </div>
      </>
    );
  }

  if (meData) {
    return (
      <>
        <Head>
          <title>My block list</title>
        </Head>
        <Navbar me={meData} />
        <div className="max-w-2xl mx-auto pt-8 pr-4 pl-4 md:pl-2 md:pr-2">
          <h1 className="text-2xl text-indigo-200 font-semibold">
            My block list
          </h1>
          <div className="pt-4"> </div>
          {blockList?.map((block) => (
            <ProfileCard
              unblockButton={true}
              acceptDecline={false}
              profileInput={block}
              key={block.id}
            ></ProfileCard>
          ))}
        </div>
      </>
    );
  }
  return (
    <>
      <Head>
        <title>My block list</title>
      </Head>
      <Navbar me={meData}></Navbar>
      Not signed in <br />
      <button onClick={() => signIn("discord")}>Sign in with Discord</button>
    </>
  );
};

export default Requests;
