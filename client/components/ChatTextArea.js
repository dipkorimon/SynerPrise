import InsightIQ from "@/components/InsightIQ";
import MicButton from "@/components/MicButton";
import SendButton from "@/components/SendButton";

export default function ChatTextArea(props) {
    return (
        <div className="px-4 py-3 w-200 sticky bottom-0 bg-gray-200 rounded-4xl max-w-3xl mx-auto">
            <div className="flex flex-col gap-1">
                {/* Textarea with transparent bg */}
                <textarea
                    rows={1}
                    className="w-full rounded-t-xl px-4 py-3 text-md bg-transparent font-bold-medium focus:outline-none resize-none placeholder-gray-500 shadow-none max-h-300 overflow-y-auto scrollbar-hide"
                    placeholder="What's on your mind?"
                    value={props.value}
                    onChange={props.onChange}
                    onKeyDown={props.onKeyDown}
                />

                {/* Bottom row with Tools text and icons */}
                <div className="flex items-center justify-between rounded-b-xl px-4 py-2">
                    <div className="text-gray-600 font-sm select-none">
                        <InsightIQ
                            type="button"
                            ariaLabel="Insight IQ feature"
                        />

                    </div>

                    <div className="flex items-center gap-4">
                        <MicButton
                            type="button"
                            ariaLabel="Start microphone"
                        />
                        <SendButton
                            sendMessage={props.sendMessage}
                            disabled={props.disabled}
                            type="button"
                            ariaLabel="Send Message"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}