import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  XCircle,
  Cpu,
  DollarSign,
  Zap,
  Server,
  Database,
  ExternalLink,
  Code2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ListOrdered,
  LayoutGrid
} from 'lucide-react';
import { ARCHITECTURE_OPTIONS, STEP_BY_STEP_RECOMMENDATION } from '../data/architectureComparison';
import { OptionABlueprint } from './OptionABlueprint';

export const ArchitectureExplorer: React.FC = () => {
  const [viewMode, setViewMode] = useState<'blueprint' | 'comparison'>('blueprint');
  const [selectedOptionId, setSelectedOptionId] = useState<string>('option-serverless');
  const [traderCount, setTraderCount] = useState<number>(500);

  const currentOption = ARCHITECTURE_OPTIONS.find(o => o.id === selectedOptionId) || ARCHITECTURE_OPTIONS[0];

  // Dynamic cost calculation based on user slider
  const getDynamicCost = (optionId: string, users: number) => {
    if (optionId === 'option-serverless') {
      if (users < 1000) return '$0 – $5 / mo (Free Tier)';
      if (users < 10000) return '$15 – $30 / mo (Cloudflare + Supabase Pro)';
      return '$45 – $80 / mo';
    }
    if (optionId === 'option-hybrid-microservice') {
      if (users < 1000) return '$25 – $40 / mo (Render / Fly.io + Redis)';
      if (users < 10000) return '$60 – $120 / mo (Managed Postgres + Scaled Celery)';
      return '$180 – $350 / mo';
    }
    // Option C
    if (users < 1000) return '$15 – $25 / mo';
    if (users < 10000) return '$40 – $90 / mo';
    return '$120 – $220 / mo';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-3">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>System Architecture & Deployment Trade-Offs</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Ways to Build Your Interactive Stock Scanner Site
        </h1>
        <p className="mt-4 text-slate-400 text-base leading-relaxed">
          Evaluating the three premier architectural patterns to connect your Python scanner (
          <code className="text-cyan-400 font-mono text-xs bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
            harryguiacorn/Ichimoku-Cloud-Signal-Python
          </code>
          ) with user authentication, custom watchlists, and real-time alerts.
        </p>

        {/* View Mode Toggle Switch */}
        <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-900 border border-slate-800 mt-6 shadow-xl">
          <button
            onClick={() => setViewMode('blueprint')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              viewMode === 'blueprint'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Option A: Detailed Step-by-Step Blueprint</span>
          </button>
          <button
            onClick={() => setViewMode('comparison')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              viewMode === 'comparison'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Compare Options (A vs B vs C)</span>
          </button>
        </div>
      </div>

      {viewMode === 'blueprint' ? (
        /* Option A Step-by-Step Detailed Blueprint */
        <OptionABlueprint />
      ) : (
        /* Original Options Comparison View */
        <div className="space-y-12">
          {/* Option Selector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ARCHITECTURE_OPTIONS.map(opt => {
              const isSelected = opt.id === selectedOptionId;

              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedOptionId(opt.id)}
                  className={`text-left p-6 rounded-2xl border transition-all relative ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  {opt.id === 'option-serverless' && (
                    <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-500 text-slate-950 shadow">
                      Recommended for MVP
                    </div>
                  )}
                  {opt.id === 'option-hybrid-microservice' && (
                    <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-blue-500 text-white shadow">
                      Sub-Second Streaming
                    </div>
                  )}

                  <div className="text-xs font-mono font-semibold text-cyan-400 mb-1">{opt.title.split(':')[0]}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{opt.title.split(':')[1] || opt.title}</h3>
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2">{opt.subtitle}</p>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">Est. Cost:</span>
                    <span className="text-emerald-400 font-semibold">{opt.costEstimate}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500">Complexity:</span>
                    <span
                      className={`font-semibold ${
                        opt.complexity === 'Low'
                          ? 'text-emerald-400'
                          : opt.complexity === 'Medium'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {opt.complexity}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Option Detail Panel */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-6 sm:p-8 border-b border-slate-800 bg-slate-900/90 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="inline-flex items-center space-x-1 text-xs font-mono text-cyan-400 mb-1">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Deep-Dive Analysis</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">{currentOption.title}</h2>
                <p className="text-sm text-slate-400 mt-1">{currentOption.subtitle}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                {selectedOptionId === 'option-serverless' && (
                  <button
                    onClick={() => setViewMode('blueprint')}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors flex items-center space-x-1.5"
                  >
                    <span>View Step-by-Step Blueprint</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700">
                  <span className="text-slate-400">Latency: </span>
                  <span className="text-white font-semibold">{currentOption.latency}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700">
                  <span className="text-slate-400">Target: </span>
                  <span className="text-white font-semibold">{currentOption.complexity} Maintenance</span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-8">
              {/* Summary & Best For */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">Ideal Use Case</h4>
                <p className="text-sm sm:text-base text-slate-200 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  {currentOption.recommendedFor}
                </p>
              </div>

              {/* Architecture Flow Diagram */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-2">Data Flow Pipeline</h4>
                <pre className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm font-mono text-cyan-300 overflow-x-auto leading-relaxed shadow-inner">
                  {currentOption.diagram}
                </pre>
              </div>

              {/* Pros and Cons Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pros */}
                <div className="p-6 rounded-2xl bg-emerald-950/15 border border-emerald-500/20">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm mb-4">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Advantages & Pros</span>
                  </div>
                  <ul className="space-y-3">
                    {currentOption.pros.map((pro, idx) => (
                      <li key={idx} className="text-xs sm:text-sm text-slate-300 flex items-start space-x-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Cons */}
                <div className="p-6 rounded-2xl bg-rose-950/15 border border-rose-500/20">
                  <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm mb-4">
                    <XCircle className="w-5 h-5" />
                    <span>Trade-offs & Cons</span>
                  </div>
                  <ul className="space-y-3">
                    {currentOption.cons.map((con, idx) => (
                      <li key={idx} className="text-xs sm:text-sm text-slate-300 flex items-start space-x-2">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Technology Blueprint */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">
                <h4 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  <span>Recommended Production Stack</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block mb-1">Frontend Client:</span>
                    <span className="text-slate-200">{currentOption.techStack.frontend}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block mb-1">Python Engine:</span>
                    <span className="text-slate-200">{currentOption.techStack.backend}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block mb-1">User & Watchlist Database:</span>
                    <span className="text-slate-200">{currentOption.techStack.database}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block mb-1">Queue / Cron Scheduler:</span>
                    <span className="text-slate-200">{currentOption.techStack.queueOrWorker}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block mb-1">Cloud Hosting:</span>
                    <span className="text-slate-200">{currentOption.techStack.hosting}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block mb-1">Monthly Base Cost:</span>
                    <span className="text-emerald-400 font-bold">{currentOption.costEstimate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Cost & Scaling Calculator */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  <span>Interactive Cost Estimator</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Simulate monthly infrastructure costs as your trading community scales.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 font-mono">Active Traders: </span>
                <span className="text-lg font-bold text-cyan-400 font-mono">{traderCount.toLocaleString()}</span>
              </div>
            </div>

            {/* Range Slider */}
            <div className="space-y-2 mb-6">
              <input
                type="range"
                min="50"
                max="15000"
                step="50"
                value={traderCount}
                onChange={e => setTraderCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>50 Traders (Hobby / Friends)</span>
                <span>1,000 (Early Community)</span>
                <span>5,000 (Growing SaaS)</span>
                <span>15,000+ (Commercial Scale)</span>
              </div>
            </div>

            {/* Cost Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ARCHITECTURE_OPTIONS.map(opt => (
                <div
                  key={opt.id}
                  className={`p-4 rounded-xl border ${
                    opt.id === selectedOptionId
                      ? 'bg-slate-800/80 border-cyan-500/60 ring-1 ring-cyan-500/20'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-400">{opt.title.split(':')[0]}</div>
                  <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
                    {getDynamicCost(opt.id, traderCount)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2">
                    {opt.id === 'option-serverless'
                      ? 'Leverages generous edge free tiers and batch execution.'
                      : opt.id === 'option-hybrid-microservice'
                      ? 'Continuous container CPU + high-frequency WebSockets.'
                      : 'Balanced middle ground with separate API compute.'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Practical Implementation Roadmap */}
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 p-8 sm:p-10 relative overflow-hidden">
            <div className="max-w-3xl">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-cyan-500/20 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Strategic Recommendation for Your Repo</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                {STEP_BY_STEP_RECOMMENDATION.verdict}
              </h3>
              <div className="mt-6 space-y-4 text-sm text-slate-300">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-cyan-400 mb-1">Phase 1: Zero-Dollar MVP (Week 1–2)</h5>
                    <button
                      onClick={() => setViewMode('blueprint')}
                      className="text-xs font-mono text-cyan-400 hover:underline flex items-center space-x-1"
                    >
                      <span>Start Step 1</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">{STEP_BY_STEP_RECOMMENDATION.phase1}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <h5 className="font-bold text-blue-400 mb-1">Phase 2: High-Frequency Streaming (Week 4+)</h5>
                  <p className="text-slate-300 text-xs leading-relaxed">{STEP_BY_STEP_RECOMMENDATION.phase2}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

