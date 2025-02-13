import { request } from "@playwright/test";

export interface TestUser {
    fullName: string;
    email: string;
    password: string;
    token?: string;
}

export async function createTestUser(): Promise<TestUser> {
    const timestamp = Date.now();
    const user: TestUser = {
        fullName: `Test User ${timestamp}`,
        email: `test${timestamp}@example.com`,
        password: "Test@123"
    };

    // Create API context
    const context = await request.newContext({
        baseURL: "http://localhost:8000",
        extraHTTPHeaders: {
            'Content-Type': 'application/json',
        },
    });

    try {
        // Clean up any existing test data
        await cleanupTestData();

        // Register user directly via API
        const registerResponse = await context.post("/api/auth/register", {
            data: {
                full_name: user.fullName,
                email: user.email,
                password: user.password,
                confirm_password: user.password
            }
        });

        if (!registerResponse.ok()) {
            throw new Error(`Failed to register test user: ${await registerResponse.text()}`);
        }

        // Login to get token
        const loginResponse = await context.post("/api/auth/login", {
            data: {
                email: user.email,
                password: user.password
            }
        });

        if (!loginResponse.ok()) {
            throw new Error(`Failed to login test user: ${await loginResponse.text()}`);
        }

        const { token } = await loginResponse.json();
        user.token = token;

        return user;
    } finally {
        await context.dispose();
    }
}

export async function createTestBoard(token: string) {
    const context = await request.newContext({
        baseURL: "http://localhost:8000",
        extraHTTPHeaders: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    });

    const response = await context.post("/api/boards", {
        data: {
            name: "Test Board",
            description: "Test board for e2e tests"
        }
    });

    if (!response.ok()) {
        throw new Error(`Failed to create test board: ${await response.text()}`);
    }

    const board = await response.json();
    await context.dispose();
    return board;
}

export async function cleanupTestData(token?: string) {
    const context = await request.newContext({
        baseURL: "http://localhost:8000",
        extraHTTPHeaders: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
    });

    try {
        // Clean up tasks first since they depend on boards
        await context.delete("/api/tasks/cleanup-test").catch(error => {
            console.warn("Failed to cleanup test tasks:", error);
        });

        // Clean up boards since they depend on users
        await context.delete("/api/boards/cleanup-test").catch(error => {
            console.warn("Failed to cleanup test boards:", error);
        });

        // Finally clean up users
        await context.delete("/api/users/cleanup-test").catch(error => {
            console.warn("Failed to cleanup test users:", error);
        });
    } finally {
        await context.dispose();
    }
} 