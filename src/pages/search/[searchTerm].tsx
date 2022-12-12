import type { NextPage } from "next";
import { signIn } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import Navbar from "../../components/Navbar";
import ProfileCard from "../../components/ProfileCard";
import { trpc } from "../../utils/trpc";

const Search: NextPage = () => {
  const { query } = useRouter();

  const { data: meData, isLoading: isLoadingMe } = trpc.useQuery(["user.me"], {
    refetchOnWindowFocus: false,
  });

  const {
    data: users,
    fetchNextPage,
    hasNextPage,
    isLoading: isLoadingSearch,
    isFetchingNextPage,
  } = trpc.useInfiniteQuery(
    [
      "user.searchUsers",
      {
        limit: 20,
        searchTerm:
          query.searchTerm && typeof query.searchTerm == "string"
            ? query.searchTerm
            : "",
      },
    ],
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchOnWindowFocus: false,
    }
  );

  if (!query.searchTerm || typeof query.searchTerm !== "string") {
    return (
      <>
        <Head>
          <title>Search</title>
        </Head>
        <div className="text-center pt-4">Cannot search by that term.</div>
      </>
    );
  }

  if (isLoadingMe || isLoadingSearch) {
    return (
      <>
        <Head>
          <title>Search</title>
        </Head>
        <div className="text-center pt-4">Loading...</div>
      </>
    );
  }

  if (users) {
    let flattenedUsers = users.pages.map((p) => p.users).flat();
    return (
      <>
        <Head>
          <title>Search</title>
        </Head>
        <Navbar me={meData} />
        <div className="max-w-xl mx-auto pt-8 pr-4 pl-4 md:pl-2 md:pr-2">
          {flattenedUsers.map((u) => {
            return (
              <ProfileCard acceptDecline={false} profileInput={u}></ProfileCard>
            );
          })}
          <div className="p-2"></div>
          {hasNextPage && (
            <div className="flex justify-center">
              <button
                disabled={isFetchingNextPage || isLoadingSearch}
                className="disabled:opacity-50 bg-gradient-to-r from-indigo-500 to-indigo-900 hover:outline hover:outline-2 hover:outline-white rounded-full pr-4 pl-4 pt-2 pb-2 text-lg cursor-pointer font-semibold"
                onClick={() => {
                  fetchNextPage();
                  console.log(flattenedUsers);
                }}
              >
                Show more
              </button>
            </div>
          )}
        </div>
      </>
    );
  } else {
    <>
      <Head>
        <title>Search</title>
      </Head>
      <Navbar me={meData} />
      <div>Something went wrong...</div>;
    </>;
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

export default Search;
