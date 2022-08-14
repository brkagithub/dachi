import type { User } from "@prisma/client";
import { GetStaticProps } from "next";
import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import { prisma } from "../../server/db/client";
import { trpc } from "../../utils/trpc";
import { useForm } from "react-hook-form";

const EditProfilePage = () => {
  const { data: meData, isLoading } = trpc.useQuery(["user.meFullInfo"]);

  if (isLoading) {
    return <div>loading...</div>;
  }

  const page = (
    <>
      <Navbar
        me={{
          id: meData?.id || "",
          name: meData?.name,
          email: meData?.email,
          image: meData?.image,
        }}
      />
      {!meData ? (
        <div>You need to log in to edit your profile</div>
      ) : (
        <div className="max-w-xl mx-auto px-2 sm:px-6 lg:px-8 flex flex-col items-center">
          <div className="text-center text-2xl">Update your profile here</div>
          <UserEditForm defaultValues={meData} />
        </div>
      )}
    </>
  );

  return page;
};

function UserEditForm({ defaultValues }: { defaultValues: User }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  const onSubmit = (data: any) => console.log(data);

  return (
    <form
      className="w-full shadow-md rounded px-8 pt-6 pb-8 flex-col items-center"
      onSubmit={handleSubmit(onSubmit)}
    >
      <span className="px-1">Name</span>
      <input
        className="shadow border rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
        {...register("name", { required: true })}
      />

      {errors.name && <span>This field is required</span>}

      <div className="pt-4" />

      <span className="px-1">First name</span>
      <input
        className="shadow border rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
        {...register("firstName", { required: true })}
      />

      {errors.firstName && <span>This field is required</span>}

      <div className="pt-4" />

      <span className="px-1">Age</span>
      <input
        className="shadow border rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
        type="number"
        {...register("age", { required: true })}
      />

      {errors.age && <span>This field is required</span>}

      <div className="pt-4" />

      <span className="px-1">Description</span>
      <textarea
        className="shadow border rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
        {...register("description", { required: true })}
      />

      {errors.description && <span>This field is required</span>}

      <div className="pt-4" />
      <input
        className="bg-gray-500 rounded-full p-2 cursor-pointer"
        type="submit"
      />
    </form>
  );
}

export default EditProfilePage;
