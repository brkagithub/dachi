import type { NextPage } from "next";
import { trpc } from "../utils/trpc";
import { signIn } from "next-auth/react";
import Navbar from "../components/Navbar";
import ProfilePage from "../components/Profile";
import Head from "next/head";

const Explore: NextPage = () => {
  const { data: meData, isLoading } = trpc.useQuery(["user.me"], {
    refetchOnWindowFocus: false,
  });

  const { data: userMatchedData, isLoading: matchIsLoading } = trpc.useQuery([
    "match.getPotentialMatch",
  ]);
  const utils = trpc.useContext();
  const createMatchMutation = trpc.useMutation(["match.createMatch"], {
    onSuccess: () => {
      utils.invalidateQueries(["match.getPotentialMatch"]);
    },
  });

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Find teammates</title>
        </Head>
        <div className="text-center pt-4">loading...</div>
      </>
    );
  }

  if (matchIsLoading) {
    return (
      <>
        <Head>
          <title>Find teammates</title>
        </Head>
        <div className="text-center pt-4">potential match loading...</div>
      </>
    );
  }

  if (userMatchedData && !userMatchedData.user) {
    return (
      <>
        <Head>
          <title>Find teammates</title>
        </Head>
        <Navbar me={meData} />
        <div className="max-w-2xl mx-auto pt-8 pr-4 pl-4 md:pl-2 md:pr-2">
          <h1 className="text-2xl text-indigo-200">
            No more users on the platform left to match.
          </h1>
        </div>
      </>
    );
  }

  if (meData) {
    return (
      <>
        <Head>
          <title>Find teammates</title>
        </Head>
        <Navbar me={meData} />
        {userMatchedData && userMatchedData.user && (
          <ProfilePage
            user={userMatchedData?.user}
            rankedStats={userMatchedData?.rankedStats}
          ></ProfilePage>
        )}
        {userMatchedData && userMatchedData.user && (
          <div className="md:absolute md:bottom-0 md:w-full pb-8">
            <div className="max-w-3xl mx-auto px-2 pt-4 sm:px-6 lg:px-8 flex justify-between">
              <button
                type="button"
                className="border border-sky-100 text-black bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2"
                onClick={() => {
                  if (
                    userMatchedData.user?.id &&
                    !createMatchMutation.isLoading
                  ) {
                    createMatchMutation.mutate({
                      requestInitiatorId: meData.id,
                      requestTargetId: userMatchedData.user.id,
                      addAsFriend: true,
                    });
                  }
                }}
              >
                Add as friend
              </button>
              <button
                type="button"
                className="border border-red-300 text-black bg-red-600 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2"
                onClick={() => {
                  if (
                    userMatchedData.user?.id &&
                    !createMatchMutation.isLoading
                  ) {
                    createMatchMutation.mutate({
                      requestInitiatorId: meData.id,
                      requestTargetId: userMatchedData.user.id,
                      addAsFriend: false,
                    });
                  }
                }}
              >
                Ignore
              </button>
            </div>
          </div>
        )}
      </>
    );
  }
  return (
    <>
      <Head>
        <title>Find teammates</title>
      </Head>
      <Navbar me={meData}></Navbar>
      Not signed in <br />
      <button onClick={() => signIn("discord")}>Sign in with Discord</button>
    </>
  );
};

export default Explore;
