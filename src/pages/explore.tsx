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

  const blockUserMutation = trpc.useMutation(["user.blockUser"], {
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
                disabled={createMatchMutation.isLoading}
                className="disabled:opacity-50 disabled:cursor-auto border border-sky-300 text-black bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-4 focus:ring-green-300 font-medium rounded-full text-sm pt-3 pb-3 pl-4 pr-4 text-center mr-2 mb-2"
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
                {(createMatchMutation.isLoading && (
                  <svg
                    width="44"
                    height="44"
                    viewBox="0 0 44 44"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="#fff"
                  >
                    <g fill="none" fillRule="evenodd" strokeWidth="2">
                      <circle cx="22" cy="22" r="1">
                        <animate
                          attributeName="r"
                          begin="0s"
                          dur="1.8s"
                          values="1; 20"
                          calcMode="spline"
                          keyTimes="0; 1"
                          keySplines="0.165, 0.84, 0.44, 1"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="stroke-opacity"
                          begin="0s"
                          dur="1.8s"
                          values="1; 0"
                          calcMode="spline"
                          keyTimes="0; 1"
                          keySplines="0.3, 0.61, 0.355, 1"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <circle cx="22" cy="22" r="1">
                        <animate
                          attributeName="r"
                          begin="-0.9s"
                          dur="1.8s"
                          values="1; 20"
                          calcMode="spline"
                          keyTimes="0; 1"
                          keySplines="0.165, 0.84, 0.44, 1"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="stroke-opacity"
                          begin="-0.9s"
                          dur="1.8s"
                          values="1; 0"
                          calcMode="spline"
                          keyTimes="0; 1"
                          keySplines="0.3, 0.61, 0.355, 1"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  </svg>
                )) || (
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    ></path>
                  </svg>
                )}
              </button>
              <button
                disabled={blockUserMutation.isLoading}
                className="disabled:opacity-50 disabled:cursor-auto border border-gray-700 text-black bg-gradient-to-r from-red-900 to-red-500 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-red-400 font-medium rounded-full text-sm pt-3 pb-3 pl-4 pr-4 text-center mr-2 mb-2"
                onClick={() => {
                  if (
                    userMatchedData.user?.id &&
                    !createMatchMutation.isLoading
                  ) {
                    blockUserMutation.mutate({
                      blockedId: userMatchedData.user.id,
                    });
                  }
                }}
              >
                {(blockUserMutation.isLoading && (
                  <svg
                    width="44"
                    height="44"
                    viewBox="0 0 44 44"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="#fff"
                  >
                    <g fill="none" fillRule="evenodd" strokeWidth="2">
                      <circle cx="22" cy="22" r="1">
                        <animate
                          attributeName="r"
                          begin="0s"
                          dur="1.8s"
                          values="1; 20"
                          calcMode="spline"
                          keyTimes="0; 1"
                          keySplines="0.165, 0.84, 0.44, 1"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="stroke-opacity"
                          begin="0s"
                          dur="1.8s"
                          values="1; 0"
                          calcMode="spline"
                          keyTimes="0; 1"
                          keySplines="0.3, 0.61, 0.355, 1"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <circle cx="22" cy="22" r="1">
                        <animate
                          attributeName="r"
                          begin="-0.9s"
                          dur="1.8s"
                          values="1; 20"
                          calcMode="spline"
                          keyTimes="0; 1"
                          keySplines="0.165, 0.84, 0.44, 1"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="stroke-opacity"
                          begin="-0.9s"
                          dur="1.8s"
                          values="1; 0"
                          calcMode="spline"
                          keyTimes="0; 1"
                          keySplines="0.3, 0.61, 0.355, 1"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  </svg>
                )) || (
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      strokeWidth="2"
                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                    ></path>
                  </svg>
                )}
              </button>
              <button
                type="button"
                disabled={createMatchMutation.isLoading}
                className="disabled:opacity-50 disabled:cursor-auto border border-red-300 text-black bg-red-600 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm pt-3 pb-3 pl-4 pr-4 text-center mr-2 mb-2"
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
                {(createMatchMutation.isLoading && (
                  <svg
                    width="44"
                    height="44"
                    viewBox="0 0 44 44"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="#fff"
                  >
                    <g fill="none" fillRule="evenodd" strokeWidth="2">
                      <circle cx="22" cy="22" r="1">
                        <animate
                          attributeName="r"
                          begin="0s"
                          dur="1.8s"
                          values="1; 20"
                          calcMode="spline"
                          keyTimes="0; 1"
                          keySplines="0.165, 0.84, 0.44, 1"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="stroke-opacity"
                          begin="0s"
                          dur="1.8s"
                          values="1; 0"
                          calcMode="spline"
                          keyTimes="0; 1"
                          keySplines="0.3, 0.61, 0.355, 1"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <circle cx="22" cy="22" r="1">
                        <animate
                          attributeName="r"
                          begin="-0.9s"
                          dur="1.8s"
                          values="1; 20"
                          calcMode="spline"
                          keyTimes="0; 1"
                          keySplines="0.165, 0.84, 0.44, 1"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="stroke-opacity"
                          begin="-0.9s"
                          dur="1.8s"
                          values="1; 0"
                          calcMode="spline"
                          keyTimes="0; 1"
                          keySplines="0.3, 0.61, 0.355, 1"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  </svg>
                )) || (
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                )}
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
