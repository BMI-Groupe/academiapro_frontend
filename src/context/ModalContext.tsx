// src/contexts/ModalContext.tsx
import React, { createContext, useState, useContext, ReactNode } from "react";

type ModalContent = ReactNode | (() => ReactNode);

type ModalProps = {
    title?: string;
    description?: string;
    content?: ModalContent;
    /** visual variant: error | success | info */
    variant?: "error" | "success" | "info" | "warning" | "danger";
    /** primary action button */
    primaryLabel?: string;
    primaryAction?: () => void;
};

type ModalContextType = {
    openModal: (modalProps: ModalProps) => void;
    closeModal: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [modalContent, setModalContent] = useState<ModalProps | null>(null);

    const openModal = (props: ModalProps) => {
        setModalContent(props);
    };

    const closeModal = () => {
        setModalContent(null);
    };

    return (
        <ModalContext.Provider value={{ openModal, closeModal }}>
            {children}

            {/* Modal UI */}
            {modalContent && (
                <div className="fixed inset-0 flex items-center justify-center bg-white/10 dark:bg-black/30 backdrop-blur-sm z-50">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl max-w-[700px] w-full m-4 relative shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
                        <button
                            onClick={closeModal}
                            aria-label="Close modal"
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            ✖
                        </button>

                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 mt-1">
                                {modalContent.variant === 'error' && (
                                    <div className="bg-red-100 text-red-600 w-12 h-12 rounded-full flex items-center justify-center">
                                        !
                                    </div>
                                )}
                                {modalContent.variant === 'success' && (
                                    <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center">
                                        ✓
                                    </div>
                                )}
                                {(!modalContent.variant || modalContent.variant === 'info') && (
                                    <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center">
                                        i
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                {modalContent.title && (
                                    <h4 className="mb-1 text-xl font-semibold text-gray-800 dark:text-white/90">
                                        {modalContent.title}
                                    </h4>
                                )}
                                {modalContent.description && (
                                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                                        {modalContent.description}
                                    </p>
                                )}

                                {modalContent.content && (
                                    <div className="mb-4">
                                        {typeof modalContent.content === "function"
                                            ? (modalContent.content as () => ReactNode)()
                                            : modalContent.content}
                                    </div>
                                )}

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={closeModal}
                                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    >
                                        Fermer
                                    </button>

                                    {modalContent.primaryLabel && (
                                        <button
                                            onClick={() => {
                                                if (modalContent.primaryAction) {
                                                    try {
                                                        modalContent.primaryAction();
                                                    } catch (e) {
                                                        console.error(e);
                                                    }
                                                }
                                                closeModal();
                                            }}
                                            className="px-4 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600"
                                        >
                                            {modalContent.primaryLabel}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ModalContext.Provider>
    );
};

export const useCustomModal = () => {
    const context = useContext(ModalContext);
    if (!context) throw new Error("useModal must be used within a ModalProvider");
    return context;
};
