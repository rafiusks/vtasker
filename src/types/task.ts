export interface TaskType {
	id: number;
	code: string;
	name: string;
	description?: string;
}

export interface Task {
	id: string;
	title: string;
	description: string;
	type: TaskType;
	// ...rest of interface remains the same...
}
