import { Link } from "@tanstack/react-router";
import { ChevronRightIcon } from "@heroicons/react/20/solid";

interface BreadcrumbItem {
	label: string;
	to?: string;
}

interface BreadcrumbsProps {
	items: BreadcrumbItem[];
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
	return (
		<nav className="flex" aria-label="Breadcrumb">
			<ol className="flex items-center space-x-2">
				{items.map((item, index) => (
					<li key={item.label} className="flex items-center">
						{index > 0 && (
							<ChevronRightIcon
								className="h-5 w-5 text-gray-400 mx-1"
								aria-hidden="true"
							/>
						)}
						{item.to ? (
							<Link
								to={item.to}
								className="text-sm font-medium text-gray-500 hover:text-gray-700"
							>
								{item.label}
							</Link>
						) : (
							<span className="text-sm font-medium text-gray-900">
								{item.label}
							</span>
						)}
					</li>
				))}
			</ol>
		</nav>
	);
};
