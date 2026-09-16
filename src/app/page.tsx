"use client";

import { useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"call-list" | "rules" | "tickets">("call-list");
  const [activeRulePreview, setActiveRulePreview] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-[#172B4D] font-sans flex flex-col selection:bg-[#DEEBFF] selection:text-[#0052CC]">
      
      {/* Atlassian Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#DFE1E6] shadow-[0_1px_3px_rgba(9,30,66,0.06)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
          
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#0052CC] to-[#0747A6] rounded-[6px] flex items-center justify-center text-white font-extrabold text-xl shadow-[0_2px_4px_rgba(0,82,204,0.3)]">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-[#172B4D] tracking-tight">CRM Portal</span>
              <span className="text-[10px] font-bold bg-[#DEEBFF] text-[#0052CC] px-2 py-0.5 rounded-[4px] uppercase tracking-wider border border-[#B3D4FF]">
                Enterprise v2.4
              </span>
            </div>
          </div>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#42526E]">
            <a href="#overview" className="hover:text-[#0052CC] transition-colors">Overview</a>
            <a href="#solutions" className="hover:text-[#0052CC] transition-colors">Console Workflow</a>
            <a href="#features" className="hover:text-[#0052CC] transition-colors">Capabilities</a>
            <a href="#architecture" className="hover:text-[#0052CC] transition-colors">Architecture</a>
          </nav>

          {/* Right System Health & Sign In */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold bg-[#E3FCEF] text-[#006644] px-3 py-1.5 rounded-full border border-[#ABF5D1]">
              <span className="w-2 h-2 rounded-full bg-[#36B37E] animate-ping"></span>
              <span className="w-2 h-2 rounded-full bg-[#36B37E] -ml-4"></span>
              All Systems Operational
            </div>

            <Link
              href="/login"
              className="text-sm font-semibold text-[#42526E] hover:text-[#0052CC] px-3.5 py-1.5 rounded-[4px] hover:bg-[#EBECF0] transition-colors"
            >
              Sign In
            </Link>

            <Link
              href="/login"
              className="text-sm font-semibold bg-[#0052CC] hover:bg-[#0747A6] active:bg-[#00388B] text-white px-4.5 py-1.5 rounded-[4px] shadow-[0_1px_2px_rgba(9,30,66,0.2)] hover:shadow-[0_4px_8px_rgba(0,82,204,0.25)] transition-all flex items-center gap-2"
            >
              <span>Console</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section id="overview" className="relative overflow-hidden pt-16 pb-20 bg-gradient-to-b from-white via-[#FAFBFC] to-[#F4F5F7] border-b border-[#DFE1E6]">
        {/* Decorative background grid */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#0052CC_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            
            {/* Announcement Badge */}
            <div className="inline-flex items-center gap-2.5 bg-[#DEEBFF] border border-[#B3D4FF] text-[#0052CC] text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 shadow-xs hover:bg-[#B3D4FF]/50 transition-colors cursor-pointer">
              <span className="bg-[#0052CC] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                RELEASED
              </span>
              <span>Twilio Agent Telephony & Automated Rule Engine 2.4</span>
              <svg className="w-3.5 h-3.5 text-[#0052CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold text-[#172B4D] tracking-tight leading-[1.12] mb-6">
              Household Support Operations & Telemetry Intelligence
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-[#42526E] leading-relaxed mb-8 max-w-2xl mx-auto font-normal">
              Empower support agents with real-time household device monitoring, automated anomaly rule evaluation, call queue locking, and seamless field ticket escalation.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
              <Link
                href="/login"
                className="w-full sm:w-auto px-7 py-3.5 bg-[#0052CC] hover:bg-[#0747A6] text-white font-semibold rounded-[4px] shadow-[0_4px_12px_rgba(0,82,204,0.3)] hover:shadow-[0_6px_16px_rgba(0,82,204,0.4)] transition-all flex items-center justify-center gap-2.5 text-base"
              >
                <span>Launch Agent Console</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a
                href="#solutions"
                className="w-full sm:w-auto px-7 py-3.5 bg-white border border-[#DFE1E6] hover:bg-[#F4F5F7] text-[#172B4D] font-semibold rounded-[4px] shadow-xs hover:border-[#C1C7D0] transition-all flex items-center justify-center gap-2 text-base"
              >
                <span>Explore Interactive Demo</span>
              </a>
            </div>

            {/* Stat Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-[#DFE1E6]">
              <div className="bg-white p-5 rounded-[6px] border border-[#DFE1E6] shadow-xs hover:border-[#B3D4FF] hover:shadow-md transition-all">
                <div className="text-3xl font-extrabold text-[#0052CC]">10k+</div>
                <div className="text-xs font-bold text-[#5E6C84] uppercase tracking-wider mt-1.5">Households Monitored</div>
              </div>
              <div className="bg-white p-5 rounded-[6px] border border-[#DFE1E6] shadow-xs hover:border-[#ABF5D1] hover:shadow-md transition-all">
                <div className="text-3xl font-extrabold text-[#006644]">&lt; 2 min</div>
                <div className="text-xs font-bold text-[#5E6C84] uppercase tracking-wider mt-1.5">Anomaly Detection</div>
              </div>
              <div className="bg-white p-5 rounded-[6px] border border-[#DFE1E6] shadow-xs hover:border-[#DFE1E6] hover:shadow-md transition-all">
                <div className="text-3xl font-extrabold text-[#172B4D]">99.9%</div>
                <div className="text-xs font-bold text-[#5E6C84] uppercase tracking-wider mt-1.5">Uptime SLA</div>
              </div>
              <div className="bg-white p-5 rounded-[6px] border border-[#DFE1E6] shadow-xs hover:border-[#EAE6FF] hover:shadow-md transition-all">
                <div className="text-3xl font-extrabold text-[#403294]">24/7</div>
                <div className="text-xs font-bold text-[#5E6C84] uppercase tracking-wider mt-1.5">Rule Dispatcher</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Atlassian Workstation Demo Section */}
      <section id="solutions" className="py-16 bg-white border-b border-[#DFE1E6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold text-[#0052CC] uppercase tracking-wider bg-[#DEEBFF] px-3 py-1 rounded-full border border-[#B3D4FF]">
              Live Workstation Preview
            </span>
            <h2 className="text-3xl font-extrabold text-[#172B4D] mt-3">Built for Operations Managers & Call Agents</h2>
            <p className="text-sm text-[#5E6C84] mt-2">
              Experience the end-to-end workflow: automated telemetry rules generate priority call lists, agents lock households during calls, and escalate field tickets with full history.
            </p>
          </div>

          {/* Interactive Workstation Mock Container */}
          <div className="bg-[#FAFBFC] border border-[#DFE1E6] rounded-[10px] shadow-[0_8px_24px_rgba(9,30,66,0.12)] overflow-hidden">
            
            {/* Top Window Bar */}
            <div className="bg-[#EBECF0] px-5 py-3 border-b border-[#DFE1E6] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF5630]"></span>
                <span className="w-3 h-3 rounded-full bg-[#FFAB00]"></span>
                <span className="w-3 h-3 rounded-full bg-[#36B37E]"></span>
                <span className="text-xs font-bold text-[#172B4D] ml-2">CRM Console Workstation &bull; Production Workspace</span>
              </div>
              
              {/* Tab Switcher */}
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-[6px] border border-[#DFE1E6]">
                <button
                  onClick={() => setActiveTab("call-list")}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-[4px] transition-all ${
                    activeTab === "call-list"
                      ? "bg-[#0052CC] text-white shadow-xs"
                      : "text-[#42526E] hover:bg-[#F4F5F7]"
                  }`}
                >
                  📞 Call List Queue
                </button>
                <button
                  onClick={() => setActiveTab("rules")}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-[4px] transition-all ${
                    activeTab === "rules"
                      ? "bg-[#0052CC] text-white shadow-xs"
                      : "text-[#42526E] hover:bg-[#F4F5F7]"
                  }`}
                >
                  ⚙️ Rules Engine
                </button>
                <button
                  onClick={() => setActiveTab("tickets")}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-[4px] transition-all ${
                    activeTab === "tickets"
                      ? "bg-[#0052CC] text-white shadow-xs"
                      : "text-[#42526E] hover:bg-[#F4F5F7]"
                  }`}
                >
                  🎫 Field Tickets
                </button>
              </div>
            </div>

            {/* Workstation Tab Content Area */}
            <div className="p-6 sm:p-8">
              
              {/* TAB 1: CALL LIST */}
              {activeTab === "call-list" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between border-b border-[#DFE1E6] pb-4 gap-3">
                    <div>
                      <h3 className="text-base font-bold text-[#172B4D]">Today&apos;s Priority Call Queue</h3>
                      <p className="text-xs text-[#5E6C84]">Ranked by telemetry severity rules &bull; Automated lock active</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#FFF0B3] text-[#172B4D] text-xs font-bold px-3 py-1 rounded-full border border-[#FFE380]">
                        3 Pending
                      </span>
                      <span className="bg-[#E3FCEF] text-[#006644] text-xs font-bold px-3 py-1 rounded-full border border-[#ABF5D1]">
                        1 Resolved
                      </span>
                    </div>
                  </div>

                  {/* Entry 1 */}
                  <div className="bg-white border-l-4 border-l-[#FF5630] border border-[#DFE1E6] rounded-[6px] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#C1C7D0] transition-colors">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-mono text-xs font-extrabold text-[#172B4D] bg-[#F4F5F7] px-2 py-0.5 rounded border border-[#DFE1E6]">
                          DEV-89241
                        </span>
                        <span className="bg-[#EAE6FF] text-[#403294] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#C0B6F2]">
                          HH-4029
                        </span>
                        <span className="bg-[#FFEBE6] text-[#BF2600] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#FFBDAD]">
                          HIGH PRIORITY
                        </span>
                        <span className="bg-[#FFF0B3] text-[#172B4D] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#FFE380]">
                          PENDING
                        </span>
                      </div>
                      <div className="text-xs text-[#42526E] font-medium">👤 Rahul Sharma &bull; 📍 Mumbai, Maharashtra &bull; 📞 +91 98765 *****</div>
                      <div className="text-xs text-[#BF2600] font-bold mt-1.5 flex items-center gap-1">
                        <span>⚠️ Flagged by Rule:</span>
                        <span className="underline decoration-[#FF5630]">No Connectivity for 3+ Days</span>
                      </div>
                    </div>
                    <Link
                      href="/login"
                      className="bg-[#36B37E] hover:bg-[#006644] text-white text-xs font-bold px-4 py-2 rounded-[4px] shadow-xs flex items-center justify-center gap-1.5 self-start sm:self-center transition-colors"
                    >
                      <span>📞 Initiate Call</span>
                    </Link>
                  </div>

                  {/* Entry 2 */}
                  <div className="bg-white border-l-4 border-l-[#FFAB00] border border-[#DFE1E6] rounded-[6px] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-mono text-xs font-extrabold text-[#172B4D] bg-[#F4F5F7] px-2 py-0.5 rounded border border-[#DFE1E6]">
                          DEV-55102
                        </span>
                        <span className="bg-[#EAE6FF] text-[#403294] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#C0B6F2]">
                          HH-1184
                        </span>
                        <span className="bg-[#FFF0B3] text-[#FF8B00] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#FFE380]">
                          MEDIUM PRIORITY
                        </span>
                        <span className="bg-[#DEEBFF] text-[#0052CC] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#B3D4FF]">
                          ATTEMPTED
                        </span>
                      </div>
                      <div className="text-xs text-[#42526E] font-medium">👤 Priya Patel &bull; 📍 Ahmedabad, Gujarat</div>
                      <div className="text-xs text-[#5E6C84] mt-1.5">⚠️ Flagged by Rule: Audio Fingerprint Drop-off</div>
                    </div>
                    <span className="text-xs font-bold text-[#0052CC] bg-[#DEEBFF] px-3 py-1.5 rounded-[4px] border border-[#B3D4FF] self-start sm:self-center">
                      🔒 Locked by Agent 104
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 2: RULES ENGINE */}
              {activeTab === "rules" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between border-b border-[#DFE1E6] pb-4 gap-3">
                    <div>
                      <h3 className="text-base font-bold text-[#172B4D]">Active Anomaly Rules</h3>
                      <p className="text-xs text-[#5E6C84]">Rules scan telemetry events every 5 minutes to generate call list queues</p>
                    </div>
                    <button
                      onClick={() => setActiveRulePreview(!activeRulePreview)}
                      className="bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold px-3.5 py-1.5 rounded-[4px] shadow-xs transition-colors"
                    >
                      {activeRulePreview ? "Hide Dry Run Preview" : "⚡ Run Live Rule Test"}
                    </button>
                  </div>

                  {/* Rule Card 1 */}
                  <div className="bg-white border border-[#DFE1E6] rounded-[6px] p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#172B4D]">No Connectivity for 3+ Days</span>
                        <span className="bg-[#FFEBE6] text-[#BF2600] text-[10px] font-extrabold px-2 py-0.5 rounded-full">HIGH</span>
                        <span className="bg-[#E3FCEF] text-[#006644] text-[10px] font-extrabold px-2 py-0.5 rounded-full">ACTIVE</span>
                      </div>
                      <div className="text-xs font-semibold text-[#5E6C84]">Lookback: 4 Days</div>
                    </div>
                    <div className="text-xs font-mono text-[#172B4D] bg-[#F4F5F7] p-3 rounded-[4px] border border-[#DFE1E6] mt-2">
                      {`Condition: { "eventType": 36, "operator": "no_event", "min_days": 3 }`}
                    </div>
                  </div>

                  {/* Rule Card 2 */}
                  <div className="bg-white border border-[#DFE1E6] rounded-[6px] p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#172B4D]">Unrecognized Image Events Drop</span>
                        <span className="bg-[#FFF0B3] text-[#FF8B00] text-[10px] font-extrabold px-2 py-0.5 rounded-full">MEDIUM</span>
                        <span className="bg-[#E3FCEF] text-[#006644] text-[10px] font-extrabold px-2 py-0.5 rounded-full">ACTIVE</span>
                      </div>
                      <div className="text-xs font-semibold text-[#5E6C84]">Lookback: 7 Days</div>
                    </div>
                    <div className="text-xs font-mono text-[#172B4D] bg-[#F4F5F7] p-3 rounded-[4px] border border-[#DFE1E6] mt-2">
                      {`Condition: { "eventType": 30, "operator": "no_event", "min_days": 2 }`}
                    </div>
                  </div>

                  {/* Simulated Live Preview Box */}
                  {activeRulePreview && (
                    <div className="bg-[#DEEBFF] border border-[#B3D4FF] rounded-[6px] p-4 text-xs">
                      <div className="font-bold text-[#0052CC] mb-2">⚡ Rule Engine Execution Result:</div>
                      <div className="bg-white p-3 rounded border border-[#B3D4FF] font-mono text-[11px] text-[#172B4D]">
                        Matched 14 devices out of 10,412 total active households checked. 4 added to today&apos;s call queue.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: TICKETS */}
              {activeTab === "tickets" && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between border-b border-[#DFE1E6] pb-4 gap-3">
                    <div>
                      <h3 className="text-base font-bold text-[#172B4D]">Field Technician Escalation Queue</h3>
                      <p className="text-xs text-[#5E6C84]">Tickets dispatched from unresolved call list agent interviews</p>
                    </div>
                    <span className="bg-[#DEEBFF] text-[#0052CC] text-xs font-bold px-3 py-1 rounded-full border border-[#B3D4FF]">
                      2 Active Tickets
                    </span>
                  </div>

                  <div className="bg-white border border-[#DFE1E6] rounded-[6px] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-bold text-sm text-[#172B4D]">Meter Replacement Required</span>
                        <span className="bg-[#EAE6FF] text-[#403294] text-[10px] font-bold px-2 py-0.5 rounded-full">FIELD_TECHNICIAN</span>
                        <span className="bg-[#DEEBFF] text-[#0052CC] text-[10px] font-bold px-2 py-0.5 rounded-full">IN_PROGRESS</span>
                      </div>
                      <div className="text-xs text-[#5E6C84]">Device: DEV-89241 &bull; HHID: HH-4029 &bull; Raised by: Call Agent 102</div>
                    </div>
                    <Link href="/login" className="text-xs font-bold text-[#0052CC] hover:underline self-start sm:self-center">
                      View Audit Log &rarr;
                    </Link>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* Architecture & Workflow Diagram */}
      <section id="architecture" className="py-16 bg-[#FAFBFC] border-b border-[#DFE1E6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#0052CC] uppercase tracking-wider bg-[#DEEBFF] px-3 py-1 rounded-full border border-[#B3D4FF]">
              System Pipeline
            </span>
            <h2 className="text-3xl font-extrabold text-[#172B4D] mt-3">End-to-End Operational Pipeline</h2>
            <p className="text-sm text-[#5E6C84] mt-2">
              From raw telemetry events to resolved customer inquiries with full governance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            <div className="bg-white p-6 rounded-[8px] border border-[#DFE1E6] shadow-xs relative">
              <div className="w-8 h-8 bg-[#DEEBFF] text-[#0052CC] font-bold text-sm rounded-full flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="text-sm font-bold text-[#172B4D] mb-2">Telemetry Ingestion</h3>
              <p className="text-xs text-[#5E6C84] leading-relaxed">
                Hardware devices report connectivity, image recognition, and audio fingerprint event logs.
              </p>
            </div>

            <div className="bg-white p-6 rounded-[8px] border border-[#DFE1E6] shadow-xs relative">
              <div className="w-8 h-8 bg-[#E3FCEF] text-[#006644] font-bold text-sm rounded-full flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="text-sm font-bold text-[#172B4D] mb-2">Rule Engine Evaluation</h3>
              <p className="text-xs text-[#5E6C84] leading-relaxed">
                Automated rule definitions scan lookback windows and flag households matching anomaly metrics.
              </p>
            </div>

            <div className="bg-white p-6 rounded-[8px] border border-[#DFE1E6] shadow-xs relative">
              <div className="w-8 h-8 bg-[#FFF0B3] text-[#172B4D] font-bold text-sm rounded-full flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="text-sm font-bold text-[#172B4D] mb-2">Agent Call Locking</h3>
              <p className="text-xs text-[#5E6C84] leading-relaxed">
                Call list queues are generated daily. Agents lock households upon call initiation to prevent duplicate outreach.
              </p>
            </div>

            <div className="bg-white p-6 rounded-[8px] border border-[#DFE1E6] shadow-xs relative">
              <div className="w-8 h-8 bg-[#EAE6FF] text-[#403294] font-bold text-sm rounded-full flex items-center justify-center mb-4">
                4
              </div>
              <h3 className="text-sm font-bold text-[#172B4D] mb-2">Outcome & Escalation</h3>
              <p className="text-xs text-[#5E6C84] leading-relaxed">
                Calls are logged with structured tags or escalated directly to technical field teams.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section id="features" className="py-16 bg-white border-b border-[#DFE1E6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-[#0052CC] uppercase tracking-wider mb-2">Key Modules</h2>
            <h3 className="text-3xl font-extrabold text-[#172B4D]">Designed for enterprise-scale support</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white p-6 rounded-[8px] border border-[#DFE1E6] shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-[#DEEBFF] text-[#0052CC] rounded-[6px] flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-[#172B4D] mb-2">Rule Engine & Lookbacks</h3>
              <p className="text-xs text-[#5E6C84] leading-relaxed">
                Create event-driven rules based on custom event types (Connectivity, Image Recognition, Audio Fingerprint) with customizable lookback windows.
              </p>
            </div>

            <div className="bg-white p-6 rounded-[8px] border border-[#DFE1E6] shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-[#E3FCEF] text-[#006644] rounded-[6px] flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-[#172B4D] mb-2">Agent Call Dispatch</h3>
              <p className="text-xs text-[#5E6C84] leading-relaxed">
                Prioritized queue management with single-click call locking, structured outcome logging, issue tagging, and automated status transition.
              </p>
            </div>

            <div className="bg-white p-6 rounded-[8px] border border-[#DFE1E6] shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-[#EAE6FF] text-[#403294] rounded-[6px] flex items-center justify-center mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-[#172B4D] mb-2">Role-Based Access Control</h3>
              <p className="text-xs text-[#5E6C84] leading-relaxed">
                Strict permissions tailored for Developers, Panel Managers, and Call Agents, including mandatory first-login password updates.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-14 bg-[#0052CC] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-extrabold tracking-tight">Ready to access your CRM Console?</h3>
            <p className="text-sm text-[#B3D4FF] mt-1">Sign in with your assigned operational role credentials.</p>
          </div>
          <Link
            href="/login"
            className="bg-white text-[#0052CC] hover:bg-[#F4F5F7] font-bold text-sm px-6 py-3 rounded-[4px] shadow-md transition-all whitespace-nowrap flex items-center gap-2"
          >
            <span>Sign In to Console</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Atlassian Style Footer */}
      <footer className="bg-[#172B4D] text-[#A5ADBA] py-12 border-t border-[#253858] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-base mb-3">
              <div className="w-6 h-6 bg-[#0052CC] rounded-[4px] flex items-center justify-center text-white text-xs font-black">
                C
              </div>
              <span>CRM Portal</span>
            </div>
            <p className="text-[#A5ADBA] leading-relaxed">
              Enterprise support management and device telemetry operations portal.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">System Modules</h4>
            <ul className="space-y-2">
              <li><Link href="/login" className="hover:text-white transition-colors">Call List Queue</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Anomaly Rules Engine</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Field Ticket Escalations</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#overview" className="hover:text-white transition-colors">System Overview</a></li>
              <li><a href="#architecture" className="hover:text-white transition-colors">Telemetry Architecture</a></li>
              <li><a href="#solutions" className="hover:text-white transition-colors">Workstation Guide</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">System Health</h4>
            <div className="flex items-center gap-2 text-[#36B37E] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#36B37E]"></span>
              Operational SLA: 99.9%
            </div>
            <p className="text-[#A5ADBA] mt-2">Telemetry Dispatcher: v2.4.0</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-[#253858] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>&copy; {new Date().getFullYear()} Inditronics CRM Portal. Designed with Atlassian Design System guidelines.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>
      </footer>

    </div>
  );
}