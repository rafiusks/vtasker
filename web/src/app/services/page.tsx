import { ServiceList } from "@/components/service-list";

export default function ServicesPage() {
	return (
		<div className="container mx-auto py-6">
			<h1 className="text-2xl font-semibold mb-6">Services</h1>
			<ServiceList />
		</div>
	);
}
