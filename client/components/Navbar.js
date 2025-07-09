"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FaUserCircle } from "react-icons/fa";
import Link from "next/link";
import {FiBell, FiHelpCircle, FiHome, FiInfo, FiLogOut, FiMail, FiSettings, FiTrendingUp} from "react-icons/fi";
import {RiLockPasswordLine} from "react-icons/ri";
import SidebarItem from "@/components/SidebarItem";
import {appVersion} from "@/system/version";

export default function Navbar() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

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


    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    const handleLogout = async () => {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/logout/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${localStorage.getItem("token")}`,
                },
            });

            if (res.ok) {
                localStorage.removeItem("token");
                setIsLoggedIn(false);
                setDropdownOpen(false);

                setTimeout(() => {
                    router.push("/");
                }, 1500);
            } else {
                console.error("Logout failed");
            }
        } catch (error) {
            console.error("Logout error", error);
        }
    };

    return (
        <nav className="bg-gray-900 border-b border-gray-800 px-10 py-3 flex items-center justify-between text-white">
            <div className="flex items-center gap-2 text-gray-300 text-xl font-bold">
                <Link href="/">
                    SynerPrise
                </Link>
                <span className="bg-gray-700 px-2 py-0.5 rounded text-xs font-mono select-none">v{appVersion}</span>
            </div>


            <Link
                href="#"
                className="bg-gray-800 text-white px-5 py-2 rounded-lg shadow-sm flex items-center gap-3 hover:bg-gray-700 transition-all text-sm"
            >
                <FiInfo className="text-yellow-400 animate-bounce" size={18} />
                <span className="font-medium">Discover what’s new in <span className="font-semibold">SynerPrise</span></span>
            </Link>

            {!isLoggedIn ? (
                <Link
                    href="/auth/login/"
                    className="px-6 py-2 font-bold tracking-wide text-gray-300 capitalize transition-colors duration-300 transform bg-gray-800 rounded-lg hover:bg-gray-700 focus:outline-none cursor-pointer"
                >
                    Sign In
                </Link>
            ) : (
                <div className="relative flex gap-5" ref={dropdownRef}>
                    <Link
                        href="#"
                        className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-sm font-bold rounded-lg shadow hover:from-yellow-500 hover:to-yellow-700 flex items-center gap-2"
                    >
                        <FiTrendingUp />
                        Upgrade Plan
                    </Link>
                    <button
                        onClick={toggleDropdown}
                        className="text-white hover:text-gray-300 focus:outline-none cursor-pointer"
                        aria-label="User menu"
                    >
                        <FaUserCircle size={28} />
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 mt-10 w-auto min-w-[250px] bg-gray-900 border border-gray-700 rounded-md shadow-lg z-50">
                            <ul className="text-sm text-gray-300 p-2">
                                <SidebarItem href="#" icon={<FiMail size={18} />} label={userInfo?.email || "No email"} />
                                <SidebarItem href="/auth/change-password/" icon={<RiLockPasswordLine size={18} />} label="Change Password" />
                                <SidebarItem href="#" icon={<FiTrendingUp size={18} />} label="Upgrade Plan" />
                                <SidebarItem href="#" icon={<FiSettings size={18} />} label="Settings" />
                                <hr className="border-gray-700" />
                                <SidebarItem href="/" icon={<FiHelpCircle size={18} />} label="Help" />
                                <li
                                    className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-500 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                                    onClick={handleLogout}
                                >
                                    <FiLogOut className="text-red-500" size={18} />
                                    <Link href="#">Log out</Link>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </nav>

    );
}
