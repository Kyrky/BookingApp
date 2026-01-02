"use client";

import { useState } from "react";

interface SettingsProps {
  onClose: () => void;
}

export function Settings({ onClose }: SettingsProps) {
  const [cleanupResult, setCleanupResult] = useState<{ deleted: number; errors: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCleanupImages() {
    if (!confirm("This will delete all unused images. Continue?")) {
      return;
    }

    setLoading(true);
    setCleanupResult(null);

    try {
      const response = await fetch("http://localhost:3001/api/cleanup/images", {
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        setCleanupResult(data.data);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Cleanup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Storage Management</h3>
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-900 mb-2">Image Cleanup</h4>
            <p className="text-xs text-slate-600 mb-3">
              Remove all unused images from the server that are not linked to any property.
            </p>
            <button
              onClick={handleCleanupImages}
              disabled={loading}
              className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {loading ? "Cleaning up..." : "Cleanup Unused Images"}
            </button>
            {cleanupResult && (
              <div className="mt-3 text-sm">
                <p className="text-green-600 font-medium">Deleted {cleanupResult.deleted} files</p>
                {cleanupResult.errors.length > 0 && (
                  <p className="text-orange-600 text-xs mt-1">
                    {cleanupResult.errors.length} errors occurred
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Application Info</h3>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Version</span>
            <span className="text-slate-900 font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Environment</span>
            <span className="text-slate-900 font-medium">Development</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">API Status</span>
            <span className="text-green-600 font-medium">Connected</span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200">
        <button
          onClick={onClose}
          className="w-full px-4 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
        >
          Close Settings
        </button>
      </div>
    </div>
  );
}
