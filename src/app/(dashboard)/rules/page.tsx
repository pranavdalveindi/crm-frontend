"use client";

import { useState, useEffect } from "react";
import api from "../../../lib/api";
import { Rule, Priority, RulePreview, RuleSchema } from "../../../types";
import { useAuth } from "../../../hooks/useAuth";
import { useRouter } from "next/navigation";

// Fallback schema used if API schema endpoint is loading or unavailable
const DEFAULT_SCHEMA: RuleSchema = [
  {
    eventType: 36,
    name: "Connectivity Status",
    category: "System Telemetry",
    description: "Monitors hardware device online/offline ping telemetry events",
    fields: [
      {
        name: "connectivity",
        label: "Connectivity Ping",
        type: "boolean",
        operators: ["no_event", "equals"],
        defaultOperator: "no_event",
        defaultValue: false,
      },
      {
        name: "signal_strength",
        label: "Signal Strength (%)",
        type: "number",
        operators: ["less_than", "greater_than", "equals"],
        defaultOperator: "less_than",
        defaultValue: 30,
      },
    ],
  },
  {
    eventType: 3,
    name: "Member Declaration",
    category: "Audience Activity",
    description: "Tracks household member check-in and activity declarations",
    fields: [
      {
        name: "all_members_inactive",
        label: "All Household Members Inactive",
        type: "boolean",
        operators: ["all_inactive", "equals"],
        defaultOperator: "all_inactive",
        defaultValue: true,
      },
    ],
  },
  {
    eventType: 30,
    name: "Image Unrecognized",
    category: "Vision Processing",
    description: "Evaluates camera image recognition drops and optical errors",
    fields: [
      {
        name: "recognition_status",
        label: "Optical Recognition Status",
        type: "string",
        operators: ["no_event", "equals", "contains"],
        defaultOperator: "no_event",
        defaultValue: "unrecognized",
      },
    ],
  },
  {
    eventType: 42,
    name: "Audio Fingerprint",
    category: "Audio Processing",
    description: "Monitors watermark audio confidence and channel matching",
    fields: [
      {
        name: "match_confidence",
        label: "Watermark Match Confidence (%)",
        type: "number",
        operators: ["less_than", "equals"],
        defaultOperator: "less_than",
        defaultValue: 50,
      },
    ],
  },
];

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export default function RulesManagementPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Core State
  const [rules, setRules]               = useState<Rule[]>([]);
  const [schema, setSchema]             = useState<RuleSchema>(DEFAULT_SCHEMA);
  const [loadingRules, setLoadingRules] = useState(true);
  const [toasts, setToasts]             = useState<Toast[]>([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery]   = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "ALL">("ALL");

  // Builder Modal State
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRule, setEditingRule]     = useState<Rule | null>(null);
  const [activeStep, setActiveStep]       = useState<1 | 2 | 3>(1);
  const [savingRule, setSavingRule]       = useState(false);
  const [formError, setFormError]         = useState("");

  // Form Field State
  const [formName, setFormName]                 = useState("");
  const [formDesc, setFormDesc]                 = useState("");
  const [formPriority, setFormPriority]         = useState<Priority>("HIGH");
  const [formLookback, setFormLookback]         = useState<number>(4);
  const [formEventType, setFormEventType]       = useState<number>(36);
  const [formField, setFormField]               = useState<string>("connectivity");
  const [formOperator, setFormOperator]         = useState<string>("no_event");
  const [formValue, setFormValue]               = useState<boolean | number | string>(false);
  const [formMinDays, setFormMinDays]           = useState<number>(3);

  // Live Preview Modal State
  const [previewRule, setPreviewRule]         = useState<Rule | null>(null);
  const [previewData, setPreviewData]         = useState<RulePreview | null>(null);
  const [previewLoading, setPreviewLoading]   = useState(false);
  const [previewPage, setPreviewPage]         = useState(1);

  // Toast Helper
  const addToast = (type: "success" | "error" | "info", message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Auth Protection Guard
  useEffect(() => {
    if (!loading && user && user.role !== "developer" && user.role !== "panel_manager") {
      router.push("/call-list");
    }
  }, [user, loading, router]);

  // Fetch Rules & Schema
  const fetchRules = async () => {
    try {
      setLoadingRules(true);
      const res = await api.get("/crm/rules");
      setRules(res.data.data ?? []);
    } catch {
      addToast("error", "Failed to load rules list");
    } finally {
      setLoadingRules(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    api.get("/crm/rules/schema")
      .then((res) => {
        if (!ignore && res.data?.data && Array.isArray(res.data.data)) {
          setSchema(res.data.data);
        }
      })
      .catch(() => {});

    api.get("/crm/rules")
      .then((res) => {
        if (!ignore) setRules(res.data.data ?? []);
      })
      .catch(() => {
        if (!ignore) addToast("error", "Failed to load rules list");
      })
      .finally(() => {
        if (!ignore) setLoadingRules(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Handle Event Type Change in Builder
  const handleEventTypeChange = (newEventType: number) => {
    setFormEventType(newEventType);
    const selectedSchema = schema.find((s) => s.eventType === newEventType) || schema[0];
    if (selectedSchema && selectedSchema.fields.length > 0) {
      const firstField = selectedSchema.fields[0];
      setFormField(firstField.name);
      setFormOperator(firstField.defaultOperator);
      setFormValue(firstField.defaultValue ?? false);
    }
  };

  // Handle Field Change in Builder
  const handleFieldChange = (newFieldName: string) => {
    setFormField(newFieldName);
    const selectedSchema = schema.find((s) => s.eventType === formEventType) || schema[0];
    const fieldObj = selectedSchema.fields.find((f) => f.name === newFieldName);
    if (fieldObj) {
      setFormOperator(fieldObj.defaultOperator);
      setFormValue(fieldObj.defaultValue ?? false);
    }
  };

  // Open Builder for Create
  const openCreateModal = () => {
    setEditingRule(null);
    setFormName("");
    setFormDesc("");
    setFormPriority("HIGH");
    setFormLookback(4);
    setFormEventType(36);
    const firstSchema = schema[0];
    if (firstSchema && firstSchema.fields.length > 0) {
      const firstField = firstSchema.fields[0];
      setFormField(firstField.name);
      setFormOperator(firstField.defaultOperator);
      setFormValue(firstField.defaultValue ?? false);
    }
    setFormMinDays(3);
    setActiveStep(1);
    setFormError("");
    setShowFormModal(true);
  };

  // Open Builder for Edit
  const openEditModal = (rule: Rule) => {
    setEditingRule(rule);
    setFormName(rule.name);
    setFormDesc(rule.description ?? "");
    setFormPriority(rule.priority);
    setFormLookback(rule.lookbackDays);
    setFormEventType(rule.eventType);

    const cond = (rule.condition as Record<string, unknown>) || {};
    setFormField((cond.field as string) || "connectivity");
    setFormOperator((cond.operator as string) || "no_event");
    setFormValue((cond.value as boolean | number | string) ?? false);
    setFormMinDays((cond.min_days as number) || 3);

    setActiveStep(1);
    setFormError("");
    setShowFormModal(true);
  };

  // Save Rule (Create / Edit)
  const handleSaveRule = async () => {
    if (!formName.trim()) {
      setFormError("Rule Name is required");
      setActiveStep(1);
      return;
    }

    setSavingRule(true);
    setFormError("");

    const payload = {
      name: formName.trim(),
      description: formDesc.trim(),
      eventType: formEventType,
      priority: formPriority,
      lookbackDays: formLookback,
      condition: {
        field: formField,
        operator: formOperator,
        value: formValue,
        min_days: formMinDays,
      },
    };

    try {
      if (editingRule) {
        await api.put(`/crm/rules/${editingRule.id}`, payload);
        addToast("success", `Rule "${formName}" updated successfully`);
      } else {
        await api.post("/crm/rules", payload);
        addToast("success", `New rule "${formName}" created successfully`);
      }
      setShowFormModal(false);
      fetchRules();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { msg?: string } } })?.response?.data?.msg || "Failed to save rule";
      setFormError(msg);
      addToast("error", msg);
    } finally {
      setSavingRule(false);
    }
  };

  // Toggle Rule Status (Optimistic Update)
  const handleToggleStatus = async (rule: Rule) => {
    const nextStatus = !rule.isActive;
    setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, isActive: nextStatus } : r)));
    try {
      await api.patch(`/crm/rules/${rule.id}/toggle`, { isActive: nextStatus });
      addToast("success", `Rule "${rule.name}" is now ${nextStatus ? "Active" : "Inactive"}`);
    } catch {
      setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, isActive: !nextStatus } : r)));
      addToast("error", `Failed to toggle status for "${rule.name}"`);
    }
  };

  // Delete Rule
  const handleDeleteRule = async (rule: Rule) => {
    if (!confirm(`Are you sure you want to delete the rule "${rule.name}"?`)) return;
    try {
      await api.delete(`/crm/rules/${rule.id}`);
      addToast("success", `Rule "${rule.name}" deleted`);
      fetchRules();
    } catch {
      addToast("error", `Failed to delete rule "${rule.name}"`);
    }
  };

  // Open Preview Modal
  const openPreviewModal = async (rule: Rule) => {
    setPreviewRule(rule);
    setPreviewData(null);
    setPreviewLoading(true);
    setPreviewPage(1);
    try {
      const res = await api.get(`/crm/rules/${rule.id}/preview`);
      setPreviewData(res.data.data);
    } catch {
      addToast("error", "Failed to fetch live rule preview impact");
    } finally {
      setPreviewLoading(false);
    }
  };

  // Filter Rules
  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rule.description && rule.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      rule.eventType.toString().includes(searchQuery);

    const matchesPriority = priorityFilter === "ALL" || rule.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  // Current selected Event Type Schema info in Builder
  const currentEventTypeSchema = schema.find((s) => s.eventType === formEventType) || schema[0];
  const currentFieldSchema = currentEventTypeSchema?.fields.find((f) => f.name === formField) || currentEventTypeSchema?.fields[0];

  return (
    <div className="space-y-6">
      
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto px-4 py-3 rounded-[6px] text-xs font-bold shadow-[0_4px_12px_rgba(9,30,66,0.15)] flex items-center gap-2 border transition-all ${
              t.type === "success"
                ? "bg-[#E3FCEF] border-[#ABF5D1] text-[#006644]"
                : t.type === "error"
                ? "bg-[#FFEBE6] border-[#FFBDAD] text-[#BF2600]"
                : "bg-[#DEEBFF] border-[#B3D4FF] text-[#0052CC]"
            }`}
          >
            <span>{t.type === "success" ? "✓" : t.type === "error" ? "⚠️" : "ℹ️"}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[8px] border border-[#DFE1E6] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#172B4D] tracking-tight">CRM Rule Engine</h1>
            <span className="bg-[#DEEBFF] text-[#0052CC] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-[#B3D4FF]">
              Rules Management
            </span>
          </div>
          <p className="text-xs text-[#5E6C84] mt-1">
            Define dynamic telemetry trigger rules, lookback days, and anomaly thresholds to generate daily agent call list queues.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white text-xs font-bold px-4 py-2.5 rounded-[4px] shadow-xs transition-all flex items-center justify-center gap-2 whitespace-nowrap self-start sm:self-center"
        >
          <span>+ Create New Rule</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rules by name, event type..."
            className="w-full text-xs bg-white border border-[#DFE1E6] rounded-[4px] pl-9 pr-3.5 py-2.5 text-[#172B4D] placeholder:text-[#A5ADBA] focus:outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-[#DEEBFF]"
          />
          <svg className="w-4 h-4 text-[#A5ADBA] absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-bold text-[#5E6C84]">Priority Filter:</span>
          {(["ALL", "HIGH", "MEDIUM", "LOW"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-bold transition-all ${
                priorityFilter === p
                  ? "bg-[#0052CC] text-white shadow-xs"
                  : "bg-white border border-[#DFE1E6] text-[#42526E] hover:bg-[#F4F5F7]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Section A: Rules Data Table / Cards */}
      {loadingRules ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white border border-[#DFE1E6] rounded-[6px] animate-pulse" />
          ))}
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="bg-white border border-[#DFE1E6] rounded-[8px] p-12 text-center text-[#5E6C84]">
          <div className="w-12 h-12 bg-[#DEEBFF] text-[#0052CC] rounded-full mx-auto flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <p className="text-sm font-bold text-[#172B4D]">No matching rules found</p>
          <p className="text-xs text-[#5E6C84] mt-1">Try adjusting your search query or create a new rule.</p>
        </div>
      ) : (
        <div className="bg-white border border-[#DFE1E6] rounded-[8px] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#EBECF0] border-b border-[#DFE1E6] text-[#5E6C84] uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Rule Name & Details</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Lookback Window</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE1E6]">
                {filteredRules.map((rule) => {
                  const cond = (rule.condition as Record<string, unknown>) || {};
                  return (
                    <tr key={rule.id} className="hover:bg-[#FAFBFC] transition-colors">
                      {/* Name & Description */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="font-bold text-sm text-[#172B4D]">{rule.name}</div>
                        {rule.description && (
                          <div className="text-xs text-[#5E6C84] mt-0.5 line-clamp-1">{rule.description}</div>
                        )}
                        <div className="text-[11px] font-mono text-[#5E6C84] bg-[#F4F5F7] px-2 py-0.5 rounded border border-[#DFE1E6] inline-block mt-1">
                          Condition: {JSON.stringify(cond)}
                        </div>
                      </td>

                      {/* Event Type Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="bg-[#EAE6FF] text-[#403294] border border-[#C0B6F2] font-bold text-[11px] px-2.5 py-1 rounded-full inline-flex items-center gap-1.5">
                          <span>Event {rule.eventType}</span>
                        </span>
                      </td>

                      {/* Priority Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`font-bold text-[11px] px-2.5 py-1 rounded-full border inline-block ${
                            rule.priority === "HIGH"
                              ? "bg-[#FFEBE6] text-[#BF2600] border-[#FFBDAD]"
                              : rule.priority === "MEDIUM"
                              ? "bg-[#FFF0B3] text-[#172B4D] border-[#FFE380]"
                              : "bg-[#DEEBFF] text-[#0052CC] border-[#B3D4FF]"
                          }`}
                        >
                          {rule.priority}
                        </span>
                      </td>

                      {/* Lookback Window */}
                      <td className="py-4 px-4 whitespace-nowrap text-[#172B4D] font-medium">
                        <span className="bg-[#F4F5F7] border border-[#DFE1E6] px-2.5 py-1 rounded-[4px]">
                          {rule.lookbackDays} Days
                        </span>
                      </td>

                      {/* Status Toggle Switch */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <label className="inline-flex items-center cursor-pointer gap-2">
                          <input
                            type="checkbox"
                            checked={rule.isActive}
                            onChange={() => handleToggleStatus(rule)}
                            className="sr-only peer"
                          />
                          <div className="relative w-9 h-5 bg-[#C1C7D0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#36B37E]"></div>
                          <span className={`font-bold text-[11px] ${rule.isActive ? "text-[#006644]" : "text-[#5E6C84]"}`}>
                            {rule.isActive ? "Active" : "Inactive"}
                          </span>
                        </label>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openPreviewModal(rule)}
                            className="px-2.5 py-1.5 bg-[#DEEBFF] text-[#0052CC] hover:bg-[#B3D4FF] font-bold rounded-[4px] border border-[#B3D4FF] transition-colors text-xs flex items-center gap-1"
                            title="Preview Impact"
                          >
                            <span>📊 Preview</span>
                          </button>
                          <button
                            onClick={() => openEditModal(rule)}
                            className="px-2.5 py-1.5 bg-white border border-[#DFE1E6] text-[#42526E] hover:bg-[#F4F5F7] hover:text-[#172B4D] font-bold rounded-[4px] transition-colors text-xs"
                            title="Edit Rule"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRule(rule)}
                            className="px-2.5 py-1.5 bg-[#FFEBE6] border border-[#FFBDAD] text-[#BF2600] hover:bg-[#FFBDAD] font-bold rounded-[4px] transition-colors text-xs"
                            title="Delete Rule"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section B: Dynamic Rule Builder Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[8px] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_12px_32px_rgba(9,30,66,0.25)] border border-[#DFE1E6] overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-[#EBECF0] px-6 py-4 border-b border-[#DFE1E6] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-[#172B4D]">
                  {editingRule ? "Edit Telemetry Rule" : "Create New Telemetry Rule"}
                </h2>
                <p className="text-xs text-[#5E6C84]">Configure event criteria and dynamic anomaly parameters</p>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-[#5E6C84] hover:text-[#172B4D] text-lg font-bold p-1 rounded hover:bg-[#DFE1E6]"
              >
                ✕
              </button>
            </div>

            {/* Step Wizard Nav */}
            <div className="bg-[#FAFBFC] border-b border-[#DFE1E6] px-6 py-3 flex items-center justify-between text-xs font-bold border-t">
              <button
                onClick={() => setActiveStep(1)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] transition-colors ${
                  activeStep === 1 ? "bg-[#0052CC] text-white" : "text-[#5E6C84] hover:bg-[#EBECF0]"
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
                <span>Basic Information</span>
              </button>

              <button
                onClick={() => setActiveStep(2)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] transition-colors ${
                  activeStep === 2 ? "bg-[#0052CC] text-white" : "text-[#5E6C84] hover:bg-[#EBECF0]"
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
                <span>Event Type Select</span>
              </button>

              <button
                onClick={() => setActiveStep(3)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] transition-colors ${
                  activeStep === 3 ? "bg-[#0052CC] text-white" : "text-[#5E6C84] hover:bg-[#EBECF0]"
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">3</span>
                <span>Dynamic Condition Builder</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              
              {/* Error Banner */}
              {formError && (
                <div className="bg-[#FFEBE6] border border-[#FFBDAD] text-[#BF2600] text-xs font-bold p-3.5 rounded-[4px] flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{formError}</span>
                </div>
              )}

              {/* STEP 1: Basic Information */}
              {activeStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#172B4D] mb-1 uppercase tracking-wider">
                      Rule Name *
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. No Connectivity for 3+ Days"
                      className="w-full text-xs bg-white border border-[#DFE1E6] rounded-[4px] px-3 py-2.5 text-[#172B4D] focus:outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-[#DEEBFF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#172B4D] mb-1 uppercase tracking-wider">
                      Description (Optional)
                    </label>
                    <textarea
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      placeholder="Describe the operational goal of this rule..."
                      rows={2}
                      className="w-full text-xs bg-white border border-[#DFE1E6] rounded-[4px] px-3 py-2 text-[#172B4D] focus:outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-[#DEEBFF] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#172B4D] mb-1 uppercase tracking-wider">
                        Priority *
                      </label>
                      <select
                        value={formPriority}
                        onChange={(e) => setFormPriority(e.target.value as Priority)}
                        className="w-full text-xs bg-white border border-[#DFE1E6] rounded-[4px] px-3 py-2 text-[#172B4D] focus:outline-none focus:border-[#0052CC]"
                      >
                        <option value="HIGH">HIGH (Red Alert)</option>
                        <option value="MEDIUM">MEDIUM (Orange Alert)</option>
                        <option value="LOW">LOW (Standard Blue)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#172B4D] mb-1 uppercase tracking-wider">
                        Lookback Window (Days 1–30) *
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={formLookback}
                        onChange={(e) => setFormLookback(Number(e.target.value))}
                        className="w-full text-xs bg-white border border-[#DFE1E6] rounded-[4px] px-3 py-2 text-[#172B4D] focus:outline-none focus:border-[#0052CC]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Event Type Selection */}
              {activeStep === 2 && (
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                    Select Telemetry Event Type *
                  </label>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {schema.map((item) => {
                      const isSelected = formEventType === item.eventType;
                      return (
                        <div
                          key={item.eventType}
                          onClick={() => handleEventTypeChange(item.eventType)}
                          className={`p-4 rounded-[6px] border cursor-pointer transition-all ${
                            isSelected
                              ? "bg-[#DEEBFF] border-[#0052CC] shadow-xs"
                              : "bg-white border-[#DFE1E6] hover:bg-[#FAFBFC]"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-bold text-xs text-[#172B4D]">
                              {item.eventType} — {item.name}
                            </div>
                            <span className="text-[10px] font-bold bg-white text-[#0052CC] px-2 py-0.5 rounded border border-[#B3D4FF]">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-xs text-[#5E6C84]">{item.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: Dynamic Condition Builder */}
              {activeStep === 3 && (
                <div className="space-y-4">
                  <div className="bg-[#FAFBFC] border border-[#DFE1E6] p-3 rounded-[4px] text-xs font-bold text-[#172B4D]">
                    Event Type Selected: <span className="text-[#0052CC] font-mono">{formEventType} — {currentEventTypeSchema?.name}</span>
                  </div>

                  {/* 1. Parameter / Field Select */}
                  <div>
                    <label className="block text-xs font-bold text-[#172B4D] mb-1 uppercase tracking-wider">
                      1. Telemetry Parameter / Field *
                    </label>
                    <select
                      value={formField}
                      onChange={(e) => handleFieldChange(e.target.value)}
                      className="w-full text-xs bg-white border border-[#DFE1E6] rounded-[4px] px-3 py-2 text-[#172B4D] focus:outline-none focus:border-[#0052CC]"
                    >
                      {currentEventTypeSchema?.fields.map((f) => (
                        <option key={f.name} value={f.name}>
                          {f.label} ({f.name}) — {f.type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Operator Select */}
                  <div>
                    <label className="block text-xs font-bold text-[#172B4D] mb-1 uppercase tracking-wider">
                      2. Operator *
                    </label>
                    <select
                      value={formOperator}
                      onChange={(e) => setFormOperator(e.target.value)}
                      className="w-full text-xs bg-white border border-[#DFE1E6] rounded-[4px] px-3 py-2 text-[#172B4D] focus:outline-none focus:border-[#0052CC]"
                    >
                      {currentFieldSchema?.operators.map((op) => (
                        <option key={op} value={op}>
                          {op === "no_event"
                            ? "no_event — No event logged in lookback"
                            : op === "all_inactive"
                            ? "all_inactive — All members declared inactive"
                            : op === "equals"
                            ? "equals — Parameter equals value"
                            : op === "less_than"
                            ? "less_than — Parameter is less than value"
                            : op === "greater_than"
                            ? "greater_than — Parameter is greater than value"
                            : op}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Dynamic Value Input (Adaptive UI) */}
                  {formOperator !== "no_event" && formOperator !== "all_inactive" && (
                    <div>
                      <label className="block text-xs font-bold text-[#172B4D] mb-1 uppercase tracking-wider">
                        3. Target Value ({currentFieldSchema?.type}) *
                      </label>

                      {currentFieldSchema?.type === "boolean" ? (
                        <select
                          value={String(formValue)}
                          onChange={(e) => setFormValue(e.target.value === "true")}
                          className="w-full text-xs bg-white border border-[#DFE1E6] rounded-[4px] px-3 py-2 text-[#172B4D] focus:outline-none focus:border-[#0052CC]"
                        >
                          <option value="false">False (Disconnected / Inactive)</option>
                          <option value="true">True (Connected / Active)</option>
                        </select>
                      ) : currentFieldSchema?.type === "number" ? (
                        <input
                          type="number"
                          value={Number(formValue)}
                          onChange={(e) => setFormValue(Number(e.target.value))}
                          className="w-full text-xs bg-white border border-[#DFE1E6] rounded-[4px] px-3 py-2 text-[#172B4D] focus:outline-none focus:border-[#0052CC]"
                        />
                      ) : (
                        <input
                          type="text"
                          value={String(formValue)}
                          onChange={(e) => setFormValue(e.target.value)}
                          className="w-full text-xs bg-white border border-[#DFE1E6] rounded-[4px] px-3 py-2 text-[#172B4D] focus:outline-none focus:border-[#0052CC]"
                        />
                      )}
                    </div>
                  )}

                  {/* 4. Minimum Days Threshold */}
                  <div>
                    <label className="block text-xs font-bold text-[#172B4D] mb-1 uppercase tracking-wider">
                      4. Minimum Days Threshold (min_days) *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={formLookback}
                      value={formMinDays}
                      onChange={(e) => setFormMinDays(Number(e.target.value))}
                      className="w-full text-xs bg-white border border-[#DFE1E6] rounded-[4px] px-3 py-2 text-[#172B4D] focus:outline-none focus:border-[#0052CC]"
                    />
                    <p className="text-[11px] text-[#5E6C84] mt-1">
                      ℹ️ Trigger rule if condition is met on at least {formMinDays} distinct days within the {formLookback}-day lookback window.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="bg-[#EBECF0] px-6 py-3 border-t border-[#DFE1E6] flex items-center justify-between">
              <div>
                {activeStep > 1 && (
                  <button
                    onClick={() => setActiveStep((prev) => (prev - 1) as 1 | 2 | 3)}
                    className="px-3.5 py-1.5 bg-white border border-[#DFE1E6] text-xs font-bold text-[#42526E] rounded-[4px] hover:bg-[#FAFBFC]"
                  >
                    &larr; Back
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFormModal(false)}
                  className="px-3.5 py-1.5 bg-white border border-[#DFE1E6] text-xs font-bold text-[#42526E] rounded-[4px] hover:bg-[#FAFBFC]"
                >
                  Cancel
                </button>

                {activeStep < 3 ? (
                  <button
                    onClick={() => setActiveStep((prev) => (prev + 1) as 1 | 2 | 3)}
                    className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-xs font-bold text-white rounded-[4px] shadow-xs"
                  >
                    Next Step &rarr;
                  </button>
                ) : (
                  <button
                    onClick={handleSaveRule}
                    disabled={savingRule}
                    className="px-5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-xs font-bold text-white rounded-[4px] shadow-xs disabled:opacity-50"
                  >
                    {savingRule ? "Saving Rule..." : editingRule ? "Update Rule" : "Save Rule"}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Section C: Live Rule Preview Impact Modal */}
      {previewRule && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[8px] w-full max-w-3xl max-h-[90vh] flex flex-col shadow-[0_12px_32px_rgba(9,30,66,0.25)] border border-[#DFE1E6] overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-[#EBECF0] px-6 py-4 border-b border-[#DFE1E6] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-[#172B4D]">Live Impact Preview</h2>
                  <span className="bg-[#EAE6FF] text-[#403294] text-[10px] font-bold px-2 py-0.5 rounded border border-[#C0B6F2]">
                    Event {previewRule.eventType}
                  </span>
                </div>
                <p className="text-xs text-[#5E6C84]">Rule: &quot;{previewRule.name}&quot;</p>
              </div>
              <button
                onClick={() => setPreviewRule(null)}
                className="text-[#5E6C84] hover:text-[#172B4D] text-lg font-bold p-1 rounded hover:bg-[#DFE1E6]"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {previewLoading ? (
                <div className="py-12 text-center text-[#5E6C84]">
                  <div className="w-8 h-8 border-3 border-[#0052CC] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-xs font-bold text-[#172B4D]">Evaluating Rule Against Live Telemetry Events...</p>
                </div>
              ) : previewData ? (
                <>
                  {/* Summary Stat Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white border border-[#DFE1E6] p-4 rounded-[6px] shadow-xs">
                      <p className="text-[11px] font-bold text-[#5E6C84] uppercase tracking-wider">Total Evaluated</p>
                      <p className="text-2xl font-extrabold text-[#172B4D] mt-1">{previewData.totalDevicesChecked}</p>
                    </div>

                    <div className="bg-white border border-[#ABF5D1] bg-[#E3FCEF]/30 p-4 rounded-[6px] shadow-xs">
                      <p className="text-[11px] font-bold text-[#006644] uppercase tracking-wider">Matched Households</p>
                      <p className="text-2xl font-extrabold text-[#006644] mt-1">{previewData.matchedCount}</p>
                    </div>

                    <div className="bg-white border border-[#B3D4FF] bg-[#DEEBFF]/30 p-4 rounded-[6px] shadow-xs">
                      <p className="text-[11px] font-bold text-[#0052CC] uppercase tracking-wider">Impact Ratio</p>
                      <p className="text-2xl font-extrabold text-[#0052CC] mt-1">
                        {previewData.totalDevicesChecked > 0
                          ? ((previewData.matchedCount / previewData.totalDevicesChecked) * 100).toFixed(1)
                          : 0}
                        %
                      </p>
                    </div>
                  </div>

                  {/* Matched Devices List / Table */}
                  <div>
                    <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider mb-2">
                      Matched Device Queue ({previewData.matchedHouseholds.length})
                    </h3>

                    {previewData.matchedHouseholds.length === 0 ? (
                      <div className="bg-[#FAFBFC] border border-[#DFE1E6] p-6 text-center text-xs text-[#5E6C84] rounded-[6px]">
                        No devices matched this rule during the lookback window.
                      </div>
                    ) : (
                      <div className="border border-[#DFE1E6] rounded-[6px] overflow-hidden">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-[#F4F5F7] border-b border-[#DFE1E6] text-[#5E6C84] font-bold">
                              <th className="py-2.5 px-3">Device ID</th>
                              <th className="py-2.5 px-3">HHID</th>
                              <th className="py-2.5 px-3">Contact</th>
                              <th className="py-2.5 px-3">Days Affected</th>
                              <th className="py-2.5 px-3">Anomaly Reason</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#DFE1E6] bg-white">
                            {previewData.matchedHouseholds
                              .slice((previewPage - 1) * 5, previewPage * 5)
                              .map((h) => (
                                <tr key={h.deviceId} className="hover:bg-[#FAFBFC]">
                                  <td className="py-2.5 px-3 font-mono font-bold text-[#172B4D]">{h.deviceId}</td>
                                  <td className="py-2.5 px-3 text-[#5E6C84]">{h.hhid ?? "N/A"}</td>
                                  <td className="py-2.5 px-3 text-[#172B4D]">{h.contactName ? `${h.contactName} (${h.city})` : "N/A"}</td>
                                  <td className="py-2.5 px-3 font-bold text-[#BF2600]">{h.daysAffected} Days</td>
                                  <td className="py-2.5 px-3 text-[#5E6C84]">{h.reason}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Pagination */}
                    {previewData.matchedHouseholds.length > 5 && (
                      <div className="flex items-center justify-between mt-3 text-xs">
                        <span className="text-[#5E6C84]">
                          Showing Page {previewPage} of {Math.ceil(previewData.matchedHouseholds.length / 5)}
                        </span>
                        <div className="flex gap-2">
                          <button
                            disabled={previewPage === 1}
                            onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                            className="px-2.5 py-1 bg-white border border-[#DFE1E6] rounded text-[#42526E] disabled:opacity-50"
                          >
                            Prev
                          </button>
                          <button
                            disabled={previewPage >= Math.ceil(previewData.matchedHouseholds.length / 5)}
                            onClick={() => setPreviewPage((p) => p + 1)}
                            className="px-2.5 py-1 bg-white border border-[#DFE1E6] rounded text-[#42526E] disabled:opacity-50"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : null}

            </div>

            {/* Modal Footer */}
            <div className="bg-[#EBECF0] px-6 py-3 border-t border-[#DFE1E6] flex justify-end">
              <button
                onClick={() => setPreviewRule(null)}
                className="px-4 py-1.5 bg-[#0052CC] text-white text-xs font-bold rounded-[4px]"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}