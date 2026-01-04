"use client";

import { useAuth } from "@/contexts/auth-context";

export default function SettingsPage() {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Please log in to view your settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Settings</h1>

      <div className="max-w-2xl space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Name</label>
              <p className="text-sm text-slate-900">{user.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Email</label>
              <p className="text-sm text-slate-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Role</label>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  isAdmin
                    ? "bg-purple-100 text-purple-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Account Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">User ID</label>
              <p className="text-sm text-slate-600 font-mono">{user.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">Member Since</label>
              <p className="text-sm text-slate-600">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">
                Last Updated
              </label>
              <p className="text-sm text-slate-600">
                {new Date(user.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-purple-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-purple-800">Admin Account</span>
            </div>
            <p className="text-xs text-purple-600 mt-1">
              You have full administrative access to the platform.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
