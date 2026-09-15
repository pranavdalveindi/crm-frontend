"use client";

import { useState } from "react";
import api from "../../lib/api";
import { CallListEntry, CallOutcome } from "../../types";

const priorityStyle: Record<string, string> = {
  HIGH:   "border-l-red-500",
  MEDIUM: "border-l-amber-400",
  LOW:    "border-l-gray-300",
};

const priorityBadge: Record<string, string> = {
  HIGH:   "bg-red-50 text-red-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  LOW:    "bg-gray-100 text-gray-500",
};

const statusBadge: Record<string, string> = {
  PENDING:   "bg-amber-50 text-amber-700",
  LOCKED:    "bg-blue-50 text-blue-700",
  ATTEMPTED: "bg-blue-50 text-blue-700",
  RESOLVED:  "bg-green-50 text-green-700",
  ESCALATED: "bg-purple-50 text-purple-700",
};

const ISSUE_TAGS = [
  "Black Screen",
  "Meter Rejected",
  "WiFi Subscription Ended",
  "No Viewership",
  "Field Visit Required",
  "Other",
];

const OUTCOMES: { value: CallOutcome; label: string }[] = [
  { value: "RESOLVED",  label: "Resolved" },
  { value: "NO_ANSWER", label: "No answer" },
  { value: "CALLBACK",  label: "Callback requested" },
  { value: "ESCALATED", label: "Escalate to manager" },
];

interface Props {
  entry: CallListEntry;
  onStatusChange: () => void;
}

export default function HouseholdCard({ entry, onStatusChange }: Props) {
  const [showForm, setShowForm]     = useState(false);
  const [calling, setCalling]       = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [outcome, setOutcome]       = useState<CallOutcome | "">("");
  const [tags, setTags]             = useState<string[]>([]);
  const [notes, setNotes]           = useState("");
  const [formError, setFormError]   = useState("");

  const isResolved = entry.status === "RESOLVED";

  const handleCall = async () => {
    setCalling(true);
    try {
      // Lock the household
      await api.patch(`/crm/call-list/${entry.id}/lock`);
      // In future: initiate Twilio call here
      setShowForm(true);
    } catch {
      setFormError("Failed to initiate call");
    } finally {
      setCalling(false);
    }
  };

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!outcome) { setFormError("Select an outcome"); return; }
    setFormError("");
    setSubmitting(true);
    try {
      await api.patch(`/crm/call-list/${entry.id}/status`, {
        outcome,
        issueTags: tags,
        notes,
      });
      setShowForm(false);
      onStatusChange();
    } catch {
      setFormError("Failed to save outcome");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`bg-white border border-gray-100 border-l-4 ${priorityStyle[entry.priority]} rounded-xl p-5 ${isResolved ? "opacity-60" : ""}`}>

      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">

          {/* Badges row */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-sm font-medium text-gray-900 font-mono">{entry.deviceId}</span>
            {entry.hhid && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{entry.hhid}</span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityBadge[entry.priority]}`}>
              {entry.priority}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[entry.status]}`}>
              {entry.status}
            </span>
          </div>

          {/* Contact info */}
          <p className="text-sm text-gray-500 mb-1">
            {entry.contactName && <span>👤 {entry.contactName}</span>}
            {entry.city && <span className="ml-3">📍 {entry.city}{entry.region ? `, ${entry.region}` : ""}</span>}
          </p>

          {/* Reason */}
          {entry.reason && (
            <p className="text-xs text-gray-400">⚠️ {entry.reason}</p>
          )}

        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          {entry.maskedPhone && (
            <span className="text-xs text-gray-400">{entry.maskedPhone}</span>
          )}
          {!isResolved && (
            <button
              onClick={showForm ? undefined : handleCall}
              disabled={calling || showForm}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              📞 {calling ? "Connecting..." : "Call"}
            </button>
          )}
          {isResolved && (
            <span className="text-xs text-green-600 font-medium">✓ Done</span>
          )}
        </div>
      </div>

      {/* Post-call form */}
      {showForm && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-600 mb-3">Log call outcome</p>

          {/* Outcome selection */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {OUTCOMES.map((o) => (
              <button
                key={o.value}
                onClick={() => setOutcome(o.value)}
                className={`px-3 py-2 text-xs rounded-lg border text-left transition-colors ${
                  outcome === o.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>

          {/* Issue tags */}
          <p className="text-xs text-gray-500 mb-2">Issue tags (optional)</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {ISSUE_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  tags.includes(tag)
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Notes */}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes (optional)..."
            rows={2}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />

          {formError && (
            <p className="text-xs text-red-600 mb-2">{formError}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Saving..." : "Submit"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>

        </div>
      )}

    </div>
  );
}