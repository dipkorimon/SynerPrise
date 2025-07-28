import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory (like __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from parent directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
        NEXT_PUBLIC_FRONTEND_BASE_URL: process.env.NEXT_PUBLIC_FRONTEND_BASE_URL,
        NEXT_PUBLIC_SYNERPRISE_MODEL_BASE_URL: process.env.NEXT_PUBLIC_SYNERPRISE_MODEL_BASE_URL,
    },
};

export default nextConfig;
