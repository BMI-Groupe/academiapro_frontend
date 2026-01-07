import { useState, useRef, useEffect } from "react";
import { ChatIcon, CloseLineIcon, PaperPlaneIcon } from "../../icons";
import chatbotService, { ChatMessage, ChatbotContext } from "../../api/services/chatbotService";
import useAuth from "../../providers/auth/useAuth";
import { useLocation } from "react-router";

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const location = useLocation();
    
    // @ts-ignore
    const { userData, userInfo } = useAuth();

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Initialize with welcome message when chat opens
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const welcomeMessage: ChatMessage = {
                role: 'assistant',
                content: `Salut${userData?.name ? ` ${userData.name}` : ''} ! 👋\n\nJe suis AcademiaPro, votre assistant virtuel disponible 24/7 pour la plateforme de gestion scolaire.\n\nJe peux vous aider avec :\n• **Gestion** : Ajouter ou gérer des élèves, notes, bulletins, paiements\n• **Informations** : Horaires, dates clés, procédures d'inscription\n• **Support** : Réponses aux questions courantes sur le fonctionnement de l'école\n• **Navigation** : Vous guider dans l'utilisation de la plateforme\n\nComment puis-je vous aider aujourd'hui ?`,
                timestamp: new Date(),
            };
            setMessages([welcomeMessage]);
        }
    }, [isOpen, userData]);

    const getCurrentPageName = () => {
        const path = location.pathname;
        const pageNames: { [key: string]: string } = {
            '/': 'Tableau de bord',
            '/students': 'Gestion des élèves',
            '/students/new': 'Ajouter un élève',
            '/teachers': 'Gestion des enseignants',
            '/teachers/new': 'Ajouter un enseignant',
            '/classrooms': 'Gestion des classes',
            '/classrooms/new': 'Ajouter une classe',
            '/subjects': 'Gestion des matières',
            '/subjects/new': 'Ajouter une matière',
            '/grades': 'Gestion des notes',
            '/grades/new': 'Ajouter une note',
            '/payments': 'Gestion des paiements',
            '/payments/new': 'Nouveau paiement',
            '/schedules': 'Emplois du temps',
            '/schedules/new': 'Nouvel emploi du temps',
        };
        return pageNames[path] || path;
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            role: 'user',
            content: inputMessage.trim(),
            timestamp: new Date(),
        };

        // Add user message immediately
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInputMessage("");
        setIsLoading(true);

        try {
            // Build context
            const context: ChatbotContext = {
                current_page: getCurrentPageName(),
                user_role: userInfo?.role || userData?.role || 'guest',
            };

            // Send to API
            const response = await chatbotService.sendMessage({
                message: userMessage.content,
                conversation_history: messages.map(m => ({
                    role: m.role,
                    content: m.content,
                })),
                context,
            });

            // Add assistant response
            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: response.response,
                timestamp: new Date(),
            };

            setMessages([...newMessages, assistantMessage]);
        } catch (error) {
            console.error('Chatbot error:', error);
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: "Désolé, une erreur est survenue. Veuillez réessayer plus tard.",
                timestamp: new Date(),
            };
            setMessages([...newMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleClearChat = () => {
        setMessages([]);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    // Convert simple markdown to HTML (bold, line breaks)
    const formatMessage = (text: string) => {
        // Convert **text** to <strong>text</strong>
        let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Convert line breaks to <br>
        formatted = formatted.replace(/\n/g, '<br>');
        return formatted;
    };

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-[100000] flex items-center justify-center w-14 h-14 bg-brand-500 text-white rounded-full shadow-lg hover:bg-brand-600 transition-all duration-300 hover:scale-110"
                    aria-label="Ouvrir le chatbot"
                >
                    <ChatIcon className="w-6 h-6" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-[100000] w-96 h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-brand-500 text-white rounded-t-2xl">
                        <div className="flex items-center gap-2">
                            <ChatIcon className="w-5 h-5" />
                            <h3 className="font-semibold text-sm">Assistant Virtuel</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            {messages.length > 1 && (
                                <button
                                    onClick={handleClearChat}
                                    className="p-1 hover:bg-white/20 rounded transition-colors"
                                    aria-label="Effacer la conversation"
                                    title="Effacer la conversation"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/20 rounded transition-colors"
                                aria-label="Fermer le chatbot"
                            >
                                <CloseLineIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                        message.role === 'user'
                                            ? 'bg-brand-500 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                    }`}
                                >
                                    <p 
                                        className="text-sm break-words"
                                        dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                                    />
                                    {message.timestamp && (
                                        <p className={`text-xs mt-1 ${
                                            message.role === 'user' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                                        }`}>
                                            {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Tapez votre message..."
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputMessage.trim() || isLoading}
                                className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                                aria-label="Envoyer le message"
                            >
                                <PaperPlaneIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                            Appuyez sur Entrée pour envoyer
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatbotWidget;

