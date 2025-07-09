import {FiSend} from "react-icons/fi";

export default function SendButton (props) {
    return (
        <button
            onClick={props.sendMessage}
            disabled={props.disabled}
            className="text-gray-800 disabled:text-gray-400 cursor-pointer"
            type={props.type}
            aria-label={props.ariaLabel}
        >
            <FiSend  size={20} />
        </button>
    )
}