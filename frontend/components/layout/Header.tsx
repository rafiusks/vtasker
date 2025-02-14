import { type HeaderProps } from "./types";

export function Header({
	className = "",
	showLogo = true,
	showNav = true,
	showSearch = true,
	showUserMenu = true,
}: HeaderProps) {
	return (
		<header className={`w-full border-b border-gray-200 bg-white ${className}`}>
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				{showLogo && (
					<div className="flex items-center">
						<a href="/" className="flex items-center">
							<span className="text-xl font-bold text-gray-900">vTasker</span>
						</a>
					</div>
				)}

				{showNav && (
					<nav className="hidden space-x-8 sm:flex">
						<a
							href="/projects"
							className="text-sm font-medium text-gray-700 hover:text-gray-900"
						>
							Projects
						</a>
						<a
							href="/issues"
							className="text-sm font-medium text-gray-700 hover:text-gray-900"
						>
							Issues
						</a>
					</nav>
				)}

				<div className="flex items-center space-x-4">
					{showSearch && (
						<div className="hidden sm:block">
							<div className="relative">
								<input
									type="search"
									placeholder="Search..."
									className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
								/>
								<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
									<svg
										className="h-5 w-5 text-gray-400"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
							</div>
						</div>
					)}

					{showUserMenu && (
						<div className="relative">
							<button
								type="button"
								className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
							>
								<span className="sr-only">Open user menu</span>
								<div className="h-8 w-8 rounded-full bg-gray-200" />
							</button>
						</div>
					)}
				</div>
			</div>
		</header>
	);
}
