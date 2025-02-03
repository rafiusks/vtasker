const { spawn } = require("node:child_process");
const { exec } = require("node:child_process");
const net = require("node:net");
const blessed = require("blessed");
const chalk = require("chalk");

const FRONTEND_PORT = 3000;
const BACKEND_PORT = 8000;

// Create blessed screen
const screen = blessed.screen({
	smartCSR: true,
	title: "Service Manager",
	dockBorders: true,
	fullUnicode: true,
});

// Create layout
const layout = {
	menu: blessed.list({
		left: 0,
		top: 0,
		width: "30%",
		height: "100%",
		keys: true,
		mouse: true,
		tags: true,
		border: {
			type: "line",
		},
		style: {
			selected: {
				bg: "blue",
				fg: "white",
				bold: true,
			},
			border: {
				fg: "blue",
			},
			item: {
				hover: {
					bg: "blue",
				},
			},
		},
	}),
	logTabs: blessed.listbar({
		right: 0,
		top: 0,
		width: "70%",
		height: 3,
		mouse: true,
		style: {
			bg: "blue",
			item: {
				bg: "blue",
				fg: "white",
				hover: {
					bg: "green",
				},
			},
			selected: {
				bg: "green",
				fg: "white",
			},
		},
		commands: {
			"All Logs": () => showLogView("all"),
			Frontend: () => showLogView("frontend"),
			Backend: () => showLogView("backend"),
		},
	}),
	logs: blessed.log({
		right: 0,
		top: 3,
		width: "70%",
		height: "100%-3",
		border: {
			type: "line",
		},
		style: {
			border: {
				fg: "blue",
			},
		},
		scrollable: true,
		alwaysScroll: true,
		scrollbar: {
			ch: "║",
			inverse: true,
		},
		tags: true,
		label: " All Logs ",
	}),
};

// Add components to screen
for (const component of Object.values(layout)) {
	screen.append(component);
}

let currentLogView = "all";

function showLogView(view) {
	currentLogView = view;

	// Update the log panel label
	layout.logs.setLabel(
		` ${view.charAt(0).toUpperCase() + view.slice(1)} Logs `,
	);
	layout.logs.setContent("");

	// Update the selected tab
	const tabText =
		view === "all" ? "All Logs" : view.charAt(0).toUpperCase() + view.slice(1);
	layout.logTabs.select(tabText);

	// Show logs based on the selected view
	const logs = [];
	if (view === "all") {
		for (const service of Object.values(services)) {
			logs.push(...service.logs);
		}
	} else {
		logs.push(...services[view].logs);
	}

	// Sort logs by timestamp and display
	logs.sort((a, b) => {
		const timeA = a.match(/\[(.*?)\]/)?.[1] || "";
		const timeB = b.match(/\[(.*?)\]/)?.[1] || "";
		return timeA.localeCompare(timeB);
	});

	for (const logEntry of logs) {
		layout.logs.add(logEntry);
	}

	screen.render();
}

const services = {
	frontend: {
		port: FRONTEND_PORT,
		process: null,
		isRunning: false,
		name: "Frontend",
		startCommand: ["npm", "run", "dev"],
		logs: [],
		cwd: ".",
	},
	backend: {
		port: BACKEND_PORT,
		process: null,
		isRunning: false,
		name: "Backend",
		startCommand: ["go", "run", "./cmd/main.go"],
		logs: [],
		cwd: "./backend",
	},
};

