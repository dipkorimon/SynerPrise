import {FiCpu} from "react-icons/fi";

export default function InsightIQ(props) {
    return (
        <button
            type={props.type}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-3 py-1 cursor-pointer rounded-md border border-gray-300 transition"
            aria-label={props.ariaLabel}
        >
            <FiCpu size={20} />
            <span>InsightIQ</span>
        </button>
    )
}