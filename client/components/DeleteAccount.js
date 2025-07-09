import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import {useRouter} from "next/navigation";
import DeleteButton from "@/components/DeleteButton";
import CancelButton from "@/components/CancelButton";
import {useMessage} from "@/contexts/MessageContext";

export default function DeleteAccount(props) {
    const [step, setStep] = useState("confirm");
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");
    const router = useRouter();
    const { showMessage } = useMessage();

    const handleDelete = async () => {
        if (!password) {
            showMessage({ type: "error", text: "Password is required" });
            return;
        }

        setStep("loading");
        showMessage(null);

        // Show spinner minimum 2 seconds
        await new Promise((r) => setTimeout(r, 2000));

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://127.0.0.1:8000/api/auth/delete-account/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`,
                },
                body: JSON.stringify({ password }),
            });

            if (res.status === 204) {
                setStep("success");
                showMessage({ type: "success", text: "Account deleted successfully." });
                setTimeout(() => {
                    localStorage.removeItem("token");
                    router.push("/");
                }, 2000);
            } else {
                const data = await res.json();
                setStep("confirm");
                showMessage({ type: "error", text: data.detail || "Something went wrong" });
            }
        } catch (error) {
            setStep("confirm");
            showMessage({ type: "error", text: "Server error. Please try again later." });
        }
    };

    return (
        <div className="fixed inset-0 z-50 grid place-content-center bg-black/50">
            <div className="w-full max-w-md rounded-lg bg-gray-900 text-gray-300 p-5 shadow-lg relative">
                {step === "confirm" && (
                    <>
                        <h2 className="text-xl font-bold mb-2">Confirm Account Deletion</h2>
                        <p className="mb-4 text-sm">
                            Please enter your password to permanently delete your account. This action is irreversible.
                        </p>

                        <div className="relative flex items-center">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border px-3 py-2 rounded mb-4 bg-gray-800 border-gray-700 text-gray-300 placeholder-gray-500 pr-10 focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 cursor-pointer"
                            >
                                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>
                        </div>
                        <div className="flex justify-between">
                            <DeleteButton onClick={handleDelete} />
                            <CancelButton onClick={props.onClose} />
                        </div>
                    </>
                )}

                {step === "loading" && (
                    <div className="text-center">
                        <p className="mb-2 text-sm w-full">Deleting your account...</p>
                        <span className="animate-spin h-5 w-5 border-4 border-gray-600 border-t-red-600 rounded-full inline-block"></span>
                    </div>
                )}

                {step === "success" && (
                    <>
                        <h2 className="text-xl font-bold text-green-400 mb-2">Account Deleted</h2>
                        <p className="text-sm text-gray-400">Your account has been successfully deleted.</p>
                    </>
                )}
            </div>
        </div>
    );
}
