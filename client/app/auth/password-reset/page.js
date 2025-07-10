"use client";

import InputField from "@/components/InputField";
import SubmitButton from "@/components/SubmitButton";
import { useState } from "react";
import {useRouter} from "next/navigation";
import {FiMail} from "react-icons/fi";
import {useMessage} from "@/contexts/MessageContext";

export default function PasswordResetRequestPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const { showMessage } = useMessage();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        showMessage("");{message && <p className="success-text">{message}</p>}
                {error && <p className="error-text">{error}</p>}
        showMessage("");

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/password-reset/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, redirect_url: process.env.NEXT_PUBLIC_FRONTEND_BASE_URL, }),
            });

            const data = await res.json();

            if (!res.ok) {
                showMessage(data.error || "Something went wrong");
            } else {
                showMessage(data.message);

                setTimeout(() => {
                    router.push("/auth/password-reset-confirm");
                }, 1500);
            }
        } catch (err) {
            showMessage("Network error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <div className="card">
                <h2 className="heading">Request Password Reset</h2>
                <p className="text-sm text-muted-foreground mb-4">
                    Enter your email address and we’ll send you a reset page link along with your UID and token. Use them to set a new password.
                </p>

                <form onSubmit={handleSubmit} className="space-y-3 mb-4">
                    <InputField
                        name="email"
                        type="email"
                        placeholder="name@company.com"
                        label="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        icon={FiMail}
                    />
                    <SubmitButton text={loading ? "Sending..." : "Send Reset Link"} />
                </form>
            </div>
        </div>
    );
}
