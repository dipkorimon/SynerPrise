"use client";

import {useEffect, useRef, useState} from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import {isPureCode} from "@/system/utils";
import CodeBlockHeader from "@/components/CodeBlockHeader";
import ChatTextArea from "@/components/ChatTextArea";

export default function ChatBox() {
    const [messages, setMessages] = useState([
        {id: 1, from: "assistant", text: "Hello! I'm SynerPrise. How can I help you?"},
    ]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = {id: Date.now(), from: "user", text: input.trim()};
        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

        try {
            const response = await fetch(`${API_BASE_URL}/api/generate-code/index/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({userMessage: userMessage.text}),
            });

            const data = await response.json();

            if (response.ok) {
                const assistantReply = data.generated_code;
                setMessages((prev) => [
                    ...prev,
                    {id: Date.now() + 1, from: "assistant", text: assistantReply},
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now() + 1,
                        from: "assistant",
                        text: data.error || "Sorry, I couldn't understand that.",
                    },
                ]);
            }
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {id: Date.now() + 1, from: "assistant", text: "Error fetching response."},
            ]);
        }
    };

    const simulateTypingResponse = (text) =>
        new Promise((resolve) => setTimeout(() => resolve(text), 1000));

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    function autoResize(textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 300)}px`;
    }

    return (
        <div className="flex flex-col h-full w-200">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-hidden">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${
                            msg.from === "user" ? "justify-end" : "justify-start"
                        }`}
                    >
                        <div>
                            {msg.from === "user" ? (
                                <p className="text-md font-bold-medium bg-gray-200 px-4 py-2 rounded-4xl max-h-[300px] max-w-150 overflow-y-auto">{msg.text}</p>
                            ) : (
                                isPureCode(msg.text) ? (
                                    <div className="relative rounded-xl overflow-auto scrollbar-hide group w-full min-w-192">
                                        {/* Code block header inside */}
                                        <CodeBlockHeader msg={msg.text} />

                                        {/* Syntax highlighted code */}
                                        <SyntaxHighlighter
                                            language="python"
                                            style={oneDark}
                                            customStyle={{
                                                padding: "1rem",
                                                paddingTop: "1.5rem",
                                                margin: 0,
                                                marginTop: "1rem",
                                                fontSize: "0.875rem",
                                                lineHeight: "1.5",
                                                borderRadius: "1rem",
                                            }}
                                        >
                                            {msg.text}
                                        </SyntaxHighlighter>
                                    </div>

                                ) : (
                                    <p className="text-md font-bold-medium bg-gray-200 px-4 py-2 rounded-4xl overflow-y-auto">{msg.text}</p>
                                )
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef}/>
            </div>
            <ChatTextArea
                value={input}
                onChange={(e) => {
                    setInput(e.target.value);
                    autoResize(e.target);
                }}
                onKeyDown={handleKeyDown}
                sendMessage={sendMessage}
                disabled={!input.trim()}
            />
        </div>
    );
}
