import Link from "next/link";

export default function SidebarItem({ href, icon, label, collapsed, onClick }) {
    return (
        <Link
            href={href}
            onClick={(e) => {
                e.preventDefault();
                if (onClick) onClick();
            }}
            className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
        >
            {icon}
            {!collapsed && <span>{label}</span>}
        </Link>
    );
}