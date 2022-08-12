import type { User } from "@prisma/client";
import { GetStaticProps } from "next";
import { prisma } from "../../server/db/client";
import NextLink from "next/link";
import { trpc } from "../../utils/trpc";
import Navbar from "../../components/Navbar";

const ProfilePage = (props: { user: User }) => {
  const { data: meData, isLoading } = trpc.useQuery(["user.me"]);

  if (!props.user) throw new Error("user doesnt exist");

  if (isLoading) {
    return <div>loading...</div>;
  }

  return (
    <>
      <Navbar me={meData} />
      <div>{props.user.name}'s profile</div>
      {meData && meData?.id ? (
        <NextLink href="/profile/edit">Edit your profile here</NextLink>
      ) : (
        <></>
      )}
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (!params || !params.id || typeof params.id !== "string") {
    return {
      notFound: true,
    };
  }

  const userInfo = await prisma.user.findFirst({
    where: { id: { equals: params.id } },
  });

  return {
    props: { user: JSON.parse(JSON.stringify(userInfo)) },
    revalidate: 60,
  };
};

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export default ProfilePage;
