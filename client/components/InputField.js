"use client";

import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function InputField({
   name,
   type = "text",
   value,
   onChange,
   placeholder,
   label,
   icon: Icon,
}) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
        <div className="input-field mb-4">
            <label htmlFor={name} className="block mb-1 text-sm font-semibold tracking-wide text-gray-600">
                {label}
            </label>
            <div className="relative">
                {Icon && (
                    <span className="absolute inset-y-0 left-0 flex items-center px-3 text-gray-500 border-r border-gray-300">
                        <Icon size={20} />
                    </span>
                )}
                <input
                    type={inputType}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 ${
                        Icon ? "pl-14" : ""
                    } ${isPassword ? "pr-12" : ""}`}
                    required
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 focus:outline-none"
                    >
                        {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                    </button>
                )}
            </div>
        </div>
    );
}
