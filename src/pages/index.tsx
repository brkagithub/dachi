import type { NextPage } from "next";
import { trpc } from "../utils/trpc";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import Navbar from "../components/Navbar";

const Home: NextPage = () => {
  //const hello = trpc.useQuery(["example.hello", { text: "from tRPC" }]);
  const { data: meData, isLoading } = trpc.useQuery(["user.me"]);
  /*const fillDb = trpc.useMutation(["user.fillDb"]);*/
  if (isLoading) {
    return <div className="text-center pt-4">Loading...</div>;
  }

  if (meData) {
    return (
      <>
        <Navbar me={meData}></Navbar>
        Signed in as {meData.name} <br />
        <Link href={`/profile/${meData.name}`}>
          <a>My profile</a>
        </Link>
        <br></br>
        <button onClick={() => signOut()}>Sign out</button>
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
