import React, { createContext, useContext, useState } from 'react';

const AiContext = createContext();

export const useAi = () => {
  const context = useContext(AiContext);
  if (!context) {
    throw new Error('useAi must be used within an AiProvider');
  }
  return context;
};

export const AiProvider = ({ children }) => {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const openAiModal = () => setIsAIModalOpen(true);
  const closeAiModal = () => setIsAIModalOpen(false);

  return (
    <AiContext.Provider value={{ isAIModalOpen, openAiModal, closeAiModal }}>
      {children}
    </AiContext.Provider>
  );
};
