import type { User } from "@prisma/client";
import { GetStaticProps } from "next";
import { prisma } from "../../server/db/client";

const ProfilePage = (props: { user: User }) => {
  if (!props.user) throw new Error("user doesnt exist");

  return <div>hello {props.user.name}</div>;
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  console.log(params);
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
