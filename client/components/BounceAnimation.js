export default function BounceAnimation(props) {
    return (
        <div className="p-4 border-t border-gray-700 flex justify-center items-center">
            <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                    <span
                        key={i}
                        className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.2}s` }}
                    />
                ))}
            </div>
        </div>
    )
}