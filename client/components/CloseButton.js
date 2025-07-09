import {IoMdClose} from "react-icons/io";

export default function CloseButton(props) {
    return (
        <button
            type="button"
            onClick={props.onClose}
            className="-me-7 -mt-4 rounded-full p-3 text-gray-300 transition-colors hover:bg-gray-800 focus:outline-none cursor-pointer"
            aria-label="Close"
        >
            <IoMdClose size={20} />
        </button>
    )
}