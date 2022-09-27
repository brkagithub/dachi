import { useState } from "react";
import Navbar from "../components/Navbar";
import { trpc } from "../utils/trpc";
import { SubmitHandler, useForm } from "react-hook-form";
import { LeagueAccount } from "@prisma/client";
//import cloudinary from "cloudinary";

const SettingsPage = () => {
  const { data: meData, isLoading } = trpc.useQuery(["user.me"]);

  const { data: myFilter, isLoading: isLoadingFilter } = trpc.useQuery(
    ["user.getFilterForUser"],
    {
      refetchOnWindowFocus: false,
    }
  );

  if (isLoading || isLoadingFilter) {
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
        <div>You need to log in to edit your filters</div>
      ) : (
        <div className="max-w-xl mx-auto px-2 sm:px-6 lg:px-8 pt-1 flex flex-col items-center">
          <div className="text-center text-2xl font-semibold pt-2 text-indigo-200">
            Update your filters here
          </div>
          <FilterEditForm
            defaultValues={{
              ageUpper: myFilter?.ageUpperLimit || 50,
              ageLower: myFilter?.ageLowerLimit || 14,
              genders: myFilter?.genders || [],
              roles: myFilter?.roles || [],
              servers: myFilter?.servers || [],
              tiers: myFilter?.tiers || [],
            }}
          />
        </div>
      )}
    </>
  );

  return page;
};

type Inputs = {
  ageUpper: number;
  ageLower: number;
  roles: ("Top" | "Jungle" | "Mid" | "ADC" | "Support")[];
  genders: ("Male" | "Female" | "Nonconforming")[];
  servers: (
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
    | "tr1"
  )[];
  tiers: (
    | "CHALLENGER"
    | "GRANDMASTER"
    | "MASTER"
    | "DIAMOND"
    | "PLATINUM"
    | "GOLD"
    | "SILVER"
    | "BRONZE"
    | "IRON"
  )[];
};

function FilterEditForm({ defaultValues }: { defaultValues: Inputs }) {
  const {
    formState,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  const updateFilterMutation = trpc.useMutation(["user.updateFilterForUser"]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log(data);

    updateFilterMutation.mutate({
      ageLowerLimit: data.ageLower,
      ageUpperLimit: data.ageUpper,
      genders: data.genders,
      roles: data.roles,
      servers: data.servers,
      tiers: data.tiers,
    });
  };

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

  const tiers = [
    "CHALLENGER",
    "GRANDMASTER",
    "MASTER",
    "DIAMOND",
    "PLATINUM",
    "GOLD",
    "SILVER",
    "BRONZE",
    "IRON",
  ];
  return (
    <form
      className="w-full shadow-md rounded px-8 pt-6 pb-8 flex-col items-center"
      onSubmit={handleSubmit(onSubmit)}
    >
      <>
        <span className="px-1 text-indigo-400 font-semibold text-lg">
          Age lower limit
        </span>
        <input
          className="shadow border border-sky-200 rounded-lg w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-900"
          type="number"
          {...register("ageLower", { required: true })}
        />

        {errors.ageLower && <span>This field is required</span>}

        <div className="pt-4" />

        <span className="px-1 text-indigo-400 font-semibold text-lg">
          Age upper limit
        </span>
        <input
          className="shadow border border-sky-200 rounded-lg w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-900"
          type="number"
          {...register("ageUpper", { required: true })}
        />

        {errors.ageUpper && <span>This field is required</span>}

        <div className="pt-4" />

        <div className="px-1 text-indigo-400 font-semibold text-lg pb-2 pt-2">
          Role
        </div>

        {roles?.map((role) => {
          return (
            <div
              className="flex justify-between hover:bg-indigo-900 pr-1"
              key={role}
            >
              <label htmlFor={role} className="w-full">
                <div className="flex">
                  <img
                    className="h-8 w-auto rounded-full "
                    src={`https://raw.githubusercontent.com/esports-bits/lol_images/master/role_lane_icons/${
                      role == "Mid" ? "MIDDLE" : role.toLocaleUpperCase()
                    }.png`}
                  ></img>
                  <div className="pl-3 capitalize flex items-center">
                    {role}
                  </div>
                </div>
              </label>
              <input
                {...register("roles")}
                name="roles"
                id={role}
                type="checkbox"
                value={role}
              ></input>
            </div>
          );
        })}

        <div className="pt-4" />

        <div className="px-1 text-indigo-400 font-semibold text-lg pb-2 pt-2">
          Gender
        </div>

        {genders?.map((gender) => {
          return (
            <div
              className="flex justify-between hover:bg-indigo-900 pr-1"
              key={gender}
            >
              <label htmlFor={gender} className="px-1 w-full">
                {gender}
              </label>
              <input
                {...register("genders")}
                id={gender}
                name="genders"
                type="checkbox"
                value={gender}
              ></input>
            </div>
          );
        })}

        <div className="pt-4" />

        <div className="px-1 text-indigo-400 font-semibold text-lg pb-2 pt-2">
          Server
        </div>

        {servers?.map((server) => {
          return (
            <div
              className="flex justify-between hover:bg-indigo-900 pr-1"
              key={server[1]}
            >
              <label htmlFor={server[1]} className="px-1 w-full">
                {server[1]}
              </label>
              <input
                {...register("servers")}
                name="servers"
                id={server[1]}
                type="checkbox"
                value={server[0]}
              ></input>
            </div>
          );
        })}

        <div className="pt-4" />

        <div className="px-1 text-indigo-400 font-semibold text-lg pb-2 pt-2">
          Tier
        </div>

        {tiers?.map((tier) => {
          return (
            <div
              className="flex justify-between items-center hover:bg-indigo-900 pr-1"
              key={tier}
            >
              <label htmlFor={tier} className="w-full">
                <div className="flex">
                  <img
                    className="h-12 w-auto rounded-full"
                    src={`https://opgg-static.akamaized.net/images/medals_new/${tier?.toLowerCase()}.png`}
                  ></img>
                  <div className="pl-3 capitalize flex items-center">
                    {tier.toLowerCase()}
                  </div>
                </div>
              </label>
              <input
                {...register("tiers")}
                name="tiers"
                id={tier}
                type="checkbox"
                value={tier}
              ></input>
            </div>
          );
        })}

        <div className="flex flex-col items-center ">
          <input
            className="bg-gray-500 rounded-full p-2 cursor-pointer"
            type="submit"
            value="Confirm changes"
          />
          {formState.isSubmitSuccessful ? (
            <div className=" text-green-400">
              Your filters will be updated in 60 seconds!
            </div>
          ) : (
            <></>
          )}
        </div>
      </>
    </form>
  );
}

export default SettingsPage;
