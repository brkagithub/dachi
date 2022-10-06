import type { NextPage } from "next";
import { trpc } from "../utils/trpc";
import { signIn } from "next-auth/react";
import Navbar from "../components/Navbar";
import Head from "next/head";
import Image from "next/image";

const HomeComponent = () => {
  return (
    <div className="max-w-7xl mx-auto pt-8 px-2 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="flex flex-col md:flex-row justify-center items-center">
        <img
          className="rounded-2xl border border-indigo-500 order-2 mt-16 md:mt-0"
          src="https://res.cloudinary.com/dhupiskro/image/upload/v1664985776/homepage_profile.png"
        ></img>
        <div className="flex flex-col pt-4 pl-1 pr-1 md:pr-0 md:pt-0 md:pl-12 items-center w-full order-1 md:order-3">
          <div className="text-4xl font-semibold text-left pt-4 md:pt-0">
            Find teammates and make friends anywhere in the world with{" "}
            <span className="text-indigo-500">dachi!</span>
          </div>
          <div className="text-lg text-gray-300 text-left pt-4">
            Set up your profile and your preferences so we can find you a
            suitable gamer buddy to chat and play games with.
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => signIn("discord")}
              className="bg-gradient-to-r from-indigo-900 to-indigo-500 hover:border-2 hover:border-white rounded-full pr-4 pl-4 pt-2 pb-2 text-lg cursor-pointer mt-8 font-semibold"
            >
              Sign up for free
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col pt-16 w-full">
        <div className="text-2xl font-semibold flex justify-center pr-1 pl-1">
          Use our filtering system to find gamers to team up with.
        </div>
        <div className="flex flex-col md:flex-row items-center justify-around pt-4">
          <div className="w-72 flex flex-col items-center pt-8 md:pt-2">
            <Image
              src="https://res.cloudinary.com/dhupiskro/image/upload/v1664986540/homepage_globe.png"
              width={288}
              height={288}
            ></Image>
            <div className="text-2xl font-bold text-indigo-500 pt-1">
              Server
            </div>
            <div className="text-gray-300 text-lg text-center font-semibold">
              Can&apos;t find friends in your region? dachi&apos;s server
              filtering is here for you.
            </div>
          </div>
          <div className="w-72 flex flex-col items-center pt-8 md:pt-2">
            <Image
              src="https://res.cloudinary.com/dhupiskro/image/upload/v1665067163/challenger.png"
              width={288}
              height={288}
            ></Image>
            <div className="text-2xl font-bold text-indigo-500 pt-1">Rank</div>
            <div className="text-gray-300 text-lg text-center font-semibold">
              You&apos;re high elo and need a duo? Need a teammate to get out of
              Gold with?
            </div>
          </div>
          <div className="w-72 flex flex-col items-center pt-4 md:pt-2">
            <div className="p-8">
              <Image
                src="https://res.cloudinary.com/dhupiskro/image/upload/v1664987325/homepage_role.png"
                width={256}
                height={256}
              ></Image>
            </div>
            <div className="text-2xl font-bold text-indigo-500 pt-1">Role</div>
            <div className="text-gray-300 text-lg text-center font-semibold">
              Filter by role to find players that can be the perfect addition to
              your party.
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col pt-16 w-full pb-8">
        <div className="text-2xl font-semibold flex justify-center pr-1 pl-1">
          Agree on when to play and chat with all the gamers you met on dachi!
        </div>
        <div className="flex flex-col md:flex-row w-full justify-center items-center pt-8">
          <div className="flex justify-center pr-0 md:pr-6 order-3 md:order-1">
            <div className="flex flex-col items-center w-full">
              <div className="text-2xl font-bold text-indigo-500 pt-4 md:pt-0">
                Friend requests
              </div>
              <div className="text-gray-300 font-semibold pt-4 text-lg w-72 text-center">
                Check out users that sent you a friend request and decide
                whether you want to chat with them.
              </div>
              <div className="text-2xl font-bold text-indigo-500 pt-8">
                Friend list and chat
              </div>
              <div className="text-gray-300 font-semibold pt-4 text-lg w-72 text-center">
                Choose any of your buddies from your friend list and start a
                conversation with them.
              </div>
              <div className="text-2xl font-bold text-indigo-500 pt-8">
                Online and message status
              </div>
              <div className="text-gray-300 font-semibold pt-4 text-lg w-72 text-center">
                You&apos;ll be able to see when your friends are online and
                whether they&apos;ve received and seen your message.
              </div>
            </div>
          </div>
          <div className="order-2 pr-8 pl-8 pt-4 pb-4">
            <Image
              src="https://res.cloudinary.com/dhupiskro/image/upload/v1664984415/homepage_phone.png"
              width={287}
              height={597}
            ></Image>
          </div>
        </div>
      </div>
    </div>
  );
};

const Home: NextPage = () => {
  //const hello = trpc.useQuery(["example.hello", { text: "from tRPC" }]);
  const { data: meData, isLoading } = trpc.useQuery(["user.me"], {
    refetchOnWindowFocus: false,
  }); /*const fillDb = trpc.useMutation(["user.fillDb"]);*/
  if (isLoading) {
    return <div className="text-center pt-4">Loading...</div>;
  }

  if (meData) {
    return (
      <>
        <Head>
          <title>Getbrka</title>
        </Head>
        <Navbar me={meData}></Navbar>
        <HomeComponent />
      </>
    );
  }
  return (
    <>
      <Head>
        <title>Getbrka</title>
      </Head>
      <Navbar me={meData}></Navbar>
      Not signed in <br />
      <HomeComponent />
    </>
  );
};

export default Home;
