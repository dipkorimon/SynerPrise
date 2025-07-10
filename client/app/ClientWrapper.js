"use client";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { MessageProvider } from '@/contexts/MessageContext';
import MessageBox from "@/components/MessageBox";

export default function ClientWrapper({ children }) {

    return (
        <MessageProvider>
            <MessageBox />
            <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <div className="flex flex-col flex-1">
                    <Navbar />
                    <main className="flex-1 overflow-y-auto bg-gray-50">
                        {children}
                    </main>
                </div>
            </div>
        </MessageProvider>
    );
}
