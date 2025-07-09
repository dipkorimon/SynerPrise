'use client';

import { createContext, useState, useContext } from 'react';

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
    const [message, setMessage] = useState(null);

    const showMessage = (msg) => {
        setMessage(msg);
        setTimeout(() => setMessage(null), 3000);
    };

    return (
        <MessageContext.Provider value={{ message, showMessage, setMessage }}>
            {children}
        </MessageContext.Provider>
    );
};

export const useMessage = () => useContext(MessageContext);
