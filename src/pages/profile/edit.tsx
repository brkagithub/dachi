import type { User } from "@prisma/client";
import { GetStaticProps } from "next";
import Navbar from "../../components/Navbar";
import { prisma } from "../../server/db/client";
import { trpc } from "../../utils/trpc";

const EditProfilePage = () => {
  const { data: meData, isLoading } = trpc.useQuery(["user.me"]);

  if (isLoading) {
    return <div>loading...</div>;
  }

  const page = (
    <>
      <Navbar me={meData} />
      {!meData ? (
        <div>You need to log in to edit your profile</div>
      ) : (
        <div>You can edit your profile here</div>
      )}
    </>
  );

  return page;
};

export default EditProfilePage;
