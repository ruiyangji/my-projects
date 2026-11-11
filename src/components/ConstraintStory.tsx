import { useEffect, useRef, useState, type JSX } from "react";
import { Badge } from "@astryxdesign/core/Badge";
import { Button } from "@astryxdesign/core/Button";
import { Tab, TabList } from "@astryxdesign/core/TabList";
import { Theme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral/built";
import { ArrowRight, Blocks, Braces, CircleDollarSign, Gauge, ShieldCheck, Workflow } from "lucide-react";

type CaseId = "browser" | "scheduler";

interface StoryStep {
  label: string;
  heading: string;
  detail: string;
}

interface CaseStudy {
  id: CaseId;
  name: string;
  tabLabel: string;
  eyebrow: string;
  icon: typeof Workflow;
  audiencePressure: string;
  steps: StoryStep[];
  evidence: { value: string; label: string; context: string };
  startupImpact: string;
  chosenTradeoff: string;
  baseline: { name: string; description: string; cost: string };
}

const caseStudies: Record<CaseId, CaseStudy> = {
  browser: {
    id: "browser",
    name: "Trace2Code",
    tabLabel: "Trace2Code",
    eyebrow: "BROWSER AUTOMATION",
    icon: Workflow,
    audiencePressure: "A team needs to repeat the same multi-step browser task across many runs.",
    steps: [
      { label: "Pressure", heading: "Repeat the work", detail: "A person demonstrates a browser workflow that needs to run again and again." },
      { label: "Constraint", heading: "Keep each run predictable", detail: "A model-driven decision loop adds model latency and token use at runtime." },
      { label: "Design choice", heading: "Compile the workflow once", detail: "I turn the demonstration into typed workflow steps and generated Playwright code before execution." },
      { label: "Evidence", heading: "No runtime model tokens", detail: "The compiled program uses ordinary Playwright automation when it runs." },
      { label: "Tradeoff", heading: "Spend effort before the first run", detail: "Compilation takes work up front and leaves less room for runtime improvisation when a page departs from the demonstrated path." },
    ],
    evidence: { value: "0", label: "runtime LLM tokens", context: "Architectural guarantee" },
    startupImpact: "For a startup team, moving model work out of repeated runs makes execution latency and runtime token use easier to predict.",
    chosenTradeoff: "The workflow takes extra work to compile and is less open-ended if the page departs from the demonstrated path.",
    baseline: {
      name: "Runtime agent loop",
      description: "Ask a model to interpret the page and choose each next action during every run.",
      cost: "Flexible when a page changes, with added model latency and token use at each decision point.",
    },
  },
  scheduler: {
    id: "scheduler",
    name: "RL Cluster Scheduler",
    tabLabel: "Scheduler",
    eyebrow: "RESOURCE SCHEDULING",
    icon: ShieldCheck,
    audiencePressure: "A scheduler must place workloads across machines with finite CPU and memory.",
    steps: [
      { label: "Pressure", heading: "Place useful work", detail: "A learned policy assigns tasks to machines as cluster conditions change." },
      { label: "Constraint", heading: "Respect machine capacity", detail: "An allocation that exceeds CPU or memory limits should not be selected." },
      { label: "Design choice", heading: "Mask invalid actions first", detail: "I exclude infeasible allocations before the policy samples an action." },
      { label: "Evidence", heading: "Show the measured result", detail: "The project reports faster training convergence and zero hardware constraint violations during deployment." },
      { label: "Tradeoff", heading: "Give up some exploration", detail: "Action masking narrows the policy’s exploration space and depends on accurate CPU and memory constraints." },
    ],
    evidence: { value: "+40%", label: "faster training convergence", context: "Reported project result" },
    startupImpact: "For a startup operating shared compute, explicit capacity rules reduce the risk of the policy choosing an allocation the hardware cannot support.",
    chosenTradeoff: "The policy explores a smaller action space and depends on accurate CPU and memory limits.",
    baseline: {
      name: "Reward penalty",
      description: "Allow every allocation, then subtract reward when the policy exceeds hardware limits.",
      cost: "Infeasible choices remain available during learning; penalty size can distort the reward signal or invite repeated violations.",
    },
  },
};

const stageIcons = [CircleDollarSign, Braces, Blocks, Gauge, ShieldCheck];

function ConstraintPath({ steps, activeStep, onSelect }: { steps: StoryStep[]; activeStep: number; onSelect: (index: number) => void }) {
  const progress = activeStep / (steps.length - 1);

  return <div className="relative mb-6">
    <svg aria-hidden="true" viewBox="0 0 1000 24" preserveAspectRatio="none" className="pointer-events-none absolute left-0 top-[17px] hidden h-3 w-full sm:block">
      <line x1="30" y1="6" x2="970" y2="6" stroke="rgba(161,161,170,.25)" strokeWidth="2" />
      <line x1="30" y1="6" x2={30 + 940 * progress} y2="6" stroke="url(#constraint-progress)" strokeWidth="2" className="transition-all duration-300 motion-reduce:transition-none" />
      <defs><linearGradient id="constraint-progress"><stop stopColor="#6ee7b7" /><stop offset="1" stopColor="#818cf8" /></linearGradient></defs>
    </svg>
    <div className="relative grid gap-2 sm:grid-cols-5 sm:gap-1">
      {steps.map((step, index) => {
        const Icon = stageIcons[index];
        const selected = activeStep === index;
        return <button key={step.label} type="button" aria-pressed={selected} onClick={() => onSelect(index)} className={`group flex min-h-[56px] items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 sm:min-h-0 sm:flex-col sm:items-start sm:border-0 sm:bg-transparent sm:px-1 sm:pt-0 ${selected ? "border-indigo-300/30 bg-indigo-300/[0.07]" : "border-white/[0.06] bg-black/10 hover:bg-white/[0.04] sm:bg-transparent"}`}>
          <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors motion-reduce:transition-none sm:mb-2 ${selected ? "border-indigo-200 bg-indigo-300 text-zinc-950" : index < activeStep ? "border-emerald-300/50 bg-emerald-300/10 text-emerald-200" : "border-zinc-700 bg-zinc-950 text-zinc-500 group-hover:border-zinc-500"}`}>
            <Icon aria-hidden="true" className="h-3.5 w-3.5" />
          </span>
          <span className={`text-xs font-semibold sm:text-[10px] ${selected ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"}`}>{step.label}</span>
        </button>;
      })}
    </div>
  </div>;
}

function CasePanel({ study, panelId }: { study: CaseStudy; panelId: string }) {
  const [activeStep, setActiveStep] = useState(0);
  const [showTradeoff, setShowTradeoff] = useState(false);
  const currentStep = study.steps[activeStep];
  const ProjectIcon = study.icon;

  return <div id={panelId} role="tabpanel" tabIndex={0} aria-labelledby={`${study.id}-tab`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300">
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10">
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-300/15 bg-indigo-300/[0.07] text-indigo-200"><ProjectIcon aria-hidden="true" className="h-5 w-5" /></span>
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-300">{study.eyebrow}</p><h3 className="mt-1 text-xl font-semibold tracking-tight text-zinc-100">{study.name}</h3></div>
        </div>
        <div className="rounded-xl border border-white/[0.07] bg-black/20 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">The product pressure</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-300">{study.audiencePressure}</p>
        </div>
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
          <div className="flex items-center gap-2"><span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">Why a startup team cares</span><ArrowRight aria-hidden="true" className="h-3 w-3 text-emerald-300" /></div>
          <p className="mt-2 text-xs leading-relaxed text-zinc-400">{study.startupImpact}</p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-emerald-300/15 bg-emerald-300/[0.045] p-4">
          <div className="font-mono text-2xl font-bold tracking-tight text-emerald-200">{study.evidence.value}</div>
          <div><p className="text-xs font-semibold text-zinc-200">{study.evidence.label}</p><Badge className="mt-1" variant={study.id === "scheduler" ? "info" : "success"} label={study.evidence.context} /></div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">My decision path</p><p className="mt-1 text-xs text-zinc-400">Select a stage to follow the reasoning.</p></div>
          <span className="font-mono text-[10px] text-zinc-600">0{activeStep + 1} / 0{study.steps.length}</span>
        </div>
        <ConstraintPath steps={study.steps} activeStep={activeStep} onSelect={setActiveStep} />
        <div aria-live="polite" className="min-h-[112px] rounded-xl border border-white/[0.08] bg-[#09090b] p-4 sm:p-5">
          <div className="mb-2 flex items-center gap-2"><span className="font-mono text-[10px] text-indigo-300">{String(activeStep + 1).padStart(2, "0")}</span><span className="h-px w-5 bg-white/15" /><h4 className="text-sm font-semibold text-zinc-100">{currentStep.heading}</h4></div>
          <p className="text-xs leading-relaxed text-zinc-400">{currentStep.detail}</p>
        </div>
        <div className="mt-3">
          <Button label={showTradeoff ? "Hide the tradeoff" : "Show the tradeoff"} variant="secondary" size="sm" onClick={() => setShowTradeoff((visible) => !visible)} aria-expanded={showTradeoff} aria-controls={`${study.id}-tradeoff`} />
          <div id={`${study.id}-tradeoff`} hidden={!showTradeoff} className="mt-3 rounded-xl border border-amber-300/15 bg-amber-300/[0.04] p-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-200">Chosen design cost</p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-300">{study.chosenTradeoff}</p>
            </div>
            <div className="mt-3 border-t border-white/[0.07] pt-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-200">Alternative: {study.baseline.name}</p>
              <p className="mt-2 text-xs leading-relaxed text-zinc-300">{study.baseline.description}</p>
              <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">Its cost: {study.baseline.cost}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>;
}

function ConstraintStory(): JSX.Element {
  const [selectedCase, setSelectedCase] = useState<CaseId>("browser");
  const graderDialogRef = useRef<HTMLDialogElement>(null);
  const currentStudy = caseStudies[selectedCase];
  const panelId = `${selectedCase}-panel`;

  useEffect(() => {
    const dialog = graderDialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    return () => { if (dialog.open) dialog.close(); };
  }, []);

  function closeGraderDialog() {
    graderDialogRef.current?.close();
  }

  return <Theme theme={neutralTheme} mode="dark">
    <section id="how-i-build" aria-labelledby="how-i-build-heading" className="scroll-mt-8 border-t border-white/[0.07] bg-[#0a0a0d] px-5 py-16 sm:px-8 sm:py-20">
      <dialog ref={graderDialogRef} aria-labelledby="grader-dialog-heading" aria-describedby="grader-dialog-description" className="m-auto max-h-[min(90vh,42rem)] w-[min(92vw,38rem)] rounded-2xl border border-white/10 bg-[#111114] p-0 text-zinc-100 shadow-2xl shadow-black/50 backdrop:bg-black/75 backdrop:backdrop-blur-sm">
        <div className="p-5 sm:p-7">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">Portfolio content check</p>
          <h2 id="grader-dialog-heading" className="text-xl font-semibold tracking-tight text-white">Are you the grader?</h2>
          <p id="grader-dialog-description" className="mt-2 text-sm leading-relaxed text-zinc-400">We’ll take you straight to the multimodal piece.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button label="Take me there" variant="primary" onClick={closeGraderDialog} />
            <Button label="No, just exploring" variant="secondary" onClick={closeGraderDialog} />
          </div>
        </div>
      </dialog>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-12">
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">Second multimodal piece · How I build</p>
            <h2 id="how-i-build-heading" className="max-w-xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-4xl">I turn constraints into dependable behavior.</h2>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-400">I look for the requirement a product team cannot afford to miss, then make it visible in the system. These two projects show how I approach that decision—and what each choice costs.</p>
        </div>

        <div role="group" aria-label="Modes in this piece" className="mb-5 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.13em] text-zinc-500">Modes</span>
          {["Visual", "Spatial", "Gestural", "Linguistic"].map((mode) => <span key={mode} className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.04] px-2.5 py-1 text-[10px] font-medium text-emerald-100">{mode}</span>)}
        </div>

        <div className="rounded-2xl border border-white/[0.09] bg-zinc-900/70 p-4 shadow-2xl shadow-indigo-950/10 sm:p-6 lg:p-8">
          <TabList value={selectedCase} onChange={(value) => setSelectedCase(value as CaseId)} role="tablist" layout="fill" aria-label="Choose a project example" className="mb-6 border-b border-white/[0.08]" >
            <Tab id="browser-tab" value="browser" label={caseStudies.browser.tabLabel} panelId="browser-panel" />
            <Tab id="scheduler-tab" value="scheduler" label={caseStudies.scheduler.tabLabel} panelId="scheduler-panel" />
          </TabList>
          <CasePanel key={selectedCase} study={currentStudy} panelId={panelId} />
        </div>

        <div className="mt-7 flex flex-col gap-4 border-t border-white/[0.07] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-3xl text-xs leading-relaxed text-zinc-500">My approach is to make the important constraint explicit, design around it, and explain the tradeoff to the people who will operate the system.</p>
          <a href="#approach" className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold text-indigo-200 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300">See how to read the project evidence <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" /></a>
        </div>
        <p className="mt-4 text-[10px] leading-relaxed text-zinc-600">The diagrams explain the project decisions. They do not run the original browser compiler or a trained scheduling policy. Scheduler results are reported project outcomes.</p>
      </div>
    </section>
  </Theme>;
}

export default ConstraintStory;
