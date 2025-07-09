import {FaRegCopy, FaRegEdit} from "react-icons/fa";

export default function CodeBlockHeader(props) {
    return (
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-1 bg-gray-900 backdrop-blur-sm z-10">
            <span className="text-xs text-gray-300 font-semibold select-none">Python</span>
            <div className="flex items-center justify-end">
                <button
                    onClick={() => navigator.clipboard.writeText(props.msg)}
                    className=" flex items-center gap-1 text-gray-300 text-xs font-semibold hover:bg-gray-800 px-2 py-1 rounded transition cursor-pointer"
                >
                    <FaRegCopy />
                    <span>Copy</span>
                </button>
                <button className=" flex items-center gap-1 text-gray-300 text-xs font-semibold hover:bg-gray-800 px-2 py-1 rounded transition cursor-pointer">
                    <FaRegEdit />
                    <span>Edit</span>
                </button>
            </div>
        </div>
    )
}