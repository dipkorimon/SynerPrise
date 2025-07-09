import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import ClientWrapper from "@/app/ClientWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "SynerPrise",
    template: "%s | SynerPrise",
  },
  description: "AI-Enhanced Bangla Natural Language Interface for Python Code Generation\n" +
      "\n",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
