import axiosInstance from "../axios";

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
}

export interface ChatbotContext {
    current_page?: string;
    user_role?: string;
    [key: string]: any;
}

export interface ChatbotRequest {
    message: string;
    conversation_history?: ChatMessage[];
    context?: ChatbotContext;
}

export interface ChatbotResponse {
    response: string;
    model: string;
}

const chatbotService = {
    sendMessage: async (request: ChatbotRequest): Promise<ChatbotResponse> => {
        const res = await axiosInstance.post('/chatbot/chat', request);
        return res.data.data;
    }
};

export default chatbotService;

