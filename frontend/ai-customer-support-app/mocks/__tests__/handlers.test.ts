import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { server } from "../server";
import { http } from "msw";
import type {
	ChatRequest,
	ChatResponse,
	MessagesResponse,
	AIResponseContent,
} from "../types";

// Start mock server before tests
beforeAll(() => {
	server.listen();
});

// Reset request handlers after each test
afterEach(() => {
	server.resetHandlers();
});

// Close server after all tests
afterAll(() => {
	server.close();
});

describe("Chat API Handlers", () => {
	// Test for /api/chat endpoint
	describe("POST /api/chat", () => {
		it("should return appropriate AI response based on user message", async () => {
			const chatRequest: ChatRequest = {
				messages: [
					{
						id: "test-id-1",
						role: "user",
						content: "hello",
					},
				],
			};

			const response = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(chatRequest),
			});

			const data = (await response.json()) as ChatResponse;

			expect(response.status).toBe(200);
			expect(data).toHaveProperty("id");
			expect(data).toHaveProperty("role", "assistant");
			expect(data).toHaveProperty("content");

			const content = JSON.parse(data.content) as AIResponseContent;
			expect(content).toHaveProperty("response");
			expect(content).toHaveProperty("suggested_questions");
			expect(content.suggested_questions).toBeInstanceOf(Array);
		});

		it("should return response with markdown list based on list message", async () => {
			const chatRequest: ChatRequest = {
				messages: [
					{
						id: "test-id-3",
						role: "user",
						content: "How do I create a list?",
					},
				],
			};

			const response = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(chatRequest),
			});

			const data = (await response.json()) as ChatResponse;
			const content = JSON.parse(data.content) as AIResponseContent;

			expect(response.status).toBe(200);
			expect(content.response).toContain("- Item");
		});

		it('should return delayed response based on message containing "long"', async () => {
			// Extend timeout
			vi.setConfig({ testTimeout: 4000 });

			const startTime = Date.now();

			const chatRequest: ChatRequest = {
				messages: [
					{
						id: "test-id-4",
						role: "user",
						content: "Can you give me a long explanation?",
					},
				],
			};

			const response = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(chatRequest),
			});

			const endTime = Date.now();
			const timeTaken = endTime - startTime;

			expect(response.status).toBe(200);
			expect(timeTaken).toBeGreaterThanOrEqual(3000);

			// Reset timeout setting
			vi.setConfig({ testTimeout: 5000 });
		});
	});

	// Test for /api/chat/messages endpoint
	describe("GET /api/chat/messages", () => {
		it("should return list of mock messages", async () => {
			const response = await fetch("/api/chat/messages");
			const data = (await response.json()) as MessagesResponse;

			expect(response.status).toBe(200);
			expect(data).toHaveProperty("messages");
			expect(data.messages).toBeInstanceOf(Array);
			expect(data.messages.length).toBeGreaterThan(0);

			// Verify structure of the first message
			const firstMessage = data.messages[0];
			expect(firstMessage).toHaveProperty("id");
			expect(firstMessage).toHaveProperty("role");
			expect(firstMessage).toHaveProperty("content");
		});
	});

	// Test for handler override
	describe("Handler Override", () => {
		it("should be able to override server handler", async () => {
			// Temporarily override handler
			server.use(
				http.get("/api/chat/messages", () => {
					const customResponse: MessagesResponse = {
						messages: [
							{
								id: "custom-id",
								role: "user",
								content: "Custom test message",
							},
						],
					};

					return new Response(JSON.stringify(customResponse), {
						status: 200,
						headers: { "Content-Type": "application/json" },
					});
				}),
			);

			const response = await fetch("/api/chat/messages");
			const data = (await response.json()) as MessagesResponse;

			expect(response.status).toBe(200);
			expect(data.messages[0].id).toBe("custom-id");
			expect(data.messages[0].content).toBe("Custom test message");
		});
	});
});
