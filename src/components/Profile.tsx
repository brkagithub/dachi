import type { LeagueAccount, User } from "@prisma/client";
import NextLink from "next/link";
import { trpc } from "../utils/trpc";
import { flag } from "country-emoji";
import { SocialIcon } from "react-social-icons";

const Profile = (props: {
  user: User;
  rankedStats: LeagueAccount | null | undefined;
}) => {
  const { data: meData, isLoading } = trpc.useQuery(["user.me"]);
  const { data: isBlocked, isLoading: isLoadingBlock } = trpc.useQuery(
    ["user.isBlocked", { blockedId: props.user.id }],
    {
      refetchOnWindowFocus: false,
    }
  );
  const updateRiotAccountMutation = trpc.useMutation([
    "riot.updateRiotAccount",
  ]);

  if (isLoading || isLoadingBlock) {
    return <div className="text-center pt-4">loading...</div>;
  }

  if (isBlocked) {
    return (
      <div className="text-center text-2xl font-semibold pt-2 text-indigo-200">
        User is blocked or has blocked you, you cant see their profile.
      </div>
    );
  }

  let userRole = "";
  if (props.user.role == "Top") userRole = "TOP";
  if (props.user.role == "Jungle") userRole = "JUNGLE";
  if (props.user.role == "Mid") userRole = "MIDDLE";
  if (props.user.role == "ADC") userRole = "ADC";
  if (props.user.role == "Support") userRole = "SUPPORT";

  const serverMap = new Map<string, string>([
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
  ]);

  return (
    <>
      <div className="bg-gradient-to-r from-indigo-800 via-violet-500 to-gray-300 w-full h-36 md:h-48"></div>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="w-full flex flex-col md:flex-row md:justify-center">
          <div className="order-3 md:order-1 w-full md:w-2/5">
            <div className="w-full -mt-10 md:-mt-0 pt-2 md:pr-16">
              <div className="flex justify-around md:justify-between">
                <div className="capitalize">
                  {props.user.firstName}, {props.user.age}
                </div>
                <div className="capitalize">
                  {props.user.country} {flag(props.user.country || "")}
                </div>
                {props.user.gender == "Nonconforming" ? (
                  ""
                ) : (
                  <div className="capitalize">{props.user.gender}</div>
                )}
              </div>
              <div className="pt-4 pr-2 pl-2 md:pt-2 md:pr-0 md:pl-0 text-justify">
                {props.user.description}
              </div>
            </div>
          </div>
          <div className="flex flex-col order-2 items-center">
            {props.user.image && (
              <img
                className="h-36 w-36 rounded-full relative bottom-16 border-4 border-blue-700"
                src={props.user.image}
              ></img>
            )}
            <div className="text-xl text-center relative bottom-16 font-semibold">
              {props.user.name}
            </div>
            <div className="flex w-36 h-auto justify-center relative bottom-16 pt-1 pb-1">
              {props.user.twitter ? (
                <div className="pr-1 pl-1">
                  <SocialIcon
                    style={{ height: 32, width: 32 }}
                    url={`https://twitter.com/${props.user.twitter}`}
                  />
                </div>
              ) : (
                <></>
              )}
              {props.user.instagram ? (
                <div className="pr-1 pl-1">
                  <SocialIcon
                    style={{ height: 32, width: 32 }}
                    url={`https://instagram.com/${props.user.instagram}`}
                  />
                </div>
              ) : (
                <></>
              )}
              {props.user.twitch ? (
                <div className="pr-1 pl-1">
                  <SocialIcon
                    style={{ height: 32, width: 32 }}
                    url={`https://twitch.tv/${props.user.twitch}`}
                  />
                </div>
              ) : (
                <></>
              )}
              {props.user.youtube ? (
                <div className="pr-1 pl-1">
                  <SocialIcon
                    style={{ height: 32, width: 32 }}
                    url={`https://www.youtube.com/@${props.user.youtube}`}
                  />
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
          <div className="order-3 w-full md:w-2/5 flex justify-center md:justify-around pt-4 pb-4 md:pb-0 md:pt-2 md:pl-8">
            {props.user.role && (
              <div>
                <img
                  className="h-16 w-16 rounded-full"
                  src={`https://raw.githubusercontent.com/esports-bits/lol_images/master/role_lane_icons/${userRole}.png`}
                ></img>
                <div className="text-center capitalize">{props.user.role}</div>
              </div>
            )}
            <div className="p-1"></div>
            {props.user.fav_champion1 && (
              <div className="w-24 h-24">
                <div className="flex justify-center">
                  <img
                    className="h-16 w-16 rounded-full"
                    src={`http://ddragon.leagueoflegends.com/cdn/12.15.1/img/champion/${props.user.fav_champion1_img}.png`}
                  ></img>
                </div>
                <div className="text-center capitalize">
                  {props.user.fav_champion1}
                </div>
              </div>
            )}

            <div className="p-1"></div>
            {props.user.fav_champion2 && (
              <div className="w-24 h-24">
                <div className="flex justify-center">
                  <img
                    className="h-16 w-16 rounded-full"
                    src={`http://ddragon.leagueoflegends.com/cdn/12.15.1/img/champion/${props.user.fav_champion2_img}.png`}
                  ></img>
                </div>
                <div className="text-center capitalize">
                  {props.user.fav_champion2}
                </div>
              </div>
            )}
            <div className="p-1"></div>
            {props.user.fav_champion3 && (
              <div className="w-24 h-24">
                <div className="flex justify-center">
                  <img
                    className="h-16 w-16 rounded-full"
                    src={`http://ddragon.leagueoflegends.com/cdn/12.15.1/img/champion/${props.user.fav_champion3_img}.png`}
                  ></img>
                </div>
                <div className="text-center capitalize">
                  {props.user.fav_champion3}
                </div>
              </div>
            )}
          </div>
        </div>
        {props.rankedStats &&
          props.rankedStats.wins &&
          props.rankedStats.losses && (
            <>
              <div className="bg-gray-800 rounded-2xl p-1 flex flex-col items-center mt-2 md:mt-0">
                <div className="text-xl text-center pt-6 md:pt-2 md:pb-2">
                  <a
                    className="cursor-pointer underline underline-offset-4"
                    href={`https://${serverMap.get(
                      props.rankedStats.server ? props.rankedStats.server : ""
                    )}.op.gg/summoners/${serverMap.get(
                      props.rankedStats.server ? props.rankedStats.server : ""
                    )}/${props.rankedStats.ign}`}
                  >
                    {props.rankedStats.ign}{" "}
                    {`(${serverMap.get(
                      props.rankedStats.server ? props.rankedStats.server : ""
                    )})`}
                  </a>
                </div>
                <div className="flex justify-between items-center">
                  <img
                    className="h-36 w-auto rounded-full"
                    src={`https://opgg-static.akamaized.net/images/medals_new/${props.rankedStats.tier?.toLowerCase()}.png`}
                  ></img>
                  <div className="flex flex-col items-center">
                    <div className="font-bold text-center">
                      <span className="capitalize">
                        {props.rankedStats.tier?.toLowerCase()}
                      </span>
                      <span> {props.rankedStats.rank}</span>
                    </div>
                    <div className="text-sm">
                      {props.rankedStats.leaguePoints} LP
                    </div>
                  </div>
                  <div className="pl-8 pr-4 flex flex-col items-center">
                    <div className="text-sm">
                      {props.rankedStats.wins}W {props.rankedStats.losses}L
                    </div>
                    <div className="text-xs">
                      {(
                        (props.rankedStats.wins /
                          (props.rankedStats.wins + props.rankedStats.losses)) *
                        100
                      ).toFixed(0)}
                      %
                    </div>
                  </div>
                </div>
                <button
                  className="bg-gradient-to-r from-indigo-900 to-indigo-500 hover:border-2 hover:border-white rounded-full pr-4 pl-4 pt-2 pb-2 text-lg cursor-pointer font-semibold"
                  onClick={() => {
                    if (props.rankedStats?.ign && props.rankedStats?.server) {
                      updateRiotAccountMutation.mutate({
                        ign: props.rankedStats.ign,
                        server: props.rankedStats.server,
                        userId: props.user.id,
                      });
                    }
                  }}
                >
                  Refresh league stats
                </button>
                <div className="p-2"></div>
              </div>
            </>
          )}

        {meData && meData?.id == props.user.id ? (
          <button className="bg-gradient-to-r from-indigo-500 to-indigo-900 hover:border-2 hover:border-white rounded-full pr-4 pl-4 pt-2 pb-2 text-lg cursor-pointer mt-8 font-semibold">
            <NextLink href="/profile/edit">Edit your profile here</NextLink>
          </button>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default Profile;
