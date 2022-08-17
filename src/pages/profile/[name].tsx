import type { User } from "@prisma/client";
import { GetStaticProps } from "next";
import { prisma } from "../../server/db/client";
import NextLink from "next/link";
import { trpc } from "../../utils/trpc";
import Navbar from "../../components/Navbar";
import { flag } from "country-emoji";
import { SocialIcon } from "react-social-icons";
const ProfilePage = (props: { user: User }) => {
  const { data: meData, isLoading } = trpc.useQuery(["user.me"]);

  if (!props.user) throw new Error("user doesnt exist");

  if (isLoading) {
    return <div>loading...</div>;
  }

  let userRole = "";
  if (props.user.role == "Top") userRole = "TOP";
  if (props.user.role == "Jungle") userRole = "JUNGLE";
  if (props.user.role == "Mid") userRole = "MIDDLE";
  if (props.user.role == "ADC") userRole = "ADC";
  if (props.user.role == "Support") userRole = "SUPPORT";

  return (
    <>
      <Navbar me={meData} />
      <img
        className="w-full h-48"
        src="data:image/jpeg;base64,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"
      ></img>
      <div className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8 flex flex-col items-center">
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
            <img
              className="h-36 w-36 rounded-full relative bottom-16"
              src={props.user.image || ""}
            ></img>
            <div className="text-xl text-center relative bottom-16">
              {props.user.name}
            </div>
            <div className="flex w-36 h-autopt-2 justify-between relative bottom-16">
              {props.user.twitter ? (
                <SocialIcon
                  style={{ height: 32, width: 32 }}
                  url={`https://twitter.com/${props.user.twitter}`}
                />
              ) : (
                <></>
              )}
              {props.user.instagram ? (
                <SocialIcon
                  style={{ height: 32, width: 32 }}
                  url={`https://instagram.com/${props.user.instagram}`}
                />
              ) : (
                <></>
              )}
              {props.user.twitch ? (
                <SocialIcon
                  style={{ height: 32, width: 32 }}
                  url={`https://twitch.tv/${props.user.twitch}`}
                />
              ) : (
                <></>
              )}
              {props.user.twitter ? (
                <SocialIcon
                  style={{ height: 32, width: 32 }}
                  url={`https://youtube.com/${props.user.youtube}`}
                />
              ) : (
                <></>
              )}
            </div>
          </div>
          <div className="order-3 w-full md:w-2/5 flex justify-center md:justify-around pt-4 md:pt-2 md:pl-8">
            <div>
              <img
                className="h-16 w-auto rounded-full"
                src={`https://raw.githubusercontent.com/esports-bits/lol_images/master/role_lane_icons/${userRole}.png`}
              ></img>
              <div className="text-center capitalize">{props.user.role}</div>
            </div>
            <div className="p-1"></div>
            <div>
              <img
                className="h-16 w-auto rounded-full"
                src={`http://ddragon.leagueoflegends.com/cdn/12.15.1/img/champion/${props.user.fav_champion1}.png`}
              ></img>
              <div className="text-center capitalize">
                {props.user.fav_champion1}
              </div>
            </div>

            <div className="p-1"></div>
            <div>
              <img
                className="h-16 w-auto rounded-full"
                src={`http://ddragon.leagueoflegends.com/cdn/12.15.1/img/champion/${props.user.fav_champion2}.png`}
              ></img>
              <div className="text-center capitalize">
                {props.user.fav_champion2}
              </div>
            </div>
            <div className="p-1"></div>
            <div>
              <img
                className="h-16 w-auto rounded-full"
                src={`http://ddragon.leagueoflegends.com/cdn/12.15.1/img/champion/${props.user.fav_champion3}.png`}
              ></img>
              <div className="text-center capitalize">
                {props.user.fav_champion3}
              </div>
            </div>
          </div>
        </div>

        {meData && meData?.id ? (
          <div className="mt-8">
            <NextLink href="/profile/edit">Edit your profile here</NextLink>
          </div>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (!params || !params.name || typeof params.name !== "string") {
    return {
      notFound: true,
    };
  }

  const userInfo = await prisma.user.findFirst({
    where: { name: { equals: params.name, mode: "insensitive" } },
  });

  return {
    props: {
      user: JSON.parse(JSON.stringify(userInfo)),
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
