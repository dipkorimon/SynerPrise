"use client";

import InputField from "@/components/InputField";
import SubmitButton from "@/components/SubmitButton";
import { useState } from "react";
import {useRouter} from "next/navigation";
import {FaUserAlt} from "react-icons/fa";
import {RiLockPasswordLine, RiTokenSwapLine} from "react-icons/ri";
import {useMessage} from "@/contexts/MessageContext";

export default function ResetPasswordConfirmPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        uid: "",
        token: "",
        password: "",
        confirm_password: "",
    });

    const [loading, setLoading] = useState(false);

    const { showMessage } = useMessage();

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/password-reset-confirm/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                showMessage({type: "error", text: data.error || "Something went wrong"});
            } else {
                showMessage({type:"success", text: data.msg || "Password reset successful"});

                setTimeout(() => {
                    router.push("/auth/login");
                }, 1500);
            }
        } catch (err) {
            showMessage({type: "error", text: "Network error"});
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <div className="card">
                <h2 className="heading">Set a New Password</h2>
                <p className="text-sm text-muted-foreground mb-4">
                    Enter your UID and token from the email, then choose a new password to reset your account access.
                </p>

                <form onSubmit={handleSubmit} className="space-y-3 mb-4">
                    <InputField
                        name="uid"
                        placeholder="UID"
                        label="UID"
                        value={form.uid}
                        onChange={handleChange}
                        icon={FaUserAlt}
                    />
                    <InputField
                        name="token"
                        placeholder="Token"
                        label="Token"
                        value={form.token}
                        onChange={handleChange}
                        icon={RiTokenSwapLine}
                    />
                    <InputField
                        name="password"
                        type="password"
                        placeholder="Password"
                        label="Password"
                        value={form.password}
                        onChange={handleChange}
                        icon={RiLockPasswordLine}
                    />
                    <InputField
                        name="confirm_password"
                        type="password"
                        placeholder="Confirm Password"
                        label="Confirm Password"
                        value={form.confirm_password}
                        onChange={handleChange}
                        icon={RiLockPasswordLine}
                    />
                    <SubmitButton text={loading ? "Resetting..." : "Reset Password"} />
                </form>
            </div>
        </div>
    );
}
