import { useState } from "react";
import Navbar from "../../components/Navbar";
import { trpc } from "../../utils/trpc";
import { SubmitHandler, useForm } from "react-hook-form";
import { LeagueAccount } from "@prisma/client";
import Head from "next/head";
//import cloudinary from "cloudinary";

const EditProfilePage = () => {
  const { data: meData, isLoading } = trpc.useQuery(
    ["user.meFullInfoWithRiotAccounts"],
    {
      refetchOnWindowFocus: false,
    }
  );

  if (isLoading) {
    return (
      <>
        <Head>
          <title>Edit profile</title>
        </Head>
        <div className="text-center pt-4">loading...</div>
      </>
    );
  }

  const page = (
    <>
      <Head>
        <title>Edit profile - {meData?.name}</title>
      </Head>
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
        <div className="max-w-xl mx-auto px-2 sm:px-6 lg:px-8 pt-1 flex flex-col items-center">
          <div className="text-center text-2xl font-semibold pt-2 text-indigo-200">
            Update your profile here
          </div>
          <UserEditForm
            id={meData?.id || ""}
            defaultValues={{
              name: meData.name || "",
              firstName: meData.firstName || "",
              age: meData.age?.toString() || "18",
              description: meData.description || "",
              favoriteChampion1: meData.fav_champion1 || "",
              favoriteChampion2: meData.fav_champion2 || "",
              favoriteChampion3: meData.fav_champion3 || "",
              role: meData.role || "Top",
              gender: meData.gender || "Male",
              server: meData.accounts[0]?.server || "euw1",
              ign: meData.accounts[0]?.ign || "",
              twitter: meData.twitter || "",
              instagram: meData.instagram || "",
              twitch: meData.twitch || "",
              youtube: meData.youtube || "",
              profilePicture: null,
            }}
            accounts={meData.accounts}
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
  role: "Top" | "Jungle" | "Mid" | "ADC" | "Support";
  gender: "Male" | "Female" | "Nonconforming";
  server:
    | "eun1"
    | "euw1"
    | "na1"
    | "la1"
    | "la2"
    | "kr"
    | "jp1"
    | "br1"
    | "oc1"
    | "ru"
    | "tr1";
  ign: string;
  twitter: string;
  instagram: string;
  twitch: string;
  youtube: string;
  profilePicture: FileList | null;
};

function UserEditForm({
  defaultValues,
  accounts,
  id,
}: {
  defaultValues: Inputs;
  accounts: LeagueAccount[];
  id: string;
}) {
  const [mutateErrored, setMutateErrored] = useState(true);
  const { data: allChamps, isLoading: allChampsLoading } = trpc.useQuery(
    ["riot.allChampNames"],
    {
      refetchOnWindowFocus: false,
    }
  );

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

  const createRiotAccountMutation = trpc.useMutation([
    "riot.createRiotAccount",
  ]);

  const updateRiotAccountMutation = trpc.useMutation([
    "riot.updateRiotAccount",
  ]);

  const changeProfilePicURL = trpc.useMutation([
    "user.changeProfilePictureURL",
  ]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (data.profilePicture && data.profilePicture.length > 0) {
      const formData = new FormData();

      //weird error downlevelIteration
      //@ts-ignore
      for (const file of data.profilePicture) {
        formData.append("file", file); //there will be only one
        formData.append("upload_preset", "getbrkauploads");
        formData.append("cloud_name", "dhupiskro");
      }

      /*if (data.profilePicture[0] && data.profilePicture[0].name) {
        cloudinary.v2.uploader.upload(
          data.profilePicture[0]?.name,
          { upload_preset: "my_preset" },
          (error, result) => {
            console.log(result, error);
          }
        );
      }*/

      const dataReturned = await fetch(
        "https://api.cloudinary.com/v1_1/dhupiskro/image/upload",
        {
          method: "POST",
          body: formData,
        }
      ).then((r) => r.json());

      if (dataReturned.secure_url) {
        changeProfilePicURL.mutate({ newUrl: dataReturned.secure_url });
      }
    }

    updateProfileMutation.mutate({
      name: data.name,
      firstName: data.firstName,
      age: parseInt(data.age),
      description: data.description,
      fav_champion1: data.favoriteChampion1,
      fav_champion2: data.favoriteChampion2,
      fav_champion3: data.favoriteChampion3,
      fav_champion1_img:
        allChamps?.find((champ) => champ.name == data.favoriteChampion1)
          ?.uniqueName || "",
      fav_champion2_img:
        allChamps?.find((champ) => champ.name == data.favoriteChampion2)
          ?.uniqueName || "",
      fav_champion3_img:
        allChamps?.find((champ) => champ.name == data.favoriteChampion3)
          ?.uniqueName || "",
      role: data.role,
      gender: data.gender,
      twitter: data.twitter,
      instagram: data.instagram,
      twitch: data.twitch,
      youtube: data.youtube,
    });

    if (accounts.length > 0) {
      updateRiotAccountMutation.mutate({
        server: data.server,
        ign: data.ign,
        userId: id,
      });
    } else {
      createRiotAccountMutation.mutate({
        server: data.server,
        ign: data.ign,
      });
    }
  };

  if (allChampsLoading)
    return <div className="text-center pt-4">loading..</div>;

  const roles = ["Top", "Jungle", "Mid", "ADC", "Support"];
  const genders = ["Male", "Female", "Nonconforming"];
  const servers = [
    ["eun1", "EUNE"],
    ["euw1", "EUW"],
    ["na1", "NA"],
    ["la1", "LAN"],
    ["la2", "LAS"],
    ["kr", "KR"],
    ["jp1", "JP"],
    ["br1", "BR"],
    ["oc1", "OCE"],
    ["ru", "RU"],
    ["tr1", "TR"],
  ];

  return (
    <form
      className="w-full shadow-md rounded px-8 pt-6 pb-8 flex-col items-center"
      onSubmit={handleSubmit(onSubmit)}
    >
      <span className="px-1 text-indigo-400 font-semibold text-lg">Name</span>
      <input
        className="shadow border border-sky-200 rounded-lg w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-900"
        {...register("name", {
          pattern: {
            value: /^[A-Za-z][A-Za-z0-9_]{1,29}$/i,
            message:
              "You need to use a valid username (letters and numbers only)",
          },
          required: true,
          onChange: () => {
            clearErrors("name");
          },
        })}
      />

      {errors.name && errors.name.type !== "checkUsername" && (
        <span className="text-red-400">
          Username needs to start with a letter and have 2+ characters.
        </span>
      )}

      {errors.name && errors.name.type === "checkUsername" && (
        <span className="text-red-400">{errors.name.message}</span>
      )}
      <div className="pt-4" />

      <span className="px-1 text-indigo-400 font-semibold text-lg">
        First name
      </span>
      <input
        className="shadow border border-sky-100 rounded-lg w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-900"
        {...register("firstName", {
          required: true,
        })}
      />

      {errors.firstName && (
        <span className="text-red-400">This field is required</span>
      )}

      <div className="pt-4" />

      <span className="px-1 text-indigo-400 font-semibold text-lg">Age</span>
      <input
        className="shadow border border-sky-100 rounded-lg w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-900"
        type="number"
        {...register("age", { required: true })}
      />

      {errors.age && (
        <span className="text-red-400">This field is required</span>
      )}

      <div className="pt-4" />

      <span className="px-1 text-indigo-400 font-semibold text-lg">
        Description
      </span>
      <textarea
        className="shadow border border-sky-100 rounded-lg w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-900 h-28 md:h-24"
        {...register("description", { required: true })}
      />

      {errors.description && (
        <span className="text-red-400">This field is required</span>
      )}

      <div className="pt-4" />

      <span className="px-1 text-indigo-400 font-semibold text-lg">Gender</span>
      <select
        className="shadow border border-sky-100 rounded-lg w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-900"
        {...register("gender", { required: true })}
      >
        {genders?.map((gender) => (
          <option key={gender} value={gender}>
            {gender}
          </option>
        ))}
      </select>

      <div className="pt-4" />

      <span className="px-1 text-indigo-400 font-semibold text-lg">
        Favorite champion 1
      </span>
      <select
        className="shadow border border-sky-100 rounded-lg w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-900"
        {...register("favoriteChampion1", { required: true })}
      >
        {allChamps?.map((champ) => (
          <option key={champ.id} value={champ.name}>
            {champ.name}
          </option>
        ))}
      </select>
      <div className="pt-4" />
      <span className="px-1 text-indigo-400 font-semibold text-lg">
        Favorite champion 2
      </span>
      <select
        className="shadow border border-sky-100 rounded-lg w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-900"
        {...register("favoriteChampion2", { required: true })}
      >
        {allChamps?.map((champ) => (
          <option key={champ.id} value={champ.name}>
            {champ.name}
          </option>
        ))}
      </select>
      <div className="pt-4" />
      <span className="px-1 text-indigo-400 font-semibold text-lg">
        Favorite champion 3
      </span>
      <select
        className="shadow border border-sky-100 rounded-lg w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-900"
        {...register("favoriteChampion3", { required: true })}
      >
        {allChamps?.map((champ) => (
          <option key={champ.id} value={champ.name}>
            {champ.name}
          </option>
        ))}
      </select>
      <div className="pt-4" />
      <span className="px-1 text-indigo-400 font-semibold text-lg">
        Main role
      </span>
      <select
        className="shadow border border-sky-100 rounded-lg w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-900"
        {...register("role", { required: true })}
      >
        {roles?.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
      <div className="pt-4" />

      <span className="px-1 text-indigo-400 font-semibold text-lg">Server</span>
      <select
        className="shadow border border-sky-100 rounded-lg w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-900"
        {...register("server", { required: true })}
      >
        {servers?.map((server) => (
          <option key={server[0]} value={server[0]}>
            {server[1]}
          </option>
        ))}
      </select>

      <div className="pt-4" />

      <span className="px-1 text-indigo-400 font-semibold text-lg">
        In game name
      </span>
      <input
        className="shadow border border-sky-100 rounded-lg w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-900"
        {...register("ign")}
      />

      <div className="pt-4" />

      <span className="px-1 text-indigo-400 font-semibold text-lg">
        Twitter handle
      </span>
      <input
        className="shadow border border-sky-100 rounded-lg w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-900"
        {...register("twitter")}
      />

      <div className="pt-4" />
      <span className="px-1 text-indigo-400 font-semibold text-lg">
        Instagram handle
      </span>
      <input
        className="shadow border border-sky-100 rounded-lg w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-900"
        {...register("instagram")}
      />

      <div className="pt-4" />
      <span className="px-1 text-indigo-400 font-semibold text-lg">
        Twitch handle
      </span>
      <input
        className="shadow border border-sky-100 rounded-lg w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-900"
        {...register("twitch")}
      />

      <div className="pt-4" />
      <span className="px-1 text-indigo-400 font-semibold text-lg">
        Youtube handle
      </span>
      <input
        className="shadow border border-sky-100 rounded-lg w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-900"
        {...register("youtube")}
      />

      <div className="pt-4" />
      <span className="px-1 text-indigo-400 font-semibold text-lg">
        Profile picture
      </span>

      <input
        type="file"
        className="block w-full text-indigo-300 bg-gray-900 rounded-lg border border-sky-100 cursor-pointer file:bg-indigo-300 file:border-0 file:p-1 file:text-gray-900 file:cursor-pointer"
        {...register("profilePicture")}
      />

      <div className="pt-4" />

      <div className="flex flex-col items-center ">
        <input
          className="disabled:opacity-50 disabled:cursor-auto bg-gray-900 rounded-full pt-2 pb-2 pr-4 pl-4 cursor-pointer text-lg font-bold border border-sky-100"
          type="submit"
          value="Confirm changes"
          disabled={updateProfileMutation.isLoading}
        />
        {formState.isSubmitSuccessful && !mutateErrored ? (
          <div className=" text-green-400">
            Your profile will be updated in 60 seconds!
          </div>
        ) : (
          <></>
        )}
      </div>
    </form>
  );
}

export default EditProfilePage;
