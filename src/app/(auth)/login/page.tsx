"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "../../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/call-list");
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { msg?: string } } })?.response?.data?.msg ||
        "Invalid credentials. Please check your email and password.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col justify-between font-sans text-[#172B4D] selection:bg-[#DEEBFF] selection:text-[#0052CC]">
      
      {/* Top Bar */}
      <header className="px-6 py-4 border-b border-[#DFE1E6] bg-white flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#0052CC] rounded-[4px] flex items-center justify-center text-white font-bold text-base shadow-xs">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-bold text-base text-[#172B4D]">CRM Portal</span>
        </Link>
        <Link href="/" className="text-xs font-semibold text-[#0052CC] hover:underline flex items-center gap-1">
          <span>&larr; Back to Landing Page</span>
        </Link>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          
          <div className="bg-white border border-[#DFE1E6] rounded-[8px] p-8 shadow-[0_4px_16px_rgba(9,30,66,0.08)]">
            
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-[#DEEBFF] text-[#0052CC] rounded-[6px] mx-auto flex items-center justify-center mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-2xl font-extrabold text-[#172B4D] tracking-tight">Sign in to your account</h1>
              <p className="text-xs text-[#5E6C84] mt-1.5">Enter your operational credentials to access the CRM console</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DFE1E6] rounded-[4px] focus:outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-[#DEEBFF] transition-all text-[#172B4D] placeholder:text-[#A5ADBA]"
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172B4D] mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DFE1E6] rounded-[4px] focus:outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-[#DEEBFF] transition-all text-[#172B4D] placeholder:text-[#A5ADBA]"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="bg-[#FFEBE6] border border-[#FFBDAD] text-[#BF2600] text-xs font-medium px-3.5 py-2.5 rounded-[4px] flex items-start gap-2">
                  <span className="text-sm">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white font-semibold text-sm rounded-[4px] shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In &rarr;</span>
                )}
              </button>

            </form>

            {/* Roles Info Box */}
            <div className="mt-6 pt-5 border-t border-[#DFE1E6]">
              <p className="text-[11px] font-bold text-[#5E6C84] uppercase tracking-wider mb-2 text-center">
                Supported Access Roles
              </p>
              <div className="flex justify-center gap-2 flex-wrap text-[11px]">
                <span className="bg-[#DEEBFF] text-[#0052CC] px-2.5 py-1 rounded-full font-semibold">
                  Developer
                </span>
                <span className="bg-[#EAE6FF] text-[#403294] px-2.5 py-1 rounded-full font-semibold">
                  Panel Manager
                </span>
                <span className="bg-[#E3FCEF] text-[#006644] px-2.5 py-1 rounded-full font-semibold">
                  Call Agent
                </span>
              </div>
            </div>

          </div>

          {/* Security badge */}
          <div className="text-center mt-6 text-xs text-[#5E6C84] flex items-center justify-center gap-1.5">
            <svg className="w-4 h-4 text-[#36B37E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Secured Session &bull; Enterprise 256-bit Encryption</span>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[#5E6C84] border-t border-[#DFE1E6] bg-white">
        &copy; {new Date().getFullYear()} Inditronics CRM Portal. All rights reserved.
      </footer>

    </div>
  );
}