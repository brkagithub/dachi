import type { NextPage } from "next";
import { trpc } from "../utils/trpc";
import { signIn } from "next-auth/react";
import Navbar from "../components/Navbar";
import ProfilePage from "../components/Profile";

const Explore: NextPage = () => {
  const { data: meData, isLoading } = trpc.useQuery(["user.me"], {
    refetchOnWindowFocus: false,
  });

  const { data: userMatchedData, isLoading: matchIsLoading } = trpc.useQuery(
    ["match.getPotentialMatch"],
    {
      refetchOnWindowFocus: false,
    }
  );
  const utils = trpc.useContext();
  const createMatchMutation = trpc.useMutation(["match.createMatch"], {
    onSuccess: () => {
      utils.invalidateQueries(["match.getPotentialMatch"]);
    },
  });

  if (isLoading) {
    return <div className="text-center pt-4">Loading...</div>;
  }

  if (matchIsLoading) {
    return <div className="text-center pt-4">Match loading...</div>;
  }

  if (userMatchedData && !userMatchedData.user) {
    return (
      <>
        <Navbar me={meData} />
        <div>No more users on the platform left to match</div>
      </>
    );
  }

  console.log(userMatchedData);

  if (meData) {
    return (
      <>
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
                className="text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
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
                className="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
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
      <Navbar me={meData}></Navbar>
      Not signed in <br />
      <button onClick={() => signIn("discord")}>Sign in with Discord</button>
    </>
  );
};

export default Explore;
