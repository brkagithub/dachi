import type { NextPage } from "next";
import { trpc } from "../utils/trpc";
import { signIn } from "next-auth/react";
import Navbar from "../components/Navbar";
import ProfilePage from "../components/Profile";

const Requests: NextPage = () => {
  const { data: meData, isLoading } = trpc.useQuery(["user.me"]);
  const { data: friendsRequests, isLoading: isLoadingRequests } = trpc.useQuery(
    ["match.getFriendRequests"]
  );

  if (isLoading) {
    return <div className="text-center pt-4">Loading...</div>;
  }

  if (isLoadingRequests) {
    return <div className="text-center pt-4">Loading requests...</div>;
  }

  if (meData) {
    return (
      <>
        <Navbar me={meData} />
        {friendsRequests?.map((req) => (
          <div>{req.requestInitiator.name}</div>
        ))}
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

export default Requests;
