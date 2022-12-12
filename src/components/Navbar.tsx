/* This example requires Tailwind CSS v2.0+ */
import { FormEvent, Fragment, useState } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import { inferQueryOutput, trpc } from "../utils/trpc";
import NextLink from "next/link";
import { signOut, signIn } from "next-auth/react";
import { useRouter } from "next/router";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

type meType = inferQueryOutput<"user.me">;

type navigationType = {
  name: string;
  href: string;
  current: boolean;
};

export type { meType };

type currentType = "settings" | "find friends" | "inbox" | "friend requests";

const SearchBar = (props: { hidden: boolean }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const surroundingDivClass = props.hidden
    ? "hidden relative md:block"
    : "relative";
  return (
    <div className={surroundingDivClass}>
      <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
        <svg
          className="w-5 h-5 text-gray-500"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          ></path>
        </svg>
        <span className="sr-only">Search icon</span>
      </div>
      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          router.push(`/search/${searchTerm}`);
        }}
      >
        <input
          type="text"
          id="search-navbar"
          className="block p-2 pl-10 w-full text-gray-900 bg-gray-200 rounded-lg border border-gray-300 sm:text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Search..."
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(e.target.value);
          }}
        />
      </form>
    </div>
  );
};

const Navbar: React.FC<{
  current?: currentType;
  me: meType | undefined;
}> = ({ current, me }) => {
  const { data: numUnseenMsgs } = trpc.useQuery([
    "chat.numberOfUnseenMessagesTotal",
  ]);

  const { data: numFriendRequests } = trpc.useQuery([
    "match.numberFriendRequests",
  ]);

  let navigation: navigationType[] = [];

  if (me) {
    navigation = [
      {
        name: "Friend requests",
        href: "/requests",
        current: current == "friend requests",
      }, //change current in props
      { name: "Inbox", href: "/chat", current: current == "inbox" }, //change current in props
      {
        name: "Find friends",
        href: "/explore",
        current: current == "find friends",
      },
      { name: "Settings", href: "/settings", current: current == "settings" },
    ];
  }

  return (
    <Disclosure as="nav" className="bg-gray-800">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 max-h-16">
            <div className="relative flex items-center justify-between h-16">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-between">
                <div className="flex-shrink-0 flex items-center">
                  <NextLink href="/">
                    <img
                      className="block lg:hidden h-8 w-auto cursor-pointer"
                      src="/images/logo_getbrka.png"
                      alt="Dachi"
                    />
                  </NextLink>
                  <NextLink href="/">
                    <img
                      className="hidden lg:block w-10 h-auto cursor-pointer"
                      src="/images/logo_getbrka.png"
                      alt="Dachi"
                    />
                  </NextLink>
                </div>
                <SearchBar hidden={true} />
                <div className="hidden sm:block sm:ml-6">
                  <div className="flex space-x-4">
                    {navigation.map((item) =>
                      item.name == "Inbox" &&
                      numUnseenMsgs &&
                      numUnseenMsgs > 0 ? (
                        <div className="flex items-center" key={item.name}>
                          <a
                            key={item.name}
                            href={item.href}
                            className={classNames(
                              item.current
                                ? "bg-gray-900 text-white"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white",
                              "px-3 py-2 rounded-md text-sm font-medium"
                            )}
                            aria-current={item.current ? "page" : undefined}
                          >
                            {item.name}
                          </a>
                          <div className="flex items-center justify-center rounded-full bg-purple-600 w-5 h-5">
                            {numUnseenMsgs}
                          </div>
                        </div>
                      ) : item.name == "Friend requests" &&
                        numFriendRequests &&
                        numFriendRequests > 0 ? (
                        <div className="flex items-center" key={item.name}>
                          <a
                            key={item.name}
                            href={item.href}
                            className={classNames(
                              item.current
                                ? "bg-gray-900 text-white"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white",
                              "px-3 py-2 rounded-md text-sm font-medium"
                            )}
                            aria-current={item.current ? "page" : undefined}
                          >
                            {item.name}
                          </a>
                          <div className="flex items-center justify-center rounded-full bg-purple-600 w-5 h-5">
                            {numFriendRequests}
                          </div>
                        </div>
                      ) : (
                        <a
                          key={item.name}
                          href={item.href}
                          className={classNames(
                            item.current
                              ? "bg-gray-900 text-white"
                              : "text-gray-300 hover:bg-gray-700 hover:text-white",
                            "px-3 py-2 rounded-md text-sm font-medium"
                          )}
                          aria-current={item.current ? "page" : undefined}
                        >
                          {item.name}
                        </a>
                      )
                    )}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {/* Profile dropdown */}
                {me ? (
                  <Menu as="div" className="ml-3 relative">
                    <div>
                      <Menu.Button className="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                        <span className="sr-only">Open user menu</span>
                        <img
                          className="h-8 w-8 rounded-full"
                          src={me?.image || ""}
                          alt=""
                        />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-sky-200 ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <NextLink href={`/profile/${me?.name}`}>
                              <a
                                className={classNames(
                                  active ? "bg-gray-100" : "",
                                  "block px-4 py-2 text-sm text-black hover:bg-sky-100"
                                )}
                              >
                                Your Profile
                              </a>
                            </NextLink>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              className={classNames(
                                "block px-4 py-2 text-sm text-black hover:bg-sky-100 w-full text-left"
                              )}
                              onClick={() => signOut()}
                            >
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) =>
                item.name == "Inbox" && numUnseenMsgs && numUnseenMsgs > 0 ? (
                  <div className="flex items-center text-left" key={item.name}>
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      className={classNames(
                        item.current
                          ? "bg-gray-900 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white",
                        "block px-3 py-2 rounded-md text-base font-medium"
                      )}
                      aria-current={item.current ? "page" : undefined}
                    >
                      {item.name}
                    </Disclosure.Button>
                    <div className="flex items-center justify-center rounded-full bg-purple-600 w-5 h-5">
                      {numUnseenMsgs}
                    </div>
                  </div>
                ) : item.name == "Friend requests" &&
                  numFriendRequests &&
                  numFriendRequests > 0 ? (
                  <div className="flex items-center text-left" key={item.name}>
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      className={classNames(
                        item.current
                          ? "bg-gray-900 text-white"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white",
                        "block px-3 py-2 rounded-md text-base font-medium"
                      )}
                      aria-current={item.current ? "page" : undefined}
                    >
                      {item.name}
                    </Disclosure.Button>
                    <div className="flex items-center justify-center rounded-full bg-purple-600 w-5 h-5">
                      {numFriendRequests}
                    </div>
                  </div>
                ) : (
                  <Disclosure.Button
                    key={item.name}
                    as="a"
                    href={item.href}
                    className={classNames(
                      item.current
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white",
                      "block px-3 py-2 rounded-md text-base font-medium"
                    )}
                    aria-current={item.current ? "page" : undefined}
                  >
                    {item.name}
                  </Disclosure.Button>
                )
              )}
              <Disclosure.Button
                as="a"
                onClick={() => {
                  signIn("discord");
                }}
                className={
                  "text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                }
              >
                Login
              </Disclosure.Button>
              <SearchBar hidden={false} />
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;
