import Link from "next/link";
import {PiBrainDuotone} from "react-icons/pi";
import {FiMenu} from "react-icons/fi";
import {useState} from "react";

export default function SidebarToggle(props) {
    return (
        <div className="flex items-center justify-between px-4 py-3 mb-2">
            <Link href="/" className={`text-xl font-semibold transition-all ${props.collapsed ? 'hidden' : 'block'}`}>
                <PiBrainDuotone size={20} />
            </Link>
            <button
                onClick={props.onClick}
                className="focus:outline-none cursor-pointer"
            >
                <FiMenu size={20} />
            </button>
        </div>
    )
}