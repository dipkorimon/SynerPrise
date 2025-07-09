"use client";

export default function SubmitButton({ text }) {
    return (
        <button
            type="submit"
            className="w-full px-6 py-2 font-bold tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-900 rounded-lg hover:bg-blue-800 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-80 cursor-pointer"
        >
            {text}
        </button>
    );
}
