import {FiMic} from "react-icons/fi";

export default function MicButton(props) {
    return (
        <button
            className="text-gray-600 hover:text-gray-800 cursor-pointer"
            aria-label={props.ariaLabel}
            type={props.type}
        >
            <FiMic size={20} />
        </button>
    )
}