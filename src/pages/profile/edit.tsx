import { useState } from "react";
import Navbar from "../../components/Navbar";
import { trpc } from "../../utils/trpc";
import { SubmitHandler, useForm } from "react-hook-form";

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
          <UserEditForm
            defaultValues={{
              name: meData.name || "",
              firstName: meData.firstName || "",
              age: meData.age?.toString() || "18",
              description: meData.description || "",
              favoriteChampion1: meData.fav_champion1 || "",
              favoriteChampion2: meData.fav_champion2 || "",
              favoriteChampion3: meData.fav_champion3 || "",
            }}
          />
        </div>
      )}
    </>
  );

  return page;
};

type Inputs = {
  name: string;
  firstName: string;
  age: string;
  description: string;
  favoriteChampion1: string;
  favoriteChampion2: string;
  favoriteChampion3: string;
};

function UserEditForm({ defaultValues }: { defaultValues: Inputs }) {
  const [mutateErrored, setMutateErrored] = useState(true);
  const { data: allChamps, isLoading: allChampsLoading } = trpc.useQuery([
    "riot.allChampNames",
  ]);

  const {
    formState,
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm({
    defaultValues,
  });

  const updateProfileMutation = trpc.useMutation(["user.updateProfile"], {
    onSuccess: () => {
      setMutateErrored(false);
    },
    onError: () => {
      setError(
        "name",
        {
          type: "checkUsername",
          message: "You have to choose a unique username",
        },
        { shouldFocus: true }
      );
      setMutateErrored(true);
    },
  });

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    updateProfileMutation.mutate({
      name: data.name,
      firstName: data.firstName,
      age: parseInt(data.age),
      description: data.description,
      fav_champion1: data.favoriteChampion1,
      fav_champion2: data.favoriteChampion2,
      fav_champion3: data.favoriteChampion3,
    });
  };

  if (allChampsLoading) return <div>loading..</div>;

  return (
    <form
      className="w-full shadow-md rounded px-8 pt-6 pb-8 flex-col items-center"
      onSubmit={handleSubmit(onSubmit)}
    >
      <span className="px-1">Name</span>
      <input
        className="shadow border rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
        {...register("name", {
          required: true,
          onChange: () => {
            clearErrors("name");
          },
        })}
      />

      {errors.name && errors.name.type !== "checkUsername" && (
        <span>This field is required</span>
      )}
      {errors.name && errors.name.type === "checkUsername" && (
        <span>{errors.name.message}</span>
      )}
      <div className="pt-4" />

      <span className="px-1">First name</span>
      <input
        className="shadow border rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
        {...register("firstName", {
          required: true,
        })}
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

      <span className="px-1">Favorite champion1</span>
      <select
        className="shadow border rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
        {...register("favoriteChampion1", { required: true })}
      >
        {allChamps?.map((champ) => (
          <option key={champ.id} value={champ.name}>
            {champ.name}
          </option>
        ))}
      </select>

      <span className="px-1">Favorite champion2</span>
      <select
        className="shadow border rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
        {...register("favoriteChampion2", { required: true })}
      >
        {allChamps?.map((champ) => (
          <option key={champ.id} value={champ.name}>
            {champ.name}
          </option>
        ))}
      </select>

      <span className="px-1">Favorite champion3</span>
      <select
        className="shadow border rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
        {...register("favoriteChampion3", { required: true })}
      >
        {allChamps?.map((champ) => (
          <option key={champ.id} value={champ.name}>
            {champ.name}
          </option>
        ))}
      </select>

      <div className="pt-4" />
      <div className="flex flex-col items-center ">
        <input
          className="bg-gray-500 rounded-full p-2 cursor-pointer"
          type="submit"
          value="Confirm changes"
        />
        {formState.isSubmitSuccessful && !mutateErrored ? (
          <div className=" text-green-400">
            Your profile has been successfully updated!
          </div>
        ) : (
          <></>
        )}
      </div>
    </form>
  );
}

export default EditProfilePage;
