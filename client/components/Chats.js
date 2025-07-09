export default function Chats(props) {
    return (
        <div
            className="flex-1 overflow-y-auto px-2 mt-3"
            style={{
                scrollbarWidth: "none",       // Firefox
                msOverflowStyle: "none",      // IE/Edge
            }}
        >
            <style jsx>{`
                    div::-webkit-scrollbar {
                        display: none; /* Chrome, Safari */
                    }
                `}</style>

            {!props.collapsed && (
                <>
                    <div className="px-4 mb-2 text-gray-400 text-sm font-bold-medium">Chats</div>

                    <button
                        className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 rounded-lg transition-colors">
                        John from Tech Support
                    </button>
                    <button
                        className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 rounded-lg transition-colors">
                        Jane from HR Team
                    </button>
                    <button
                        className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 rounded-lg transition-colors">
                        AI Chat Assistant Bot
                    </button>
                </>
            )}
        </div>
    )
}