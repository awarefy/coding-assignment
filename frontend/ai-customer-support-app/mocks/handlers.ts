import { http, HttpResponse } from "msw";
import type { 
  AIResponseContent, 
  ChatMessage, 
  ChatRequest, 
  ChatResponse, 
  MessagesResponse 
} from "./types";

const mockMessages: ChatMessage[] = [
  {
    id: "msg_1",
    role: "user",
    content: "Hello, can you help me with something?"
  },
  {
    id: "msg_2",
    role: "assistant",
    content: JSON.stringify({
      response: "Yes, I'd be happy to help. What would you like to know?",
      suggested_questions: [
        "Tell me about your features",
        "Can you help with coding?",
        "Show me some markdown examples"
      ]
    })
  },
  {
    id: "msg_3",
    role: "user", 
    content: "How do I create a markdown list?"
  },
  {
    id: "msg_4",
    role: "assistant",
    content: JSON.stringify({
      response: "Here's a markdown list example:\n- Item 1\n- Item 2\n- Item 3",
      suggested_questions: [
        "Can you add more items?",
        "Show me a numbered list",
        "How do I create nested lists?"
      ]
    })
  }
];

const generateAIResponse = (message: string): AIResponseContent => {
  let response = "";
  let suggestedQuestions: string[] = [];
  
  const lowerCaseMessage = message.toLowerCase();
  
  switch (true) {
    case lowerCaseMessage.includes("hello"):
      response = "Hello there! How can I help you today?";
      suggestedQuestions = [
        "Can you tell me about your features?",
        "What can you help me with?",
        "How does this chat work?"
      ];
      break;
    case lowerCaseMessage.includes("help"):
      response = "I'm here to help! What do you need assistance with?";
      suggestedQuestions = [
        "I need help with my order",
        "Can you explain your return policy?",
        "Tell me about your services"
      ];
      break;
    case lowerCaseMessage.includes("list"):
      response = "Here's a markdown list:\n- Item 1\n- Item 2\n- Item 3";
      suggestedQuestions = [
        "Can you add more items?",
        "Show me a numbered list",
        "How do I create nested lists?"
      ];
      break;
    default:
      response = "Thanks for your message. Is there anything specific you'd like to know?";
      suggestedQuestions = [
        "Tell me about your services",
        "I need help with my account",
        "What are your business hours?"
      ];
  }

  return {
    response,
    suggested_questions: suggestedQuestions
  };
};

export const handlers = [
  http.post("/api/chat", async ({ request }) => {
    const reqBody = await request.json() as ChatRequest;
    const { messages } = reqBody;

    const lastUserMessage =
      messages?.filter((msg) => msg.role === "user").pop()?.content || "";

    const aiResponseContent = generateAIResponse(lastUserMessage);
    
    // If the message contains "long", delay for 3 seconds
    if (lastUserMessage.toLowerCase().includes("long")) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    const response: ChatResponse = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: JSON.stringify(aiResponseContent),
    };
    
    return HttpResponse.json(response, { status: 200 });
  }),

  http.get("/api/chat/messages", () => {
    const response: MessagesResponse = {
      messages: mockMessages
    };
    return HttpResponse.json(response, { status: 200 });
  }),
];