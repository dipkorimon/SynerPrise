import CloseButton from "@/components/CloseButton";

export default function Modal(props) {
    return (
        <div
            className="fixed inset-0 z-50 grid place-content-center bg-black/50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modalTitle"
        >
            <div className="w-full min-w-200 min-h-120 rounded-lg bg-gray-900 px-8 py-4 shadow-lg">
                <div className="flex justify-between">
                    <h2 id="modalTitle" className="text-xl font-bold text-gray-300">{props.title}</h2>
                    <CloseButton onClose={props.onClose} />
                </div>

                <div className="mt-4">
                    {/*Modal content*/}
                    {props.content}
                </div>
            </div>
        </div>
    );
}
