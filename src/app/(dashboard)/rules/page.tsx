"use client";

import { useState, useEffect } from "react";
import api from "../../../lib/api";
import { Rule, Priority, RulePreview } from "../../../types";
import { useAuth } from "../../../hooks/useAuth";
import { useRouter } from "next/navigation";

// ─── Schema Types ────────────────────────────────────────────────────────────

interface FieldOption {
  label: string;
  value: boolean | number | string;
}

interface SchemaField {
  name: string;
  label: string;
  type: "boolean" | "number" | "select" | "string";
  operators: string[];
  defaultOperator: string;
  options?: FieldOption[];
  min?: number;
  max?: number;
  defaultValue: boolean | number | string;
  description?: string;
}

interface EventSchema {
  eventType: number;
  name: string;
  category: string;
  description: string;
  deprecated?: boolean;
  fields: SchemaField[];
}

type RuleSchema = EventSchema[];

// ─── Condition Payload ────────────────────────────────────────────────────────

interface ConditionMap {
  [key: string]: boolean | number | string;
}

// ─── Fallback Schema (mirrors rules.schema.ts exactly) ───────────────────────

const DEFAULT_SCHEMA: RuleSchema = [
  {
    eventType: 36,
    name: "Connectivity",
    category: "Network",
    description: "Trigger when the device has the selected connectivity state for N consecutive days",
    fields: [
      {
        name: "connectivity",
        label: "Connectivity status",
        type: "boolean",
        operators: ["equals"],
        defaultOperator: "equals",
        options: [
          { label: "No connectivity", value: false },
          { label: "Has connectivity", value: true },
        ],
        defaultValue: false,
        description: "The selected connectivity state must hold for every day in the streak",
      },
      {
        name: "min_days",
        label: "Consecutive days required",
        type: "number",
        operators: ["gte"],
        defaultOperator: "gte",
        min: 1,
        max: 30,
        defaultValue: 4,
        description: "The condition must remain true for N consecutive calendar days to trigger the rule",
      },
    ],
  },
  {
    eventType: 42,
    name: "Audio Fingerprint",
    category: "Viewership",
    description: "Trigger when the selected fingerprint status remains true for N consecutive days",
    fields: [
      {
        name: "status",
        label: "Fingerprint status",
        type: "select",
        operators: ["equals"],
        defaultOperator: "equals",
        options: [
          { label: "Unmatched", value: "UNMATCHED" },
          { label: "Matched", value: "MATCHED" },
        ],
        defaultValue: "UNMATCHED",
        description: "A conflicting status on any day breaks the streak",
      },
      {
        name: "min_days",
        label: "Consecutive days required",
        type: "number",
        operators: ["gte"],
        defaultOperator: "gte",
        min: 1,
        max: 30,
        defaultValue: 4,
        description: "The selected fingerprint status must hold for N consecutive calendar days",
      },
    ],
  },
  {
    eventType: 29,
    name: "No Viewership",
    category: "Viewership",
    description: "Trigger when no recognized viewership is recorded for N consecutive days",
    fields: [
      {
        name: "mode",
        label: "Viewership condition",
        type: "select",
        operators: ["equals"],
        defaultOperator: "equals",
        options: [
          { label: "No recognized viewership", value: "ABSENT" },
        ],
        defaultValue: "ABSENT",
        description: "A recognized image event on any day breaks the no-viewership streak",
      },
      {
        name: "min_days",
        label: "Consecutive days required",
        type: "number",
        operators: ["gte"],
        defaultOperator: "gte",
        min: 1,
        max: 30,
        defaultValue: 4,
        description: "No recognized viewership must continue for N consecutive calendar days",
      },
    ],
  },
  {
    eventType: 30,
    name: "Image Unrecognized (legacy)",
    category: "Viewership",
    description: "Legacy rule type retained so existing rules can still be edited",
    deprecated: true,
    fields: [
      {
        name: "status",
        label: "Recognition status",
        type: "select",
        operators: ["equals"],
        defaultOperator: "equals",
        options: [
          { label: "Unrecognized", value: "unrecognized" },
          { label: "Recognized", value: "recognized" },
        ],
        defaultValue: "unrecognized",
        description: "Legacy explicit image recognition status rule",
      },
      {
        name: "min_days",
        label: "Consecutive days required",
        type: "number",
        operators: ["gte"],
        defaultOperator: "gte",
        min: 1,
        max: 30,
        defaultValue: 4,
        description: "The selected recognition status must hold for N consecutive calendar days",
      },
    ],
  },
  {
    eventType: 3,
    name: "No Member Declaration",
    category: "Household",
    description: "Trigger when no member declaration is recorded for N consecutive days",
    fields: [
      {
        name: "mode",
        label: "Member declaration condition",
        type: "select",
        operators: ["equals"],
        defaultOperator: "equals",
        options: [
          { label: "No member declaration", value: "ABSENT" },
        ],
        defaultValue: "ABSENT",
        description: "Any member declaration on a day breaks the no-declaration streak",
      },
      {
        name: "min_days",
        label: "Consecutive days required",
        type: "number",
        operators: ["gte"],
        defaultOperator: "gte",
        min: 1,
        max: 30,
        defaultValue: 4,
        description: "No member declaration must continue for N consecutive calendar days",
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildDefaultCondition(eventSchema: EventSchema): ConditionMap {
  const cond: ConditionMap = {};
  for (const f of eventSchema.fields) {
    cond[f.name] = f.defaultValue;
  }
  return cond;
}

function categoryColor(category: string) {
  switch (category) {
    case "Network":    return "bg-[#E3FCEF] text-[#006644] border-[#ABF5D1]";
    case "Viewership": return "bg-[#EAE6FF] text-[#403294] border-[#C0B6F2]";
    case "Household":  return "bg-[#FFF0B3] text-[#172B4D] border-[#FFE380]";
    default:           return "bg-[#DEEBFF] text-[#0052CC] border-[#B3D4FF]";
  }
}

// ─── Toast ────────────────────────────────────────────────────────────────────

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RulesManagementPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Core state
  const [rules, setRules]               = useState<Rule[]>([]);
  const [schema, setSchema]             = useState<RuleSchema>(DEFAULT_SCHEMA);
  const [loadingRules, setLoadingRules] = useState(true);
  const [toasts, setToasts]             = useState<Toast[]>([]);

  // Search & filter
  const [searchQuery, setSearchQuery]       = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "ALL">("ALL");

  // Builder modal
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingRule, setEditingRule]     = useState<Rule | null>(null);
  const [activeStep, setActiveStep]       = useState<1 | 2 | 3>(1);
  const [savingRule, setSavingRule]       = useState(false);
  const [formError, setFormError]         = useState("");

  // Step 1 fields
  const [formName, setFormName]         = useState("");
  const [formDesc, setFormDesc]         = useState("");
  const [formPriority, setFormPriority] = useState<Priority>("HIGH");
  const [formLookback, setFormLookback] = useState<number>(4);

  // Step 2 fields
  const [formEventType, setFormEventType] = useState<number>(36);

  // Step 3: dynamic condition map keyed by field name
  const [formCondition, setFormCondition] = useState<ConditionMap>({});

  // Preview modal
  const [previewRule, setPreviewRule]       = useState<Rule | null>(null);
  const [previewData, setPreviewData]       = useState<RulePreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewPage, setPreviewPage]       = useState(1);

  // ─── Toast helper ───────────────────────────────────────────────────────────

  const addToast = (type: "success" | "error" | "info", message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  // ─── Auth guard ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!loading && user && user.role !== "developer" && user.role !== "panel_manager") {
      router.push("/call-list");
    }
  }, [user, loading, router]);

  // ─── Fetch data ─────────────────────────────────────────────────────────────

  const fetchRules = async () => {
    try {
      setLoadingRules(true);
      const res = await api.get("/crm/rules");
      setRules(res.data.data ?? []);
    } catch {
      addToast("error", "Failed to load rules");
    } finally {
      setLoadingRules(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    api.get("/crm/rules/schema")
      .then((res) => {
        if (!ignore && Array.isArray(res.data?.data)) setSchema(res.data.data);
      })
      .catch(() => {});

    api.get("/crm/rules")
      .then((res) => { if (!ignore) setRules(res.data.data ?? []); })
      .catch(() => { if (!ignore) addToast("error", "Failed to load rules"); })
      .finally(() => { if (!ignore) setLoadingRules(false); });

    return () => { ignore = true; };
  }, []);

  // ─── Derived schema helpers ─────────────────────────────────────────────────

  const currentEventSchema = schema.find((s) => s.eventType === formEventType) ?? schema[0];

  // Non-min_days fields (shown as condition inputs)
  const conditionFields = currentEventSchema?.fields.filter((f) => f.name !== "min_days") ?? [];

  // min_days field meta (always driven from schema)
  const minDaysField = currentEventSchema?.fields.find((f) => f.name === "min_days");

  // ─── Event type change ──────────────────────────────────────────────────────

  const handleEventTypeChange = (newType: number) => {
    setFormEventType(newType);
    const es = schema.find((s) => s.eventType === newType) ?? schema[0];
    setFormCondition(buildDefaultCondition(es));
  };

  // ─── Condition field value change ───────────────────────────────────────────

  const setConditionValue = (fieldName: string, value: boolean | number | string) => {
    setFormCondition((prev) => ({ ...prev, [fieldName]: value }));
  };

  // ─── Open builder for create ────────────────────────────────────────────────

  const openCreateModal = () => {
    setEditingRule(null);
    setFormName("");
    setFormDesc("");
    setFormPriority("HIGH");
    setFormLookback(4);
    setFormEventType(schema[0]?.eventType ?? 36);
    setFormCondition(buildDefaultCondition(schema[0]));
    setActiveStep(1);
    setFormError("");
    setShowFormModal(true);
  };

  // ─── Open builder for edit ──────────────────────────────────────────────────

  const openEditModal = (rule: Rule) => {
    setEditingRule(rule);
    setFormName(rule.name);
    setFormDesc(rule.description ?? "");
    setFormPriority(rule.priority);
    setFormLookback(rule.lookbackDays);
    setFormEventType(rule.eventType);

    const es = schema.find((s) => s.eventType === rule.eventType) ?? schema[0];
    // Seed condition from saved rule, falling back to schema defaults
    const savedCond = (rule.condition as ConditionMap) ?? {};
    const merged: ConditionMap = {};
    for (const f of es.fields) {
      merged[f.name] = f.name in savedCond ? savedCond[f.name] : f.defaultValue;
    }
    setFormCondition(merged);

    setActiveStep(1);
    setFormError("");
    setShowFormModal(true);
  };

  // ─── Save rule ──────────────────────────────────────────────────────────────

  const handleSaveRule = async () => {
    if (!formName.trim()) {
      setFormError("Rule name is required.");
      setActiveStep(1);
      return;
    }

    const consecutiveDays = Number(formCondition["min_days"] ?? 1);
    if (consecutiveDays < 1 || consecutiveDays > formLookback) {
      setFormError("Consecutive days required must be between 1 and the lookback window.");
      setActiveStep(3);
      return;
    }

    setSavingRule(true);
    setFormError("");

    const payload = {
      name:        formName.trim(),
      description: formDesc.trim(),
      eventType:   formEventType,
      priority:    formPriority,
      lookbackDays: formLookback,
      condition:   formCondition,
    };

    try {
      if (editingRule) {
        await api.put(`/crm/rules/${editingRule.id}`, payload);
        addToast("success", `"${formName}" updated`);
      } else {
        await api.post("/crm/rules", payload);
        addToast("success", `"${formName}" created`);
      }
      setShowFormModal(false);
      fetchRules();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { msg?: string } } })?.response?.data?.msg ??
        "Failed to save rule";
      setFormError(msg);
      addToast("error", msg);
    } finally {
      setSavingRule(false);
    }
  };

  // ─── Toggle active status ───────────────────────────────────────────────────

  const handleToggleStatus = async (rule: Rule) => {
    const next = !rule.isActive;
    setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, isActive: next } : r)));
    try {
      await api.patch(`/crm/rules/${rule.id}/toggle`, { isActive: next });
      addToast("success", `"${rule.name}" is now ${next ? "active" : "inactive"}`);
    } catch {
      setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, isActive: !next } : r)));
      addToast("error", `Failed to update status for "${rule.name}"`);
    }
  };

  // ─── Delete rule ────────────────────────────────────────────────────────────

  const handleDeleteRule = async (rule: Rule) => {
    if (!confirm(`Delete "${rule.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/crm/rules/${rule.id}`);
      addToast("success", `"${rule.name}" deleted`);
      fetchRules();
    } catch {
      addToast("error", `Failed to delete "${rule.name}"`);
    }
  };

  // ─── Preview modal ──────────────────────────────────────────────────────────

  const openPreviewModal = async (rule: Rule) => {
    setPreviewRule(rule);
    setPreviewData(null);
    setPreviewLoading(true);
    setPreviewPage(1);
    try {
      const res = await api.get(`/crm/rules/${rule.id}/preview`);
      setPreviewData(res.data.data);
    } catch {
      addToast("error", "Failed to fetch preview");
    } finally {
      setPreviewLoading(false);
    }
  };

  // ─── Filtering ──────────────────────────────────────────────────────────────

  const filteredRules = rules.filter((rule) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      rule.name.toLowerCase().includes(q) ||
      (rule.description ?? "").toLowerCase().includes(q) ||
      rule.eventType.toString().includes(q);
    const matchPriority = priorityFilter === "ALL" || rule.priority === priorityFilter;
    return matchSearch && matchPriority;
  });

  // ─── Shared input classes ───────────────────────────────────────────────────

  const inputCls =
    "w-full text-xs bg-white border border-[#DFE1E6] rounded-[4px] px-3 py-2.5 text-[#172B4D] focus:outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-[#DEEBFF]";

  // ─── Render a single schema-driven field input ──────────────────────────────

  const renderFieldInput = (field: SchemaField) => {
    const value = formCondition[field.name] ?? field.defaultValue;

    if (field.type === "select" && field.options) {
      return (
        <select
          value={String(value)}
          onChange={(e) => setConditionValue(field.name, e.target.value)}
          className={inputCls}
        >
          {field.options.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "boolean" && field.options) {
      return (
        <select
          value={String(value)}
          onChange={(e) => setConditionValue(field.name, e.target.value === "true")}
          className={inputCls}
        >
          {field.options.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "number") {
      return (
        <input
          type="number"
          min={field.min}
          max={field.max}
          value={Number(value)}
          onChange={(e) => setConditionValue(field.name, Number(e.target.value))}
          className={inputCls}
        />
      );
    }

    // string fallback
    return (
      <input
        type="text"
        value={String(value)}
        onChange={(e) => setConditionValue(field.name, e.target.value)}
        className={inputCls}
      />
    );
  };

  // ─── Step indicator ─────────────────────────────────────────────────────────

  const StepTab = ({
    step,
    label,
  }: {
    step: 1 | 2 | 3;
    label: string;
  }) => (
    <button
      onClick={() => setActiveStep(step)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-xs font-bold transition-colors ${
        activeStep === step
          ? "bg-[#0052CC] text-white"
          : "text-[#5E6C84] hover:bg-[#EBECF0]"
      }`}
    >
      <span
        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
          activeStep === step ? "bg-white/20 text-white" : "bg-[#DFE1E6] text-[#42526E]"
        }`}
      >
        {step}
      </span>
      {label}
    </button>
  );

  // ────────────────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto px-4 py-3 rounded-[6px] text-xs font-bold shadow-[0_4px_12px_rgba(9,30,66,0.15)] flex items-center gap-2 border ${
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

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[8px] border border-[#DFE1E6] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#172B4D] tracking-tight">
              CRM Rule Engine
            </h1>
            <span className="bg-[#DEEBFF] text-[#0052CC] text-[10px] font-bold px-2 py-0.5 rounded border border-[#B3D4FF]">
              Rules Management
            </span>
          </div>
          <p className="text-xs text-[#5E6C84] mt-1">
            Define telemetry trigger rules, lookback windows, and anomaly thresholds to generate daily agent call queues.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white text-xs font-bold px-4 py-2.5 rounded-[4px] shadow-xs transition-all flex items-center gap-2 whitespace-nowrap self-start sm:self-center"
        >
          + Create New Rule
        </button>
      </div>

      {/* ── Search & filters ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, description, event type…"
            className="w-full text-xs bg-white border border-[#DFE1E6] rounded-[4px] pl-9 pr-3.5 py-2.5 text-[#172B4D] placeholder:text-[#A5ADBA] focus:outline-none focus:border-[#0052CC] focus:ring-2 focus:ring-[#DEEBFF]"
          />
          <svg className="w-4 h-4 text-[#A5ADBA] absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-bold text-[#5E6C84]">Priority:</span>
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

      {/* ── Rules table ── */}
      {loadingRules ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white border border-[#DFE1E6] rounded-[6px] animate-pulse" />
          ))}
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="bg-white border border-[#DFE1E6] rounded-[8px] p-12 text-center">
          <div className="w-12 h-12 bg-[#DEEBFF] text-[#0052CC] rounded-full mx-auto flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
          <p className="text-sm font-bold text-[#172B4D]">No rules found</p>
          <p className="text-xs text-[#5E6C84] mt-1">
            Adjust your search or create a new rule to get started.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#DFE1E6] rounded-[8px] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#EBECF0] border-b border-[#DFE1E6] text-[#5E6C84] font-bold">
                  <th className="py-3 px-4">Rule</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Condition</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Lookback</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE1E6]">
                {filteredRules.map((rule) => {
                  const es = schema.find((s) => s.eventType === rule.eventType);
                  const cond = (rule.condition as ConditionMap) ?? {};

                  // Build a human-readable condition summary
                  const condSummary = es
                    ? es.fields
                        .map((f) => {
                          if (!(f.name in cond)) return null;
                          const raw = cond[f.name];
                          const label =
                            f.options?.find((o) => String(o.value) === String(raw))?.label ??
                            String(raw);
                          return `${f.label}: ${label}`;
                        })
                        .filter(Boolean)
                        .join(" · ")
                    : JSON.stringify(cond);

                  return (
                    <tr key={rule.id} className="hover:bg-[#FAFBFC] transition-colors">
                      {/* Name */}
                      <td className="py-4 px-4 max-w-[220px]">
                        <div className="font-bold text-sm text-[#172B4D] truncate">{rule.name}</div>
                        {rule.description && (
                          <div className="text-xs text-[#5E6C84] mt-0.5 line-clamp-1">{rule.description}</div>
                        )}
                      </td>

                      {/* Event type */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="bg-[#EAE6FF] text-[#403294] border border-[#C0B6F2] font-bold text-[11px] px-2.5 py-1 rounded-full inline-block">
                            {es?.name ?? `Event ${rule.eventType}`}
                          </span>
                          {es && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block ${categoryColor(es.category)}`}>
                              {es.category}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Condition summary */}
                      <td className="py-4 px-4 max-w-[200px]">
                        <span className="text-[11px] font-mono text-[#5E6C84] bg-[#F4F5F7] px-2 py-0.5 rounded border border-[#DFE1E6] inline-block leading-relaxed">
                          {condSummary}
                        </span>
                      </td>

                      {/* Priority */}
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

                      {/* Lookback */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="bg-[#F4F5F7] border border-[#DFE1E6] px-2.5 py-1 rounded-[4px] text-[#172B4D] font-medium">
                          {rule.lookbackDays}d
                        </span>
                      </td>

                      {/* Status toggle */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <label className="inline-flex items-center cursor-pointer gap-2">
                          <input
                            type="checkbox"
                            checked={rule.isActive}
                            onChange={() => handleToggleStatus(rule)}
                            className="sr-only peer"
                          />
                          <div className="relative w-9 h-5 bg-[#C1C7D0] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#36B37E]" />
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
                            className="px-2.5 py-1.5 bg-[#DEEBFF] text-[#0052CC] hover:bg-[#B3D4FF] font-bold rounded-[4px] border border-[#B3D4FF] transition-colors text-xs"
                          >
                            📊 Preview
                          </button>
                          <button
                            onClick={() => openEditModal(rule)}
                            className="px-2.5 py-1.5 bg-white border border-[#DFE1E6] text-[#42526E] hover:bg-[#F4F5F7] font-bold rounded-[4px] transition-colors text-xs"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRule(rule)}
                            className="px-2.5 py-1.5 bg-[#FFEBE6] border border-[#FFBDAD] text-[#BF2600] hover:bg-[#FFBDAD] font-bold rounded-[4px] transition-colors text-xs"
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

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* Builder modal                                                         */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[8px] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_12px_32px_rgba(9,30,66,0.25)] border border-[#DFE1E6] overflow-hidden">

            {/* Modal header */}
            <div className="bg-[#EBECF0] px-6 py-4 border-b border-[#DFE1E6] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-[#172B4D]">
                  {editingRule ? "Edit Rule" : "Create Rule"}
                </h2>
                <p className="text-xs text-[#5E6C84]">
                  Configure event criteria, thresholds, and lookback window
                </p>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className="text-[#5E6C84] hover:text-[#172B4D] text-lg font-bold p-1 rounded hover:bg-[#DFE1E6]"
              >
                ✕
              </button>
            </div>

            {/* Step tabs */}
            <div className="bg-[#FAFBFC] border-b border-[#DFE1E6] px-6 py-3 flex items-center gap-1">
              <StepTab step={1} label="Basic Info" />
              <span className="text-[#DFE1E6] font-bold">›</span>
              <StepTab step={2} label="Event Type" />
              <span className="text-[#DFE1E6] font-bold">›</span>
              <StepTab step={3} label="Conditions" />
            </div>

            {/* Modal body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">

              {/* Error banner */}
              {formError && (
                <div className="bg-[#FFEBE6] border border-[#FFBDAD] text-[#BF2600] text-xs font-bold p-3.5 rounded-[4px] flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{formError}</span>
                </div>
              )}

              {/* ── Step 1: Basic info ── */}
              {activeStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#172B4D] mb-1">Rule name *</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. No connectivity for 3+ days"
                      className={inputCls}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#172B4D] mb-1">Description</label>
                    <textarea
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      placeholder="What does this rule detect and why does it matter?"
                      rows={2}
                      className={`${inputCls} resize-none`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#172B4D] mb-1">Priority *</label>
                      <select
                        value={formPriority}
                        onChange={(e) => setFormPriority(e.target.value as Priority)}
                        className={inputCls}
                      >
                        <option value="HIGH">High — red alert</option>
                        <option value="MEDIUM">Medium — orange alert</option>
                        <option value="LOW">Low — standard</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#172B4D] mb-1">
                        Lookback window (days) *
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={formLookback}
                        onChange={(e) => setFormLookback(Number(e.target.value))}
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 2: Event type ── */}
              {activeStep === 2 && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-[#172B4D] mb-2">
                    Select telemetry event type *
                  </label>

                  {schema.filter((item) => !item.deprecated).map((item) => {
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
                          <div className="font-bold text-xs text-[#172B4D] flex items-center gap-2">
                            <span>{item.name}</span>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${categoryColor(item.category)}`}>
                            {item.category}
                          </span>
                        </div>
                        <p className="text-xs text-[#5E6C84]">{item.description}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── Step 3: Conditions ── */}
              {activeStep === 3 && (
                <div className="space-y-5">
                  {/* Context banner */}
                  <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded-[4px] px-4 py-3 flex items-center justify-between">
                    <span className="text-xs text-[#5E6C84]">
                      Event type
                    </span>
                    <span className="text-xs font-bold text-[#0052CC]">
                      {currentEventSchema?.name}
                    </span>
                  </div>

                  {/* Non-min_days condition fields */}
                  {conditionFields.map((field, idx) => (
                    <div key={field.name}>
                      <label className="block text-xs font-bold text-[#172B4D] mb-1">
                        {idx + 1}. {field.label} *
                      </label>
                      {renderFieldInput(field)}
                      {field.description && (
                        <p className="text-[11px] text-[#5E6C84] mt-1">ℹ️ {field.description}</p>
                      )}
                    </div>
                  ))}

                  {/* min_days — always last, capped to lookback */}
                  {minDaysField && (
                    <div>
                      <label className="block text-xs font-bold text-[#172B4D] mb-1">
                        {conditionFields.length + 1}. {minDaysField.label} *
                      </label>
                      <input
                        type="number"
                        min={minDaysField.min ?? 1}
                        max={formLookback}
                        value={Number(formCondition["min_days"] ?? minDaysField.defaultValue)}
                        onChange={(e) => setConditionValue("min_days", Number(e.target.value))}
                        className={inputCls}
                      />
                      <p className="text-[11px] text-[#5E6C84] mt-1">
                        ℹ️ The condition must remain true for{" "}
                        <strong>{formCondition["min_days"] ?? minDaysField.defaultValue}</strong> consecutive
                        calendar day(s) within the {formLookback}-day lookback window.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="bg-[#EBECF0] px-6 py-3 border-t border-[#DFE1E6] flex items-center justify-between">
              <div>
                {activeStep > 1 && (
                  <button
                    onClick={() => setActiveStep((p) => (p - 1) as 1 | 2 | 3)}
                    className="px-3.5 py-1.5 bg-white border border-[#DFE1E6] text-xs font-bold text-[#42526E] rounded-[4px] hover:bg-[#FAFBFC]"
                  >
                    ← Back
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
                    onClick={() => setActiveStep((p) => (p + 1) as 1 | 2 | 3)}
                    className="px-4 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-xs font-bold text-white rounded-[4px] shadow-xs"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={handleSaveRule}
                    disabled={savingRule}
                    className="px-5 py-1.5 bg-[#0052CC] hover:bg-[#0747A6] text-xs font-bold text-white rounded-[4px] shadow-xs disabled:opacity-50"
                  >
                    {savingRule ? "Saving…" : editingRule ? "Update rule" : "Save rule"}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* Preview modal                                                         */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {previewRule && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[8px] w-full max-w-3xl max-h-[90vh] flex flex-col shadow-[0_12px_32px_rgba(9,30,66,0.25)] border border-[#DFE1E6] overflow-hidden">

            {/* Header */}
            <div className="bg-[#EBECF0] px-6 py-4 border-b border-[#DFE1E6] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-[#172B4D]">Impact Preview</h2>
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

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {previewLoading ? (
                <div className="py-12 text-center text-[#5E6C84]">
                  <div className="w-8 h-8 border-[3px] border-[#0052CC] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs font-bold text-[#172B4D]">
                    Evaluating rule against live telemetry…
                  </p>
                </div>
              ) : previewData ? (
                <>
                  {/* Stat cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white border border-[#DFE1E6] p-4 rounded-[6px] shadow-xs">
                      <p className="text-[11px] font-bold text-[#5E6C84]">Total evaluated</p>
                      <p className="text-2xl font-extrabold text-[#172B4D] mt-1">
                        {previewData.totalDevicesChecked}
                      </p>
                    </div>
                    <div className="bg-[#E3FCEF]/30 border border-[#ABF5D1] p-4 rounded-[6px] shadow-xs">
                      <p className="text-[11px] font-bold text-[#006644]">Matched households</p>
                      <p className="text-2xl font-extrabold text-[#006644] mt-1">
                        {previewData.matchedCount}
                      </p>
                    </div>
                    <div className="bg-[#DEEBFF]/30 border border-[#B3D4FF] p-4 rounded-[6px] shadow-xs">
                      <p className="text-[11px] font-bold text-[#0052CC]">Impact ratio</p>
                      <p className="text-2xl font-extrabold text-[#0052CC] mt-1">
                        {previewData.totalDevicesChecked > 0
                          ? ((previewData.matchedCount / previewData.totalDevicesChecked) * 100).toFixed(1)
                          : 0}
                        %
                      </p>
                    </div>
                  </div>

                  {/* Matched devices table */}
                  <div>
                    <h3 className="text-xs font-bold text-[#172B4D] mb-2">
                      Matched device queue ({previewData.matchedHouseholds.length})
                    </h3>

                    {previewData.matchedHouseholds.length === 0 ? (
                      <div className="bg-[#FAFBFC] border border-[#DFE1E6] p-6 text-center text-xs text-[#5E6C84] rounded-[6px]">
                        No devices matched this rule in the lookback window.
                      </div>
                    ) : (
                      <>
                        <div className="border border-[#DFE1E6] rounded-[6px] overflow-hidden">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-[#F4F5F7] border-b border-[#DFE1E6] text-[#5E6C84] font-bold">
                                <th className="py-2.5 px-3">Device ID</th>
                                <th className="py-2.5 px-3">HHID</th>
                                <th className="py-2.5 px-3">Contact</th>
                                <th className="py-2.5 px-3">Days affected</th>
                                <th className="py-2.5 px-3">Reason</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#DFE1E6] bg-white">
                              {previewData.matchedHouseholds
                                .slice((previewPage - 1) * 5, previewPage * 5)
                                .map((h) => (
                                  <tr key={h.deviceId} className="hover:bg-[#FAFBFC]">
                                    <td className="py-2.5 px-3 font-mono font-bold text-[#172B4D]">{h.deviceId}</td>
                                    <td className="py-2.5 px-3 text-[#5E6C84]">{h.hhid ?? "N/A"}</td>
                                    <td className="py-2.5 px-3 text-[#172B4D]">
                                      {h.contactName ? `${h.contactName} (${h.city})` : "N/A"}
                                    </td>
                                    <td className="py-2.5 px-3 font-bold text-[#BF2600]">{h.daysAffected}d</td>
                                    <td className="py-2.5 px-3 text-[#5E6C84]">{h.reason}</td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination */}
                        {previewData.matchedHouseholds.length > 5 && (
                          <div className="flex items-center justify-between mt-3 text-xs">
                            <span className="text-[#5E6C84]">
                              Page {previewPage} of {Math.ceil(previewData.matchedHouseholds.length / 5)}
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
                      </>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {/* Footer */}
            <div className="bg-[#EBECF0] px-6 py-3 border-t border-[#DFE1E6] flex justify-end">
              <button
                onClick={() => setPreviewRule(null)}
                className="px-4 py-1.5 bg-[#0052CC] text-white text-xs font-bold rounded-[4px]"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}