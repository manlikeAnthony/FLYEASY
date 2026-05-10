import React from "react";
import Navbar from "../components/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-200"
      style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
    >
      <Navbar />

      <main className="flex-1 px-4 py-8 max-w-6xl mx-auto w-full">
        {children}
      </main>

      <footer
        className="text-center text-sm py-6"
        style={{ color: "var(--muted)" }}
      >
        © {new Date().getFullYear()} FlyEasyNG
      </footer>
    </div>
  );
}
