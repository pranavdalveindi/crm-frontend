"use client";

import { useState, useEffect } from "react";
import api from "../../../lib/api";
import { CallListEntry, CallListStatus } from "../../../types";
import HouseholdCard from "../../../components/call-list/HouseholdCard";

const statusFilters: { label: string; value: CallListStatus | "ALL" }[] = [
  { label: "All",       value: "ALL" },
  { label: "Pending",   value: "PENDING" },
  { label: "Attempted", value: "ATTEMPTED" },
  { label: "Resolved",  value: "RESOLVED" },
];

export default function CallListPage() {
  const [entries, setEntries]       = useState<CallListEntry[]>([]);
  const [filter, setFilter]         = useState<CallListStatus | "ALL">("ALL");
  const [loading, setLoading]       = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError]           = useState("");

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await api.get("/crm/call-list/today");
      setEntries(res.data.data.households ?? []);
    } catch {
      setError("Failed to load call list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    api.get("/crm/call-list/today")
      .then((res) => {
        if (!ignore) setEntries(res.data.data.households ?? []);
      })
      .catch(() => {
        if (!ignore) setError("Failed to load call list");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.post("/crm/call-list/generate");
      await fetchList();
    } catch {
      setError("Failed to generate call list");
    } finally {
      setGenerating(false);
    }
  };

  const filtered = filter === "ALL"
    ? entries
    : entries.filter((e) => e.status === filter);

  const counts = {
    total:    entries.length,
    pending:  entries.filter((e) => e.status === "PENDING").length,
    attempted:entries.filter((e) => e.status === "ATTEMPTED").length,
    resolved: entries.filter((e) => e.status === "RESOLVED").length,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h1 className="text-xl font-medium text-gray-900">Your call list</h1>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {generating ? "Generating..." : "↻ Refresh list"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Assigned",  value: counts.total,     color: "text-gray-900" },
          { label: "Pending",   value: counts.pending,   color: "text-amber-600" },
          { label: "Attempted", value: counts.attempted, color: "text-blue-600" },
          { label: "Resolved",  value: counts.resolved,  color: "text-green-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-100 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
            <p className={`text-2xl font-medium ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f.value
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white border border-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-sm">No households in this category</p>
          {entries.length === 0 && (
            <p className="text-xs mt-1">Click &quot;Refresh list&quot; to generate today&apos;s call list</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <HouseholdCard
              key={entry.id}
              entry={entry}
              onStatusChange={fetchList}
            />
          ))}
        </div>
      )}
    </div>
  );
}