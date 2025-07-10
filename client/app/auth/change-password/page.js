"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import InputField from "@/components/InputField";
import SubmitButton from "@/components/SubmitButton";
import Link from "next/link";
import {RiLockPasswordLine} from "react-icons/ri";
import {useMessage} from "@/contexts/MessageContext";

export default function ChangePasswordPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        old_password: "",
        new_password: "",
        confirm_new_password: "",
    });

    const { showMessage } = useMessage();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        showMessage("");
        showMessage("")

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/change-password/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (res.ok) {
                showMessage({type: "success", text: data.msg});
                setForm({
                    old_password: "",
                    new_password: "",
                    confirm_new_password: "",
                });

                setTimeout(() => {
                    router.push("/auth/login/");
                }, 1500);
            } else {
                showMessage({type: "error", text: data.error || "Something went wrong"});
            }
        } catch (err) {
            showMessage({type: "error", text: "Network error"});
        }
    };

    return (
        <div className="page-wrapper">
            <div className="card">
                <h2 className="heading">Change Password</h2>
                <form onSubmit={handleSubmit} className="space-y-3 mb-4">
                    <InputField
                        name="old_password"
                        type="password"
                        placeholder="Old Password"
                        label="Old Password"
                        value={form.old_password}
                        onChange={handleChange}
                        icon={RiLockPasswordLine}
                    />
                    <InputField
                        name="new_password"
                        type="password"
                        placeholder="New Password"
                        label="New Password"
                        value={form.new_password}
                        onChange={handleChange}
                        icon={RiLockPasswordLine}
                    />
                    <InputField
                        name="confirm_new_password"
                        type="password"
                        placeholder="Confirm New Password"
                        label="Confirm New Password"
                        value={form.confirm_new_password}
                        onChange={handleChange}
                        icon={RiLockPasswordLine}
                    />
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input id="terms" aria-describedby="terms" type="checkbox"
                                   className="w-4 h-4 border border-gray-300 rounded bg-gray-50"
                                   required/>
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="terms" className="font-light text-gray-500">I accept
                                the <Link className="link"
                                       href="#">Terms and Conditions</Link></label>
                        </div>
                    </div>
                    <SubmitButton text="Change Password"/>
                </form>
            </div>
        </div>
    );
}
