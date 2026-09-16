"use client";

import { useState } from "react";
import api from "../../lib/api";
import { CRMUser } from "../../types";

interface Props {
  onSuccess: (updatedUser: CRMUser) => void;
}

export default function ChangePasswordDialog({ onSuccess }: Props) {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }
    if (form.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    if (form.currentPassword === form.newPassword) {
      setError("New password must be different from current password");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      onSuccess(res.data.data.user);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { msg?: string } } })?.response?.data?.msg ?? "Failed to change password";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6">

        <div className="mb-5">
          <h2 className="text-base font-medium text-gray-900">Change your password</h2>
          <p className="text-sm text-gray-400 mt-1">
            You need to set a new password before continuing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Current password</label>
            <input
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">New password</label>
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Confirm new password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Saving..." : "Set new password"}
          </button>

        </form>
      </div>
    </div>
  );
}