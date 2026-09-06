import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Copy,
  Check,
  ExternalLink,
  FileCode,
  Terminal,
  Database,
  Calendar,
  Bell,
  Globe,
  Sparkles,
  Clock,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  Zap,
  Code2,
  BookmarkCheck
} from 'lucide-react';
import { OPTION_A_STEPS, ImplementationStep } from '../data/optionASteps';

export const OptionABlueprint: React.FC = () => {
  const [activeStepId, setActiveStepId] = useState<string>(OPTION_A_STEPS[0].id);
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const activeStep = OPTION_A_STEPS.find(s => s.id === activeStepId) || OPTION_A_STEPS[0];

  const toggleStepCompleted = (stepId: string) => {
    setCompletedSteps(prev =>
      prev.includes(stepId) ? prev.filter(id => id !== stepId) : [...prev, stepId]
    );
  };

  const handleCopyCode = () => {
    if (!activeStep.codeSnippet) return;
    navigator.clipboard.writeText(activeStep.codeSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const getStepIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return <Database className="w-4 h-4" />;
      case 1:
        return <Terminal className="w-4 h-4" />;
      case 2:
        return <Calendar className="w-4 h-4" />;
      case 3:
        return <Code2 className="w-4 h-4" />;
      case 4:
        return <Bell className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const progressPercent = Math.round((completedSteps.length / OPTION_A_STEPS.length) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Overview Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-cyan-950/40 border border-emerald-500/30 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>Option A Execution Masterplan</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              From Local Python Repo to Production Web Platform
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Step-by-step roadmap to hook your existing Python calculations (
              <code className="text-cyan-300 font-mono text-xs bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800">
                harryguiacorn/Ichimoku-Cloud-Signal-Python
              </code>
              ) to a free PostgreSQL database, automated 15-minute GitHub Actions worker, and live real-time React dashboard.
            </p>
          </div>

          {/* Progress Tracker Widget */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 min-w-[240px] text-xs font-mono space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Launch Readiness:</span>
              <span className="text-emerald-400 font-bold text-sm">{progressPercent}% Complete</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{completedSteps.length} of {OPTION_A_STEPS.length} Milestones Checked</span>
              <span>Est. Cost: $0/mo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Steps Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {OPTION_A_STEPS.map((step, idx) => {
          const isSelected = step.id === activeStepId;
          const isDone = completedSteps.includes(step.id);

          return (
            <button
              key={step.id}
              onClick={() => setActiveStepId(step.id)}
              className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500 ring-1 ring-cyan-500/50 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950'
                      : isDone
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                </span>

                <span className={`text-xs ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`}>
                  {getStepIcon(idx)}
                </span>
              </div>

              <div>
                <div className="text-[11px] font-mono text-slate-400">Step 0{idx + 1}</div>
                <div className="text-xs font-bold text-white line-clamp-1 mt-0.5">{step.title.split(' ')[0]} {step.title.split(' ')[1]}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Step Deep-Dive Container */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
        {/* Step Header */}
        <div className="p-6 sm:p-8 border-b border-slate-800 bg-slate-900/90 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-1">
              <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30">
                STEP 0{activeStep.stepNumber} OF 0{OPTION_A_STEPS.length}
              </span>
              <span>•</span>
              <span className="text-slate-400 flex items-center space-x-1">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>{activeStep.timeEstimate}</span>
              </span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center space-x-1">
                <DollarSign className="w-3 h-3" />
                <span>{activeStep.cost}</span>
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">{activeStep.title}</h3>
            <p className="text-sm text-slate-400 mt-1.5">{activeStep.summary}</p>
          </div>

          {/* Mark Complete Checkbox */}
          <button
            onClick={() => toggleStepCompleted(activeStep.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all self-start lg:self-auto ${
              completedSteps.includes(activeStep.id)
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            {completedSteps.includes(activeStep.id) ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Milestone Completed</span>
              </>
            ) : (
              <>
                <Circle className="w-4 h-4 text-slate-400" />
                <span>Mark as Done</span>
              </>
            )}
          </button>
        </div>

        {/* Step Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Action Checklist */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1.5">
              <BookmarkCheck className="w-4 h-4 text-cyan-400" />
              <span>Action Items for This Step</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeStep.checklist.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 flex items-start space-x-3 text-xs text-slate-300"
                >
                  <span className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-mono font-bold text-[10px] flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Code Artifact / Configuration Snippet */}
          {activeStep.codeSnippet && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  <span className="text-white font-semibold">{activeStep.fileName}</span>
                  <span className="text-slate-600">|</span>
                  <span className="uppercase text-[10px] text-slate-500">{activeStep.language}</span>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold flex items-center space-x-1.5 transition-colors border border-slate-700"
                >
                  {copiedSnippet ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Full Code</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed shadow-inner max-h-[420px] scrollbar-thin">
                {activeStep.codeSnippet}
              </pre>
            </div>
          )}

          {/* Detailed Explanation & Pro Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h5 className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Why This Step Matters</span>
              </h5>
              <p className="text-xs text-slate-300 leading-relaxed">{activeStep.explanation}</p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-950/15 border border-amber-500/20 space-y-2">
              <h5 className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Architectural Tips & Gotchas</span>
              </h5>
              <ul className="space-y-1.5">
                {activeStep.tips.map((tip, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Step Navigation Bottom Bar */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                const prevIdx = activeStep.stepNumber - 2;
                if (prevIdx >= 0) setActiveStepId(OPTION_A_STEPS[prevIdx].id);
              }}
              disabled={activeStep.stepNumber === 1}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
            >
              ← Previous Step
            </button>

            <span className="text-xs font-mono text-slate-500">
              {activeStep.stepNumber} of {OPTION_A_STEPS.length}
            </span>

            <button
              onClick={() => {
                const nextIdx = activeStep.stepNumber;
                if (nextIdx < OPTION_A_STEPS.length) setActiveStepId(OPTION_A_STEPS[nextIdx].id);
              }}
              disabled={activeStep.stepNumber === OPTION_A_STEPS.length}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-colors flex items-center space-x-1"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
