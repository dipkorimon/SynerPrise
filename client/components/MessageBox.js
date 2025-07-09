'use client';

import { useMessage } from '@/contexts/MessageContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

export default function MessageBox() {
    const { message, setMessage } = useMessage();
    const boxRef = useRef(null);

    useEffect(() => {
        if (!message) return;
        const handleClickOutside = (e) => {
            if (boxRef.current && !boxRef.current.contains(e.target)) {
                setMessage(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [message, setMessage]);

    if (!message) return null;

    // Define bg colors based on message type
    const bgColor = message.type === 'success'
        ? 'bg-green-100 text-green-800 border-green-300'
        : 'bg-red-100 text-red-800 border-red-300';

    return (
        <AnimatePresence>
            <motion.div
                key="message"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] pointer-events-none"
            >
                <div
                    ref={boxRef}
                    className={`pointer-events-auto px-6 py-2 text-sm font-bold rounded-md border shadow-lg w-full text-center ${bgColor}`}
                >
                    {message.text}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
