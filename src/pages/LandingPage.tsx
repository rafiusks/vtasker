import { Link } from "@tanstack/react-router";

export const LandingPage = () => {
	return (
		<div className="min-h-screen bg-gray-50">
			<nav className="bg-white shadow">
				<div className="container mx-auto px-4">
					<div className="flex justify-between h-16">
						<div className="flex">
							<div className="flex items-center px-2 py-2 text-gray-700">
								<span className="text-xl font-bold">VTasker</span>
							</div>
						</div>

						<div className="flex items-center">
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
						</div>
					</div>
				</div>
			</nav>

			<main className="container mx-auto px-4 py-16">
				<div className="max-w-3xl mx-auto text-center">
					<h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
						Welcome to VTasker
					</h1>
					<p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl">
						A modern task management system for teams and individuals.
					</p>
					<div className="mt-5 sm:mt-8 sm:flex sm:justify-center">
						<div className="rounded-md shadow">
							<Link
								to="/register"
								className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
							>
								Get Started
							</Link>
						</div>
						<div className="mt-3 sm:mt-0 sm:ml-3">
							<Link
								to="/login"
								className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10"
							>
								Login
							</Link>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};