function getTimestamp() {
	const now = new Date();
	return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now.getMilliseconds().toString().padStart(3, "0")}`;
}

function log(message, type = "info") {
	const timestamp = getTimestamp();
	let color;
	switch (type) {
		case "error":
			color = "red";
			break;
		case "success":
			color = "green";
			break;
		case "warning":
			color = "yellow";
			break;
		default:
			color = "white";
	}

	const logEntry = `{${color}-fg}[${timestamp}] ${message}{/${color}-fg}`;

	// Only show log if it matches current view
	if (
		currentLogView === "all" ||
		message.includes(
			`[${currentLogView.charAt(0).toUpperCase() + currentLogView.slice(1)}]`,
		)
	) {
		layout.logs.add(logEntry);
	}

	screen.render();
}

function addServiceLog(serviceKey, message, type = "info") {
	const service = services[serviceKey];
	const logMessage = `[${service.name}] ${message}`;
	service.logs.push(logMessage);
	log(logMessage, type);

	// Keep only last 1000 logs
	if (service.logs.length > 1000) {
		service.logs.shift();
	}
}

function updateMenu() {
	const menuItems = [
		"Service Status",
		...Object.entries(services).map(
			([_, service]) =>
				`${service.name}: ${
					service.isRunning
						? "{bold}{green-fg}Running{/green-fg}{/bold}"
						: "{bold}{red-fg}Stopped{/red-fg}{/bold}"
				} (Port ${service.port})`,
		),
		"",
		"Actions",
		"[F] Toggle Frontend",
		"[B] Toggle Backend",
		"[S] Start All",
		"[R] Restart All",
		"[C] Clear Logs",
		"[1] All Logs",
		"[2] Frontend Logs",
		"[3] Backend Logs",
		"",
		"[Q] Quit",
	];

	// Add header styling
	menuItems[0] = `{bold}{blue-fg}${menuItems[0]}{/blue-fg}{/bold}`;
	menuItems[menuItems.indexOf("Actions")] =
		`{bold}{blue-fg}Actions{/blue-fg}{/bold}`;

	layout.menu.setItems(menuItems);
	screen.render();
}

async function isPortInUse(port) {
	return new Promise((resolve) => {
		const server = net
			.createServer()
			.once("error", () => resolve(true))
			.once("listening", () => {
				server.close();
				resolve(false);
			})
			.listen(port);
	});
}

async function killProcessOnPort(port) {
	return new Promise((resolve, reject) => {
		exec(`lsof -ti:${port} | xargs kill -9`, (error) => {
			if (error && !error.message.includes("no process found")) {
				reject(error);
			} else {
				resolve();
			}
		});
	});
}

async function startService(serviceKey) {
	const service = services[serviceKey];
	if (service.isRunning) return;

	try {
		if (await isPortInUse(service.port)) {
			log(
				`Port ${service.port} is in use. Attempting to kill process...`,
				"warning",
			);
			await killProcessOnPort(service.port);
			addServiceLog(serviceKey, `Killed process on port ${service.port}`);
		}

		service.process = spawn(
			service.startCommand[0],
			service.startCommand.slice(1),
			{
				stdio: ["inherit", "pipe", "pipe"],
				shell: true,
				env: { ...process.env, PORT: service.port },
				cwd: service.cwd,
			},
		);

		// Capture stdout and stderr
		service.process.stdout.on("data", (data) => {
			addServiceLog(serviceKey, data.toString().trim());
		});

		service.process.stderr.on("data", (data) => {
			addServiceLog(serviceKey, data.toString().trim(), "error");
		});

		service.process.on("exit", (code) => {
			if (code !== 0) {
				addServiceLog(
					serviceKey,
					`${service.name} server crashed with code ${code}!`,
					"error",
				);
			}
			service.isRunning = false;
			updateMenu();
		});

		service.isRunning = true;
		addServiceLog(serviceKey, "Service started successfully", "success");
		updateMenu();
		return true;
	} catch (error) {
		addServiceLog(serviceKey, `Failed to start: ${error.message}`, "error");
		return false;
	}
}

async function startServers() {
	log("Starting servers...");
	const frontendStarted = await startService("frontend");
	const backendStarted = await startService("backend");

	if (frontendStarted && backendStarted) {
		log("All servers started successfully!", "success");
	} else {
		log("Some servers failed to start", "error");
	}
}

function stopService(serviceKey) {
	const service = services[serviceKey];
	if (!service.isRunning) return;

	log(`Stopping ${service.name}...`, "warning");
	service.process?.kill();
	service.process = null;
	service.isRunning = false;
	addServiceLog(serviceKey, "Service stopped");
	updateMenu();
}

function stopServers() {
	Object.keys(services).forEach(stopService);
}

function handleKey(ch, key) {
	// Convert the raw character to a string for comparison
	const char = String(ch);

	// Handle number keys
	if (char === "1" || char === "2" || char === "3") {
		switch (char) {
			case "1":
				showLogView("all");
				break;
			case "2":
				showLogView("frontend");
				break;
			case "3":
				showLogView("backend");
				break;
		}
		return;
	}

	// Handle other keys
	if (key && key.name) {
		switch (key.name.toLowerCase()) {
			case "s":
				startServers();
				break;
			case "r":
				stopServers();
				startServers();
				break;
			case "b":
				if (services.backend.isRunning) {
					stopService("backend");
				} else {
					startService("backend");
				}
				break;
			case "f":
				if (services.frontend.isRunning) {
					stopService("frontend");
				} else {
					startService("frontend");
				}
				break;
			case "c":
				layout.logs.setContent("");
				screen.render();
				break;
			case "q":
				cleanup();
				break;
		}
	}
}

function cleanup() {
	stopServers();
	setTimeout(() => {
		screen.destroy();
		process.exit(0);
	}, 100);
}

// Setup event handlers
screen.key(["q", "C-c"], () => cleanup());
screen.key(["s", "r", "b", "f", "c", "1", "2", "3"], handleKey);

// Handle process cleanup
process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

// Initial setup
updateMenu();
log("Service Manager Started", "success");
log("Press 'q' to quit", "info");

// Focus menu
layout.menu.focus();

// Render the screen
screen.render();
