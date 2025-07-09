"use client";

import InputField from "@/components/InputField";
import SubmitButton from "@/components/SubmitButton";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {FaUserAlt} from "react-icons/fa";
import {RiLockPasswordLine} from "react-icons/ri";

export default function LoginPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        username: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

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

                setSuccess(data.msg || "Login successful");
                setError("");

                setTimeout(() => {
                    router.push("/");
                }, 1500);
            } else {
                setError(data.detail ||data.error || "Invalid credentials");
                setSuccess("");
            }
        } catch (err) {
            setError("Server error");
            setSuccess("");
        }
    };

    return (
        <div className="page-wrapper">
            <div className="card">
                <h2 className="heading">Good to See You Again</h2>
                {error && <p className="error-text">{error}</p>}
                {success && <p className="success-text">{success}</p>}

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