"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import InputField from "@/components/InputField";
import SubmitButton from "@/components/SubmitButton";
import Link from "next/link";
import {FiMail} from "react-icons/fi";
import {FaUserAlt} from "react-icons/fa";
import {RiLockPasswordLine} from "react-icons/ri";
import {useMessage} from "@/contexts/MessageContext";

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        confirm_password: "",
    });

    const { showMessage } = useMessage();

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        showMessage("");
        showMessage("");

        if (form.password !== form.confirm_password) {
            showMessage({type: "error", text: "Passwords do not match"});
            return;
        }

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/register/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();

            if (res.ok) {
                showMessage({type: "success", text: data.msg});
                setForm({ username: "", email: "", password: "", confirm_password: "" });
                setTimeout(() => router.push("/auth/login/"), 3000);
            } else {
                showMessage({type: "error", text: Object.values(data).flat().join(" ")});
            }
        } catch (err) {
            showMessage({type: "error", text: "Something went wrong"});
        }
    };

    return (
        <div className="page-wrapper">
            <div className="card">
                <h2 className="heading">Let’s Get You Started</h2>

                <form onSubmit={handleSubmit} className="space-y-3 mb-4">
                    <InputField
                        name="username"
                        placeholder="Username"
                        label="Username"
                        value={form.username}
                        onChange={handleChange}
                        icon={FaUserAlt}
                    />
                    <InputField
                        name="email"
                        type="email"
                        placeholder="name@company.com"
                        label="Email"
                        value={form.email}
                        onChange={handleChange}
                        icon={FiMail}
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
                    <SubmitButton text="Register"/>
                </form>
                <p className="text-sm font-light text-gray-500">
                    Already have an account? <Link href="/auth/login/"
                                                className="link">Login
                    here</Link>
                </p>

            </div>
        </div>
    );
}
