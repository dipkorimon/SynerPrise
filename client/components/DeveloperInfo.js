export default function DeveloperInfo (props) {
    return (
        <div className="p-4 border-t border-gray-700">
            <div className="text-center">
                <p className="text-sm text-gray-400">Crafted with ❤️ by</p>
                <p className="text-sm font-semibold text-gray-300">{props.name}</p>
                <div className="mt-2 flex justify-center gap-4 text-gray-400 text-sm">
                    <a
                        href={props.linkedInProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link"
                    >
                        LinkedIn
                    </a>
                    <a
                        href={props.email}
                        className="link"
                    >
                        Email
                    </a>
                    <a
                        href={props.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link"
                    >
                        GitHub
                    </a>
                </div>
            </div>
        </div>
    )
}