import {useEffect, useState} from "react";
import { FiSettings, FiSun, FiTool } from "react-icons/fi";
import {FaCode} from "react-icons/fa";
import {IoIosNotifications} from "react-icons/io";
import {MdManageAccounts} from "react-icons/md";
import DeleteAccount from "@/components/DeleteAccount";
import {appVersion} from "@/system/version";

export default function Settings() {
    const [selectedTab, setSelectedTab] = useState("user-preferences");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) setIsLoggedIn(true);
    }, []);

    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            setIsLoggedIn(true);

            const fetchUserInfo = async () => {
                const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

                try {
                    const res = await fetch(`${API_BASE_URL}/api/users/user-info/`, {
                        headers: {
                            Authorization: `Token ${token}`,
                        },
                    });

                    if (res.ok) {
                        const data = await res.json();
                        setUserInfo(data);
                    } else {
                        console.error("Failed to fetch user info");
                    }
                } catch (err) {
                    console.error("Error fetching user info", err);
                }
            };

            fetchUserInfo();
        }
    }, []);

    const tabs = [
        { key: "user-preferences", label: "User Preferences", icon: <FiSettings size={20} /> },
        { key: "appearance", label: "Appearance", icon: <FiSun size={20} /> },
        { key: "code-output-settings", label: "Code Output Settings", icon: <FaCode size={20} /> },
        { key: "notifications-and-alerts", label: "Notifications & Alerts", icon: <IoIosNotifications size={20} /> },
        { key: "advanced", label: "Advanced", icon: <FiTool size={20} /> },
        { key: "account", label: "Account", icon: <MdManageAccounts size={20} /> },
    ];

    const renderSettingsContent = () => {
        switch (selectedTab) {
            case "user-preferences":
                return (
                    <div className="pl-4">
                        <h1 className="text-2sm font-semibold mb-3">User Preferences</h1>
                        <SettingItem label="Default Language" value="English" />
                        <SettingItem label="Auto Save" value="Enabled" />
                        <SettingItem label="Input method (text vs. voice vs. file)" value="Text" />
                        <SettingItem label="Timeout for generation" value="10 Minutes" />
                        <SettingItem label="Auto-generate code after typing" value="off" />
                    </div>
                );
            case "appearance":
                return (
                    <div className="pl-4">
                        <h1 className="text-2sm font-semibold mb-3">Appearance</h1>
                        <SettingItem label="Theme" value="Light" />
                        <SettingItem label="Font Size" value="Medium" />
                    </div>
                );
            case "code-output-settings":
                return (
                    <div className="pl-4">
                        <h1 className="text-2sm font-semibold mb-3">Code Output Settings</h1>
                        <SettingItem label="Code style" value="Functinal" />
                        <SettingItem label="Import library preference" value="Standard" />
                        <SettingItem label="Auto format with Black" value="off" />
                        <SettingItem label="Output format" value="Plain text" />
                    </div>
                )
            case "notifications-and-alerts":
                return (
                    <div className="pl-4">
                        <h1 className="text-2sm font-semibold mb-3">Notifications and Alerts</h1>
                        <SettingItem label="Email on success/fail of large batch" value="on" />
                        <SettingItem label="In-app notifications" value="off" />
                        <SettingItem label="Weekly summary email" value="off" />
                    </div>
                )
            case "advanced":
                return (
                    <div className="pl-4">
                        <h1 className="text-2sm font-semibold mb-3">Advanced Options</h1>
                        <SettingItem label="Developer Mode" value="Off" />
                        <SettingItem label="Cache Reset" value="Available" />
                    </div>
                )
            case "account":
                return (
                    <div className="pl-4">
                        <h1 className="text-2sm font-semibold mb-3">Account Settings</h1>
                        <SettingItem label="Delete account" value={
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded hover:bg-red-700 transition cursor-pointer"
                            >
                                Delete
                            </button>} />
                        {isModalOpen && <DeleteAccount onClose={() => setIsModalOpen(false)} />}
                        <SettingItem label="Email" value={userInfo.email} />
                    </div>
                )
            default:
                return null;
        }
    };

    return (
        <div className="min-h-120 bg-gray-900 flex">
            {/* Sidebar */}
            <nav className="w-72 bg-gray-900 border-r border-gray-400 pr-4 flex flex-col">
                <ul className="flex-1">
                    {tabs.map((tab) => (
                        <li key={tab.key}>
                            <button
                                onClick={() => setSelectedTab(tab.key)}
                                className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm text-gray-300 font-medium w-full text-left cursor-pointer
                  ${
                                    selectedTab === tab.key
                                        ? "bg-gray-800"
                                        : "text-gray-300 hover:bg-gray-800"
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        </li>
                    ))}
                </ul>
                {/* Optional footer */}
                <div className="text-xs text-gray-400 mt-8 font-bold">v{appVersion}</div>
            </nav>

            {/* Content */}
            <main className="flex-1 px-2 overflow-y-auto">
                {renderSettingsContent()}
            </main>
        </div>
    );
}

function SettingItem({ label, value }) {
    return (

        <div className="flex justify-between items-center rounded-md px-4 py-2">
            <span className="text-gray-300 text-sm">{label}</span>
            <span className="text-gray-400 text-sm">{value}</span>
        </div>
    );
}
