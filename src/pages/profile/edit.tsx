import { useState } from "react";
import Navbar from "../../components/Navbar";
import { trpc } from "../../utils/trpc";
import { SubmitHandler, useForm } from "react-hook-form";
import { LeagueAccount } from "@prisma/client";

const EditProfilePage = () => {
  const { data: meData, isLoading } = trpc.useQuery(
    ["user.meFullInfoWithRiotAccounts"],
    {
      refetchOnWindowFocus: false,
    }
  );

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
              role: meData.role || "Top",
              gender: meData.gender || "Male",
              server: meData.accounts[0]?.server || "euw1",
              ign: meData.accounts[0]?.ign || "",
              twitter: meData.twitter || "",
              instagram: meData.instagram || "",
              twitch: meData.twitch || "",
              youtube: meData.youtube || "",
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
};

function UserEditForm({
  defaultValues,
  accounts,
}: {
  defaultValues: Inputs;
  accounts: LeagueAccount[];
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

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    updateProfileMutation.mutate({
      name: data.name,
      firstName: data.firstName,
      age: parseInt(data.age),
      description: data.description,
      fav_champion1: data.favoriteChampion1,
      fav_champion2: data.favoriteChampion2,
      fav_champion3: data.favoriteChampion3,
      fav_champion1_img:
        allChamps?.filter((champ) => champ.name == data.favoriteChampion1)[0]
          ?.uniqueName || "",
      fav_champion2_img:
        allChamps?.filter((champ) => champ.name == data.favoriteChampion2)[0]
          ?.uniqueName || "",
      fav_champion3_img:
        allChamps?.filter((champ) => champ.name == data.favoriteChampion3)[0]
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
      });
    } else {
      createRiotAccountMutation.mutate({
        server: data.server,
        ign: data.ign,
      });
    }
  };

  if (allChampsLoading) return <div>loading..</div>;

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

      <div className="pt-4" />

      <span className="px-1">Gender</span>
      <select
        className="shadow border rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
        {...register("gender", { required: true })}
      >
        {genders?.map((gender) => (
          <option key={gender} value={gender}>
            {gender}
          </option>
        ))}
      </select>

      <div className="pt-4" />

      <span className="px-1">Favorite champion 1</span>
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
      <div className="pt-4" />
      <span className="px-1">Favorite champion 2</span>
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
      <div className="pt-4" />
      <span className="px-1">Favorite champion 3</span>
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
      <span className="px-1">Main role</span>
      <select
        className="shadow border rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
        {...register("role", { required: true })}
      >
        {roles?.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
      <div className="pt-4" />

      <span className="px-1">Server</span>
      <select
        className="shadow border rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
        {...register("server", { required: true })}
      >
        {servers?.map((server) => (
          <option key={server[0]} value={server[0]}>
            {server[1]}
          </option>
        ))}
      </select>

      <div className="pt-4" />

      <span className="px-1">In game name</span>
      <input
        className="shadow border rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
        {...register("ign")}
      />

      <div className="pt-4" />

      <span className="px-1">Twitter handle</span>
      <input
        className="shadow border rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
        {...register("twitter")}
      />

      <div className="pt-4" />
      <span className="px-1">Instagram handle</span>
      <input
        className="shadow border rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
        {...register("instagram")}
      />

      <div className="pt-4" />
      <span className="px-1">Twitch handle</span>
      <input
        className="shadow border rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
        {...register("twitch")}
      />

      <div className="pt-4" />
      <span className="px-1">Youtube handle</span>
      <input
        className="shadow border rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
        {...register("youtube")}
      />

      <div className="pt-4" />

      <div className="flex flex-col items-center ">
        <input
          className="bg-gray-500 rounded-full p-2 cursor-pointer"
          type="submit"
          value="Confirm changes"
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
