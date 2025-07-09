"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { MessageProvider } from '@/contexts/MessageContext';
import MessageBox from "@/components/MessageBox";

export default function ClientWrapper({ children }) {
    const pathname = usePathname();

    // Hide Navbar on these paths
    const hideNavbar =
        pathname === "/auth/login" || pathname === "/auth/register" || pathname === "/auth/password-reset" || pathname === "/auth/password-reset-confirm";

    return (
        <MessageProvider>
            <MessageBox />
            <div className="flex h-screen overflow-hidden">
                {!hideNavbar && <Sidebar />}

                <div className="flex flex-col flex-1">
                    {!hideNavbar && <Navbar />}
                    <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
                        {children}
                    </main>
                </div>
            </div>
        </MessageProvider>
    );
}
