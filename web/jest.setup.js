// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Mock next/router
jest.mock("next/router", () => require("next-router-mock"));

// Mock next/navigation
const useRouter = jest.fn();
jest.mock("next/navigation", () => ({
	useRouter() {
		return useRouter();
	},
	usePathname() {
		return "";
	},
}));

// Mock WebSocket
class MockWebSocket {
	constructor(url) {
		this.url = url;
		this.readyState = WebSocket.CONNECTING;
	}

	addEventListener() {}
	removeEventListener() {}
	close() {}
	send() {}
}

global.WebSocket = MockWebSocket;

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
	observe: jest.fn(),
	unobserve: jest.fn(),
	disconnect: jest.fn(),
}));
