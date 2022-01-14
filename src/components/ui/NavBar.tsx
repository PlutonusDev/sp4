import { Fragment, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/router";
import useUser from "../../lib/useUser";

import Link from "next/link";
import { Disclosure, Menu, Transition } from "@headlessui/react";

import { BiUser } from "react-icons/bi";
import { BsSunFill, BsMoonStarsFill } from "react-icons/bs";
import { GiHamburgerMenu, GiCancel } from "react-icons/gi";
import { GoSignIn } from "react-icons/go";

const navigation = [
	{
		label: "Home",
		href: "/"
	}
]

export default function NavBar() {
	const [ mounted, setMounted ] = useState(false);
	const { resolvedTheme, setTheme } = useTheme();
	const router = useRouter();
	const { user } = useUser();

	useEffect(() => setMounted(true), []);

	async function logout() {
		const resp = await fetch("/api/logout", {
			method: "POST"
		});
		router.push("/logout");
	}

	return (
		<Disclosure as="nav" className="bg-gray-800">
			{({ open }) => (
				<>
					<div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
						<div className="relative flex items-center justify-between h-16">
							<div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
								<Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
									<span className="sr-only">Open Navigation Menu</span>
									{open ? (
										<GiCancel />
									) : (
										<GiHamburgerMenu />
									)}
								</Disclosure.Button>
							</div>
							<div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
								<div className="flex-shrink-0 flex items-center space-x-2">
									<img className="h-8 w-auto" alt="Logo" src="/static/images/logo.png" />
									<img className="h-8 w-auto" alt="Logo Text" src="/static/images/logo-text.png" />
								</div>
								<div className="hidden sm:block sm:ml-6">
									<div className="flex space-x-4">
										{navigation.map(item => (
											<Link key={item.label} href={item.href} aria-current={router.asPath == item.href ? "page" : undefined}>
												<span className={`px-3 py-2 rounded-md text-sm font-medium ${router.asPath == item.href ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}`}>
													{item.label}
												</span>
											</Link>
										))}
									</div>
								</div>
							</div>
							<div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
								{mounted && (
									<a onClick={() => setTheme(resolvedTheme == "dark" ? "light" : "dark")} className="bg-gray-800 p-1 rounded-full text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
										<span className="sr-only">Change theme</span>
										{resolvedTheme === "dark" ? (
											<BsSunFill />
										) : (
											<BsMoonStarsFill />
										)}
									</a>
								)}

								<Menu as="div" className="ml-3 relative">
									{user ? (
										<>
											<div>
												{user.loggedIn ? (
													<Menu.Button className="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
														<span className="sr-only">Open user menu</span>
														{user.avatarUrl ? (
															<img className="h-8 w-8 rounded-full" alt="avatar" src={user.avatarUrl} />
														) : (
															<div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center"><BiUser className="text-gray-300 text-lg" /></div>
														)}
													</Menu.Button>
												) : (
													<Link href="/login">
														<div className="flex items-center justify-center text-gray-50 bg-gray-900 w-8 sm:w-28 h-8 rounded-lg animate-pulse">
															<GoSignIn />
															<span className="ml-2 hidden sm:block">Sign In</span>
														</div>
													</Link>
												)}
											</div>
											{user.loggedIn && (
												<Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
													<Menu.Items className="flex flex-col origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none font-semibold text-lg">
														<Menu.Item>
															{({ active }) => (
																<Link href="/profile">
																	<span className={(active && "bg-gray-100 ") + "block px-4 py-2 text-sm text-gray-700"}>
																		Profile
																	</span>
																</Link>
															)}
														</Menu.Item>
														<Menu.Item>
															{({ active }) => (
																<a href="#" className={(active && "bg-gray-100 ") + "block px-4 py-2 text-sm text-gray-700"}>
																	Settings
																</a>
															)}
														</Menu.Item>
														<Menu.Item>
															{({ active }) => (
																<a onClick={() => logout()} className={(active && "bg-gray-100 ") + "block px-4 py-2 text-sm text-red-700"}>
																	Sign Out
																</a>
															)}
														</Menu.Item>
													</Menu.Items>
												</Transition>
											)}
										</>
									) : (
										<div className="h-8 w-8 rounded-full bg-gray-900" />
									)}
								</Menu>
							</div>
						</div>
					</div>

					<Disclosure.Panel className="sm:hidden">
						<div className="flex flex-col px-2 pt-2 pb-3 space-y-1">
							{navigation.map(item => (
								<Link key={item.label} href={item.href} aria-current={router.asPath == item.href ? "page" : undefined}>
									<span className={`block px-3 py-2 rounded-md text-base font-medium ${router.asPath == item.href ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}`}>
										{item.label}
									</span>
								</Link>
							))}
						</div>
					</Disclosure.Panel>							
				</>
			)}
		</Disclosure>
	);
}
