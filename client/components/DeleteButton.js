export default function DeleteButton({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="bg-red-600 text-white font-bold px-6 py-2 rounded hover:bg-red-700 cursor-pointer"
        >
            Delete Account
        </button>
    );
}
