"use client";

import InputField from "@/components/InputField";
import SubmitButton from "@/components/SubmitButton";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {FaUserAlt} from "react-icons/fa";
import {RiLockPasswordLine} from "react-icons/ri";
import {useMessage} from "@/contexts/MessageContext";

export default function LoginPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        username: "",
        password: "",
    });

    const { showMessage } = useMessage();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        showMessage("");
        showMessage("");

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/login/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.token) {
                    localStorage.setItem("token", data.token);
                }

                showMessage({type: "success", text: data.msg || "Login successful"});
                showMessage("");

                setTimeout(() => {
                    router.push("/");
                }, 1500);
            } else {
                showMessage({type: "error", text: data.detail || data.error || "Invalid credentials"});
                showMessage("");
            }
        } catch (err) {
            showMessage({type: "error", text: "Server error"});
            showMessage("");
        }
    };

    return (
        <div className="page-wrapper">
            <div className="card">
                <h2 className="heading">Good to See You Again</h2>

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
                        name="password"
                        type="password"
                        placeholder="Password"
                        label="Password"
                        value={form.password}
                        onChange={handleChange}
                        icon={RiLockPasswordLine}
                    />
                    <div className="flex items-center justify-between">
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input id="remember" aria-describedby="remember" type="checkbox"
                                       className="w-4 h-4 border border-gray-300 rounded bg-gray-50"
                                       required=""/>
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="remember" className="text-gray-500">Remember
                                    me</label>
                            </div>
                        </div>
                        <Link href="/auth/password-reset" className="link">Forgot Password?</Link>
                    </div>
                    <SubmitButton text="Sign in"/>
                </form>
                <p className="text-sm font-light text-gray-500">
                    Don’t have an account yet? <Link href="/auth/register/"
                                                     className="link">Register
                    here</Link>
                </p>

            </div>
        </div>
    );
}