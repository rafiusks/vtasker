import { Link } from "@tanstack/react-router";
import { useAuth } from "../../contexts/AuthContext";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

export const Navbar = () => {
	const { user, logout } = useAuth();

	return (
		<nav className="bg-white shadow">
			<div className="container mx-auto px-4">
				<div className="flex justify-between h-16">
					<div className="flex">
						<Link
							to="/dashboard"
							className="flex items-center px-2 py-2 text-gray-700 hover:text-gray-900"
						>
							<span className="text-xl font-bold">VTasker</span>
						</Link>
					</div>

					<div className="flex items-center">
						{user ? (
							<>
								<Link
									to="/boards"
									className="px-3 py-2 text-gray-700 hover:text-gray-900"
								>
									Boards
								</Link>
								<Menu as="div" className="relative ml-3">
									<Menu.Button className="flex items-center gap-x-1 text-gray-700 hover:text-gray-900">
										{user.name}
										<ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
									</Menu.Button>
									<Transition
										as={Fragment}
										enter="transition ease-out duration-100"
										enterFrom="transform opacity-0 scale-95"
										enterTo="transform opacity-100 scale-100"
										leave="transition ease-in duration-75"
										leaveFrom="transform opacity-100 scale-100"
										leaveTo="transform opacity-0 scale-95"
									>
										<Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
											<Menu.Item>
												{({ active }) => (
													<Link
														to="/dashboard"
														className={`${
															active ? "bg-gray-100" : ""
														} block px-4 py-2 text-sm text-gray-700`}
													>
														Dashboard
													</Link>
												)}
											</Menu.Item>
											<Menu.Item>
												{({ active }) => (
													<Link
														to="/settings"
														className={`${
															active ? "bg-gray-100" : ""
														} block px-4 py-2 text-sm text-gray-700`}
													>
														Settings
													</Link>
												)}
											</Menu.Item>
											<Menu.Item>
												{({ active }) => (
													<button
														type="button"
														onClick={logout}
														className={`${
															active ? "bg-gray-100" : ""
														} block w-full text-left px-4 py-2 text-sm text-gray-700`}
													>
														Logout
													</button>
												)}
											</Menu.Item>
										</Menu.Items>
									</Transition>
								</Menu>
							</>
						) : (
							<>
								<Link
									to="/login"
									className="px-3 py-2 text-gray-700 hover:text-gray-900"
								>
									Login
								</Link>
								<Link
									to="/register"
									className="px-3 py-2 text-gray-700 hover:text-gray-900"
								>
									Register
								</Link>
							</>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
};
