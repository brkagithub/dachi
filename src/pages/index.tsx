import type { NextPage } from "next";
import Head from "next/head";
import { trpc } from "../utils/trpc";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

const Home: NextPage = () => {
  //const hello = trpc.useQuery(["example.hello", { text: "from tRPC" }]);
  const { data: session, status } = useSession();
  if (status === "loading") {
    return <div className="text-center pt-4">Loading...</div>;
  }

  if (session) {
    return (
      <>
        Signed in as {session.user?.email} <br />
        <Link href={`/profile/${session.user?.id}`}>
          <a>My profile</a>
        </Link>
        <br></br>
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }
  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn("discord")}>Sign in with Discord</button>
    </>
  );
};

export default Home;
