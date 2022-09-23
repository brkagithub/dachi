import { LeagueAccount, User } from "@prisma/client";
import { GetStaticProps } from "next";
import Navbar from "../../components/Navbar";
import { prisma } from "../../server/db/client";
import { trpc } from "../../utils/trpc";
import Profile from "../../components/Profile";

const ProfilePage = (props: {
  user: User;
  rankedStats: LeagueAccount | null | undefined;
}) => {
  const { data: meData, isLoading } = trpc.useQuery(["user.me"], {
    refetchOnWindowFocus: false,
  });

  if (!props.user) throw new Error("user doesnt exist");

  if (isLoading) {
    return <div>loading...</div>;
  }

  return (
    <>
      <Navbar me={meData} />
      <Profile
        user={props.user}
        rankedStats={props.rankedStats}
        key={props.user.id}
      />
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (!params || !params.name || typeof params.name !== "string") {
    return {
      notFound: true,
    };
  }

  const userInfo = await prisma.user.findFirst({
    where: { name: { equals: params.name, mode: "insensitive" } },
  });

  const userRiotAccount = await prisma.leagueAccount.findFirst({
    where: { userId: userInfo?.id },
  });

  return {
    props: {
      user: JSON.parse(JSON.stringify(userInfo)),
      rankedStats: userRiotAccount,
    },
    revalidate: 60,
  };
};

export async function getStaticPaths() {
  const users = await prisma.user.findMany();
  const paths = users.map((user) => ({
    params: { name: user.name },
  }));

  return { paths, fallback: "blocking" };
}

export default ProfilePage;
