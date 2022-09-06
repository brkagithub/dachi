import { GetStaticProps } from "next";
import { prisma } from "../../server/db/client";
import ProfilePage from "../components/ProfilePage";

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
