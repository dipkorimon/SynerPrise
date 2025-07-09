export default function CancelButton({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="bg-gray-800 text-gray-300 font-bold px-6 py-2 rounded hover:bg-gray-700 cursor-pointer"
        >
            Cancel
        </button>
    );
}
