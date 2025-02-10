// ... existing code ...
const handleCreateTask = async (task: Partial<RawTask>) => {
	try {
		setLoading(true);
		const { metadata, ...taskWithoutMetadata } = task;
		const newTask = await taskAPI.createTask({
			...taskWithoutMetadata,
			order: tasks.length,
			content: {
				description: task.content?.description || "",
				acceptance_criteria: task.content?.acceptance_criteria || [],
				implementation_details: task.content?.implementation_details,
				notes: task.content?.notes,
				attachments: task.content?.attachments || [],
				due_date: task.content?.due_date ? task.content.due_date : undefined,
				assignee: task.content?.assignee,
			},
			relationships: {
				parent: task.relationships?.parent || undefined,
				dependencies: task.relationships?.dependencies || [],
				labels: task.relationships?.labels || [],
			},
		});
		setTasks((prev) => [...prev, newTask]);
		setIsTaskFormOpen(false);
		toast.success("Task created successfully");
		return newTask;
	} catch (err) {
		console.error("Failed to create task:", err);
		toast.error(err instanceof Error ? err.message : "Failed to create task");
		throw err;
	} finally {
		setLoading(false);
	}
};
// ... existing code ...
