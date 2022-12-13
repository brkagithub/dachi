import { Role, Tier } from "@prisma/client";
import React from "react";
import { trpc } from "../utils/trpc";
import NextLink from "next/link";

type ProfileInput = {
  id: string;
  name: string | null;
  image: string | null;
  firstName: string | null;
  role: Role | null;
  fav_champion1: string | null;
  tier: Tier | null;
};

const ProfileCard: React.FC<{
  acceptDecline: boolean;
  unblockButton: boolean;
  profileInput: ProfileInput;
}> = ({ acceptDecline, unblockButton, profileInput }) => {
  const acceptFriendReqMutation = trpc.useMutation(["match.acceptFriendReq"], {
    onSuccess: () => {
      utils.invalidateQueries(["match.getFriendRequests"]);
    },
  });
  const unblockUserMutation = trpc.useMutation(["user.unblockUser"], {
    onSuccess: () => {
      utils.invalidateQueries(["user.getBlockList"]);
    },
  });
  const declineFriendReqMutation = trpc.useMutation(
    ["match.declineFriendReq"],
    {
      onSuccess: () => {
        utils.invalidateQueries(["match.getFriendRequests"]);
      },
    }
  );

  const utils = trpc.useContext();

  return (
    <div
      className="flex justify-between items-center border rounded-3xl border-indigo-400 p-2 mb-4"
      key={profileInput.id}
    >
      <div className="flex justify-start items-center">
        <NextLink href={`/profile/${profileInput.name}`}>
          <img
            className="h-16 w-16 rounded-full cursor-pointer"
            src={profileInput.image || ""}
          ></img>
        </NextLink>
        <div className="p-4"></div>
        <div className="flex flex-col">
          <NextLink href={`/profile/${profileInput.name}`}>
            <div className="underline cursor-pointer text-center md:text-left">
              @{profileInput.name}
            </div>
          </NextLink>

          <div className="text-sm text-center md:text-left">
            {profileInput.firstName}
          </div>
          <div className="flex md:items-center flex-col md:flex-row">
            {profileInput.tier && (
              <div className="bg-gray-800 mt-2 pt-1 pb-1 pr-2 pl-2 rounded-lg text-sm mr-2 capitalize text-center md:text-left">
                {profileInput.tier.toLowerCase()}
              </div>
            )}
            {profileInput.role && (
              <>
                <div className="bg-gray-800 mt-2 pt-1 pb-1 pr-2 pl-2 rounded-lg text-sm mr-2 text-center md:text-left">
                  {profileInput.role}
                </div>
              </>
            )}
            {profileInput.fav_champion1 && (
              <div className="bg-gray-800 mt-2 pt-1 pb-1 pr-2 pl-2 rounded-lg text-sm mr-2 text-center md:text-left">
                {profileInput.fav_champion1}
              </div>
            )}
          </div>
        </div>
      </div>
      {acceptDecline && (
        <div className="flex justify-end items-center">
          <div className="flex flex-col p-2 text-center">
            <div className="text-center"></div>
            <div>
              <button
                onClick={() => {
                  if (profileInput.id && !acceptFriendReqMutation.isLoading) {
                    acceptFriendReqMutation.mutate({
                      requestInitiatorId: profileInput.id,
                    });
                  }
                }}
                type="button"
                disabled={
                  acceptFriendReqMutation.isLoading ||
                  declineFriendReqMutation.isLoading
                }
                className="disabled:opacity-50 disabled:cursor-auto disabled:hover:bg-inherit text-indigo-400 border border-indigo-400 hover:bg-green-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-green-700 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center"
              >
                <svg
                  aria-hidden="true"
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="sr-only">Accept</span>
              </button>
            </div>
            <div className="text-center">accept</div>
          </div>
          <div className="flex flex-col pt-2 pl-2 pb-2 text-center">
            <div>
              <button
                onClick={() => {
                  if (profileInput.id && !acceptFriendReqMutation.isLoading) {
                    declineFriendReqMutation.mutate({
                      requestInitiatorId: profileInput.id,
                    });
                  }
                }}
                type="button"
                disabled={
                  acceptFriendReqMutation.isLoading ||
                  declineFriendReqMutation.isLoading
                }
                className="disabled:opacity-50 disabled:cursor-auto disabled:hover:bg-inherit text-indigo-400 border border-indigo-400 hover:bg-red-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-red-700 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center"
              >
                <svg
                  aria-hidden="true"
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="sr-only">Decline</span>
              </button>
            </div>
            <div className="text-center">decline</div>
          </div>
        </div>
      )}
      {unblockButton && (
        <button
          onClick={() => {
            unblockUserMutation.mutate({ blockedId: profileInput.id });
          }}
          disabled={unblockUserMutation.isLoading}
          className="disabled:opacity-50 disabled:cursor-auto disabled:hover:bg-inherit bg-gradient-to-r from-red-500 to-red-900 hover:outline hover:outline-2 hover:outline-white rounded-full pr-4 pl-4 pt-2 pb-2 text-lg cursor-pointer font-semibold"
        >
          Unblock
        </button>
      )}
    </div>
  );
};

export default ProfileCard;
