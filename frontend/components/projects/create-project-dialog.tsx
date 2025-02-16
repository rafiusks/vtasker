"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useCreateProject } from "@/store";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

const projectTemplates = [
	{
		id: "blank",
		name: "Blank Project",
		description: "Start from scratch with an empty project.",
	},
	{
		id: "scrum",
		name: "Scrum Project",
		description: "Pre-configured for Scrum with sprints and story points.",
	},
	{
		id: "kanban",
		name: "Kanban Project",
		description: "Set up for Kanban with work-in-progress limits.",
	},
];

type Step = "details" | "template" | "team";

export function CreateProjectDialog() {
	const router = useRouter();
	const createProject = useCreateProject();
	const [open, setOpen] = React.useState(false);
	const [step, setStep] = React.useState<Step>("details");
	const [isLoading, setIsLoading] = React.useState(false);

	const [formData, setFormData] = React.useState({
		name: "",
		description: "",
		template: "blank",
		teamMembers: [] as string[],
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		try {
			const project = await createProject({
				name: formData.name,
				description: formData.description,
				is_archived: false,
			});
			setOpen(false);
			router.push(`/projects/${project.id}`);
		} catch (error) {
			console.error("Failed to create project:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const steps = {
		details: (
			<div className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="name">Project Name</Label>
					<Input
						id="name"
						placeholder="Enter project name"
						value={formData.name}
						onChange={(e) => setFormData({ ...formData, name: e.target.value })}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="description">Description</Label>
					<Textarea
						id="description"
						placeholder="Enter project description"
						value={formData.description}
						onChange={(e) =>
							setFormData({ ...formData, description: e.target.value })
						}
					/>
				</div>
			</div>
		),
		template: (
			<div className="space-y-4">
				<div className="space-y-2">
					<Label>Project Template</Label>
					<Select
						value={formData.template}
						onValueChange={(value) =>
							setFormData({ ...formData, template: value })
						}
					>
						<SelectTrigger>
							<SelectValue placeholder="Select a template" />
						</SelectTrigger>
						<SelectContent>
							{projectTemplates.map((template) => (
								<SelectItem key={template.id} value={template.id}>
									{template.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<p className="text-sm text-muted-foreground">
						{
							projectTemplates.find((t) => t.id === formData.template)
								?.description
						}
					</p>
				</div>
			</div>
		),
		team: (
			<div className="space-y-4">
				<div className="space-y-2">
					<Label>Team Members</Label>
					<p className="text-sm text-muted-foreground">
						You can add team members after creating the project.
					</p>
				</div>
			</div>
		),
	};

	const canProceed = {
		details: formData.name.length > 0,
		template: true,
		team: true,
	};

	const stepOrder: Step[] = ["details", "template", "team"];
	const currentStepIndex = stepOrder.indexOf(step);
	const isLastStep = currentStepIndex === stepOrder.length - 1;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="mr-2 h-4 w-4" /> Create Project
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Create Project</DialogTitle>
						<DialogDescription>
							Create a new project to organize your work.
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">{steps[step]}</div>
					<DialogFooter>
						{currentStepIndex > 0 && (
							<Button
								type="button"
								variant="outline"
								onClick={() => setStep(stepOrder[currentStepIndex - 1])}
							>
								Back
							</Button>
						)}
						<Button
							type={isLastStep ? "submit" : "button"}
							disabled={!canProceed[step] || isLoading}
							onClick={() => {
								if (!isLastStep) {
									setStep(stepOrder[currentStepIndex + 1]);
								}
							}}
						>
							{isLoading
								? "Creating..."
								: isLastStep
									? "Create Project"
									: "Next"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
