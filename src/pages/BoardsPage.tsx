import { BoardList } from "../components/board/BoardList";
import { Breadcrumbs } from "../components/common/Breadcrumbs";

export const BoardsPage = () => {
	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<Breadcrumbs
				items={[{ label: "Dashboard", to: "/dashboard" }, { label: "Boards" }]}
			/>
			<div className="mt-6">
				<BoardList />
			</div>
		</div>
	);
};
