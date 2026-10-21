"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Activity, ArrowRight, Check, CheckCircle2, ChevronDown, ChevronRight, CircuitBoard, Clock3, Code2, Cpu, Database, Gauge, Hand, Layers3, Network, Pause, Play, RotateCcw, ShieldCheck, SlidersHorizontal, Sparkles, Terminal, Workflow, XCircle } from "lucide-react";

interface Tradeoff { leftLabel: string; rightLabel: string; position: number; leftDescription: string; rightDescription: string }
interface EvidenceContext { status: string; description: string }
interface Decision { id: string; number: string; title: string; chosen: string; baseline: string; chosenDescription: string; baselineDescription: string; metric: string; metricLabel: string; evidence: EvidenceContext; tradeoff: Tradeoff; failureModes: string[]; takeaways: string[] }
interface Stage { id: string; title: string; subtitle: string; icon: typeof Activity; input: string; output: string; detail: string }
interface Project { id: "trace2code" | "scheduler"; name: string; eyebrow: string; thesis: string; stack: string[]; decisions: Decision[]; accent: "emerald" | "indigo" }

const projects: Project[] = [
  { id: "trace2code", name: "Trace2Code", eyebrow: "Browser demonstration compiler", thesis: "Turn a human browser demonstration into deterministic Playwright code, with no LLM calls at runtime.", stack: ["TypeScript", "Playwright", "Chrome DevTools Protocol", "LLMs", "AST manipulation"], accent: "emerald", decisions: [
    { id: "compile-time", number: "01", title: "Compile once, execute deterministically", chosen: "Zero-runtime LLM compiler", baseline: "Runtime ReAct agent loop", chosenDescription: "Synthesize an AST and generate a Playwright program during compilation. Runtime work is ordinary browser automation.", baselineDescription: "Ask an LLM to inspect the page and choose the next action at every step of each run.", metric: "0", metricLabel: "runtime tokens consumed", evidence: { status: "Architectural guarantee", description: "All LLM work happens during compilation. Execution uses native Playwright speed instead of seconds of model latency per step." }, tradeoff: { leftLabel: "Determinism", rightLabel: "Dynamic flexibility", position: 24, leftDescription: "Reproducible, compiled browser actions", rightDescription: "Open-ended runtime improvisation" }, failureModes: ["Agent loops add seconds of model latency at every decision point, making long workflows slow and expensive.", "Sampling and prompt drift can produce different actions for the same page, undermining reproducible crawls and tests.", "A runtime model outage or rate limit can stop an otherwise healthy browser run."], takeaways: ["Move interpretation to compile time when the workflow is known from a demonstration.", "Execution latency drops from seconds per model step to native browser automation speed; runtime API spend is zero."] },
    { id: "workflow-ir", number: "02", title: "Record intent, not fragile selectors", chosen: "LLM-backed Workflow IR", baseline: "Naive DOM selector recording", chosenDescription: "Infer semantic actions and reusable input parameters from CDP event streams, then represent them in a typed workflow IR.", baselineDescription: "Capture the DOM selector and literal value observed for every click and input event.", metric: "IR", metricLabel: "semantic workflow layer", evidence: { status: "Design property", description: "The intermediate representation captures inferred intent and parameters; no numeric robustness benchmark was provided." }, tradeoff: { leftLabel: "Robust intent", rightLabel: "Capture simplicity", position: 31, leftDescription: "Parameterizable actions that survive DOM noise", rightDescription: "Low-overhead raw event recording" }, failureModes: ["Generated selectors can depend on transient classes, element order, or framework-specific markup.", "Literal values captured from one run do not generalize to a different user, record, or environment."], takeaways: ["The IR separates what the user meant to do from how one particular DOM happened to look.", "Compilation takes extra work up front, then supports parameterized runs with less sensitivity to incidental markup changes."] },
    { id: "recovery", number: "03", title: "Recover from UI drift at runtime", chosen: "Semantic recovery runtime", baseline: "Strict fail-stop execution", chosenDescription: "Use semantic context and recovery strategies when UI mutations or dynamic class names invalidate a generated locator.", baselineDescription: "Stop immediately when a recorded selector no longer resolves to the expected element.", metric: "UI", metricLabel: "mutation recovery", evidence: { status: "Qualitative capability", description: "Fallbacks target UI mutations and dynamic class renaming; no numeric recovery rate was provided." }, tradeoff: { leftLabel: "Strict failure", rightLabel: "Resilient recovery", position: 73, leftDescription: "Fast, clear failure on any mismatch", rightDescription: "Recover through common interface changes" }, failureModes: ["Small CSS or class-name changes can make selector recordings fail even when the intended control is still present.", "Remote headless containers can expose timing and rendering variation that is uncommon on a developer workstation."], takeaways: ["Recovery is a bounded fallback, preserving deterministic generated steps as the normal path.", "A small evaluation cost buys more reliable runs in continuous deployment and remote browser environments."] }
  ] },
  { id: "scheduler", name: "RL Cluster Scheduler", eyebrow: "Discrete-event distributed resource management", thesis: "Train a policy to allocate cluster resources safely and generalize across changing task and machine sets.", stack: ["Python", "PyTorch", "Gymnasium", "PPO", "Set Transformers"], accent: "indigo", decisions: [
    { id: "action-mask", number: "01", title: "Make invalid allocations impossible", chosen: "Action masking before policy sampling", baseline: "Negative reward for violations", chosenDescription: "Mask infeasible CPU and memory allocations before the policy produces probabilities, so invalid actions cannot be sampled.", baselineDescription: "Allow every action, then teach the policy to avoid hardware violations through a penalty in the reward.", metric: "+40%", metricLabel: "faster training convergence", evidence: { status: "Reported project result", description: "Compared with negative-reward penalties; deployment recorded zero hardware constraint violations." }, tradeoff: { leftLabel: "Exploration freedom", rightLabel: "Constraint safety", position: 82, leftDescription: "Learn from the full action space", rightDescription: "Exclude infeasible actions up front" }, failureModes: ["A penalty still permits the policy to try allocations that exceed physical CPU or memory capacity.", "Very large penalties can distort the reward scale, while smaller ones invite repeated invalid exploration or reward hacking."], takeaways: ["Enforce hard hardware constraints in the action space instead of expecting reward shaping to teach safety.", "Training converged 40% faster, with zero hardware constraint violations during deployment."] },
    { id: "set-attention", number: "02", title: "Represent machines and tasks as sets", chosen: "Permutation-invariant Set Transformer", baseline: "Fixed-size MLP or CNN state", chosenDescription: "Apply self-attention over unordered machine and task entities, keeping the policy independent of their input ordering.", baselineDescription: "Flatten entities into fixed positions or a fixed spatial layout that assumes a known cluster size and ordering.", metric: "2×", metricLabel: "cluster size without retraining", evidence: { status: "Reported project result", description: "Generalizes to twice the training cluster size without retraining or degradation." }, tradeoff: { leftLabel: "Low inference cost", rightLabel: "Zero-shot scale", position: 76, leftDescription: "Simpler fixed-size model computation", rightDescription: "Order-independent variable-size inputs" }, failureModes: ["Fixed dimensions can reject a larger cluster or require padding and bespoke retraining for each size.", "Position-sensitive models may learn accidental ordering patterns that do not hold when nodes are rearranged."], takeaways: ["Set attention costs more per inference step, but removes cluster ordering as a hidden model assumption.", "The learned policy generalizes to clusters twice the training size without retraining or measured degradation."] },
    { id: "simulator", number: "03", title: "Keep the training simulator focused", chosen: "Custom discrete-event simulator", baseline: "Heavyweight distributed simulator", chosenDescription: "Integrate a lightweight, vectorized discrete-event simulator directly with the Gymnasium environment.", baselineDescription: "Use a full distributed-system simulator such as SimGrid, including detailed network behavior and infrastructure.", metric: "µs", metricLabel: "scale simulation step throughput", evidence: { status: "Reported project characteristic", description: "Microsecond-scale steps support millions of training episodes; packet-routing fidelity is intentionally omitted." }, tradeoff: { leftLabel: "Network fidelity", rightLabel: "Episode throughput", position: 78, leftDescription: "Detailed packet and network behavior", rightDescription: "Fast vectorized scheduling transitions" }, failureModes: ["A heavyweight simulator spends compute on network and infrastructure fidelity outside the scheduling question being optimized.", "Slow transitions limit the number of PPO episodes and policy comparisons that fit into a training budget."], takeaways: ["Model the events that affect allocation and omit packet routing when it does not change the scheduling decision.", "Microsecond-scale steps make millions of training episodes practical; network-fidelity studies can use a separate tool."] }
  ] }
];

const stages: Stage[] = [
  { id: "events", title: "Raw CDP Events", subtitle: "Observe a demonstration", icon: Activity, input: "Human action in Chromium", output: `Page.navigate  →  /orders\nInput.insertText  →  "ORD-4821"\nMouse.click  →  node 0x42A\nNetwork.response  →  200 OK`, detail: "Chrome DevTools Protocol captures browser-level interactions and relevant page context as the person completes a workflow." },
  { id: "ir", title: "Workflow IR Engine", subtitle: "Infer semantic intent", icon: Workflow, input: "Ordered event stream + DOM context", output: `FindOrder(query: <parameter>)\n  → OpenResult(kind: "order")\n  → AssertStatus(expected: <status>)`, detail: "The compile-time LLM groups low-level events into typed, parameterized actions. No model is called during script execution." },
  { id: "ast", title: "AST Code Generation", subtitle: "Compile typed actions", icon: Code2, input: "Validated workflow IR", output: `await page.getByLabel("Order ID")\n  .fill(orderId);\nawait page.getByRole("row", {\n  name: /order/i,\n}).click();`, detail: "IR nodes are lowered into a Playwright abstract syntax tree, allowing code generation to validate and compose actions consistently." },
  { id: "script", title: "Deterministic Script", subtitle: "Run with native automation", icon: Terminal, input: "Generated TypeScript + runtime parameters", output: `// No runtime model calls\nawait runOrderLookup({\n  orderId: process.env.ORDER_ID,\n});`, detail: "The compiled program runs as ordinary Playwright automation: reproducible steps, native browser speed, and zero runtime LLM tokens." }
];

const accents = { emerald: { text: "text-emerald-300", soft: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20", active: "border-emerald-400/40 bg-emerald-400/[0.08]", ring: "ring-emerald-400/30", range: "accent-emerald-400", tab: "border-emerald-400 text-emerald-300" }, indigo: { text: "text-indigo-300", soft: "bg-indigo-400/10 text-indigo-300 ring-indigo-400/20", active: "border-indigo-400/40 bg-indigo-400/[0.08]", ring: "ring-indigo-400/30", range: "accent-indigo-400", tab: "border-indigo-400 text-indigo-300" } };

function TradeoffBalance({ data, accent }: { data: Tradeoff; accent: Project["accent"] }) {
  const [position, setPosition] = useState(data.position);
  return <div className="mt-5 rounded-xl border border-white/[0.07] bg-black/20 p-4">
    <div className="mb-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500"><span>Trade-off balance</span><SlidersHorizontal aria-hidden="true" className="h-3.5 w-3.5" /></div>
    <div className="mb-2 flex justify-between gap-3 text-xs text-zinc-300"><span>{data.leftLabel}</span><span className="text-right">{data.rightLabel}</span></div>
    <div className="relative h-2 rounded-full bg-gradient-to-r from-rose-400/80 via-amber-300/80 to-emerald-400/90"><div className="absolute -top-1.5 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-zinc-950 bg-white shadow-[0_0_0_3px_rgba(255,255,255,0.16)]" style={{ left: `${position}%` }} /></div>
    <input aria-label={`Explore trade-off balance: ${data.leftLabel} to ${data.rightLabel}`} className={`mt-2 h-4 w-full cursor-ew-resize appearance-none bg-transparent ${accents[accent].range} focus-visible:outline-none focus-visible:ring-2 ${accents[accent].ring} rounded`} type="range" min="0" max="100" value={position} onChange={(event) => setPosition(Number(event.target.value))} />
    <div className="mt-1 flex justify-between gap-4 text-[11px] leading-relaxed text-zinc-500"><span className="max-w-[48%]">{data.leftDescription}</span><span className="max-w-[48%] text-right">{data.rightDescription}</span></div>
  </div>;
}

function DecisionCard({ data, accent }: { data: Decision; accent: Project["accent"] }) {
  const [expanded, setExpanded] = useState(false);
  return <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-zinc-900/75 shadow-xl transition hover:border-white/[0.16]">
    <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-5 py-5"><div><div className="mb-3 flex items-center gap-2"><span className={`font-mono text-xs ${accents[accent].text}`}>{data.number}</span><span className="h-px w-7 bg-white/15" /><span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-500">Architecture decision</span></div><h3 className="text-lg font-semibold leading-snug text-zinc-100">{data.title}</h3></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ${accents[accent].soft}`}>Selected</span></div>
    <div className="grid flex-1 grid-cols-1 divide-y divide-white/[0.07] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
      <div className="p-5"><div className={`mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] ${accents[accent].text}`}><CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />Chosen design</div><h4 className="mb-2 text-sm font-semibold text-zinc-100">{data.chosen}</h4><p className="text-xs leading-relaxed text-zinc-400">{data.chosenDescription}</p></div>
      <div className="p-5"><div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-rose-300"><XCircle aria-hidden="true" className="h-3.5 w-3.5" />Alternative rejected</div><h4 className="mb-2 text-sm font-semibold text-zinc-200">{data.baseline}</h4><p className="text-xs leading-relaxed text-zinc-500">{data.baselineDescription}</p></div>
    </div>
    <div className="mx-5 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3"><div className="flex items-center gap-4"><div className={`flex h-11 min-w-14 items-center justify-center rounded-lg ${accents[accent].soft}`}><span className="font-mono text-lg font-bold">{data.metric}</span></div><div><div className="text-xs font-semibold text-zinc-200">{data.metricLabel}</div><span className="mt-1 inline-flex rounded-full border border-white/[0.08] px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider text-zinc-400">{data.evidence.status}</span></div></div><p className="mt-3 border-t border-white/[0.06] pt-2.5 text-[11px] leading-relaxed text-zinc-400">{data.evidence.description}</p></div>
    <div className="px-5 pb-5"><TradeoffBalance data={data.tradeoff} accent={accent} /></div>
    <div className="border-t border-white/[0.07]"><button type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)} className="flex w-full items-center justify-between px-5 py-4 text-left text-xs font-semibold text-zinc-300 transition hover:bg-white/[0.025] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-400"><span className="flex items-center gap-2"><Layers3 aria-hidden="true" className={`h-4 w-4 ${accents[accent].text}`} />Engineering rationale</span><ChevronDown aria-hidden="true" className={`h-4 w-4 text-zinc-500 transition-transform ${expanded ? "rotate-180" : ""}`} /></button>
      {expanded && <div className="space-y-5 border-t border-white/[0.06] bg-black/15 px-5 py-5"><section><h5 className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-rose-300">Failure modes of the alternative</h5><ul className="space-y-2">{data.failureModes.map((item) => <li key={item} className="flex gap-2 text-xs leading-relaxed text-zinc-400"><XCircle aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400/80" />{item}</li>)}</ul></section><section><h5 className="mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-300">Production takeaways</h5><ul className="space-y-2">{data.takeaways.map((item) => <li key={item} className="flex gap-2 text-xs leading-relaxed text-zinc-400"><Check aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />{item}</li>)}</ul></section></div>}
    </div>
  </article>;
}

function TracePipeline({ accent }: { accent: Project["accent"] }) {
  const [selectedId, setSelectedId] = useState(stages[0].id);
  const [playing, setPlaying] = useState(false);
  const selected = stages.find((stage) => stage.id === selectedId) ?? stages[0];
  useEffect(() => {
    if (!playing) return;
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      if (index >= stages.length) {
        setPlaying(false);
        setSelectedId(stages[0].id);
        return;
      }
      setSelectedId(stages[index].id);
    }, 1150);
    return () => window.clearInterval(timer);
  }, [playing]);
  return <div className="rounded-2xl border border-white/[0.09] bg-zinc-900/70 p-5 sm:p-6"><div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500"><Workflow aria-hidden="true" className={`h-3.5 w-3.5 ${accents[accent].text}`} />Compile pipeline</div><h3 className="text-base font-semibold text-zinc-100">From browser events to executable code</h3></div><div className="flex items-center gap-2"><button type="button" onClick={() => { if (playing) { setPlaying(false); } else { setSelectedId(stages[0].id); setPlaying(true); } }} className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/20 bg-emerald-300/[0.06] px-3 py-2 text-[10px] font-semibold text-emerald-100 transition hover:bg-emerald-300/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300">{playing ? <Pause aria-hidden="true" className="h-3 w-3" /> : <Play aria-hidden="true" className="h-3 w-3" />}{playing ? "Pause walkthrough" : "Animate compile"}</button><span className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-2.5 py-1 text-[10px] font-medium text-emerald-300 sm:inline">Compile time → runtime</span></div></div>
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-4 sm:gap-0">{stages.map((stage, index) => { const Icon = stage.icon; const active = stage.id === selectedId; return <div key={stage.id} className="flex items-center sm:items-start"><button type="button" onClick={() => { setPlaying(false); setSelectedId(stage.id); }} aria-pressed={active} className={`flex min-h-[66px] flex-1 items-center gap-3 rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 ${active ? `${accents[accent].active} ${accents[accent].ring}` : "border-white/[0.07] bg-black/10 hover:border-white/[0.15]"}`}><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${active ? accents[accent].soft : "bg-white/[0.05] text-zinc-400"}`}><Icon aria-hidden="true" className="h-4 w-4" /></span><span><span className="block text-xs font-semibold text-zinc-100">{stage.title}</span><span className="mt-1 block text-[10px] text-zinc-500">{stage.subtitle}</span></span></button>{index < stages.length - 1 && <ArrowRight aria-hidden="true" className="mx-1 hidden h-4 w-4 shrink-0 text-zinc-600" />}{index < stages.length - 1 && <ChevronRight aria-hidden="true" className="ml-2 h-4 w-4 shrink-0 text-zinc-600 sm:hidden" />}</div>; })}</div>
    <div className="mt-4 grid gap-4 rounded-xl border border-white/[0.07] bg-[#09090b] p-4 sm:grid-cols-[0.8fr_1.2fr] sm:p-5"><div><div className="mb-2 flex items-center gap-2 text-xs font-semibold text-zinc-200"><Database aria-hidden="true" className="h-4 w-4 text-emerald-300" />{selected.title}</div><p className="text-xs leading-relaxed text-zinc-400">{selected.detail}</p><div className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Input</div><p className="mt-1 text-xs text-zinc-400">{selected.input}</p></div><div><div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Representation</div><pre className="overflow-x-auto rounded-lg border border-white/[0.06] bg-zinc-950 px-4 py-3 font-mono text-[11px] leading-relaxed text-emerald-200/90"><code>{selected.output}</code></pre></div></div>
  </div>;
}

interface Point3D { x: number; y: number; z: number }

function Cluster3DScene({ nodeCount }: { nodeCount: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef({ active: false, x: 0, y: 0 });
  const [yaw, setYaw] = useState(-0.62);
  const [pitch, setPitch] = useState(0.35);
  const [autoOrbit, setAutoOrbit] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    let frame = 0;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    const nodes: Point3D[] = Array.from({ length: nodeCount }, (_, index) => ({
      x: ((index % 4) - 1.5) * 1.2,
      y: (Math.floor(index / 4) - (Math.ceil(nodeCount / 4) - 1) / 2) * 1.05,
      z: (index % 2) * 0.8 - 0.4,
    }));

    const render = (time: number) => {
      const bounds = canvas.getBoundingClientRect();
      const width = Math.max(bounds.width, 1);
      const height = Math.max(bounds.height, 1);
      const pixelWidth = Math.round(width * pixelRatio);
      const pixelHeight = Math.round(height * pixelRatio);
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);
      const backdrop = context.createRadialGradient(width * 0.5, height * 0.48, 6, width * 0.5, height * 0.5, width * 0.7);
      backdrop.addColorStop(0, "rgba(49,46,129,0.20)");
      backdrop.addColorStop(1, "rgba(9,9,11,0)");
      context.fillStyle = backdrop;
      context.fillRect(0, 0, width, height);

      const spin = autoOrbit ? time * 0.00022 : 0;
      const cameraYaw = yaw + spin;
      const cosineYaw = Math.cos(cameraYaw);
      const sineYaw = Math.sin(cameraYaw);
      const cosinePitch = Math.cos(pitch);
      const sinePitch = Math.sin(pitch);
      const unit = Math.min(width / 7.4, height / 4.2, 76);
      const project = (point: Point3D) => {
        const rotatedX = cosineYaw * point.x + sineYaw * point.z;
        const depth = -sineYaw * point.x + cosineYaw * point.z;
        const rotatedY = cosinePitch * point.y - sinePitch * depth;
        const rotatedDepth = sinePitch * point.y + cosinePitch * depth;
        const perspective = 7 / (7 + rotatedDepth * 0.24);
        return { x: width / 2 + rotatedX * unit * perspective, y: height / 2 - rotatedY * unit * perspective, depth: rotatedDepth };
      };

      context.lineWidth = 1;
      for (let index = 0; index < nodes.length; index += 1) {
        const neighbors = [index + 1, index + 4].filter((next) => next < nodes.length && (next === index + 4 || Math.floor(next / 4) === Math.floor(index / 4)));
        for (const neighbor of neighbors) {
          const start = project(nodes[index]);
          const end = project(nodes[neighbor]);
          context.beginPath();
          context.moveTo(start.x, start.y);
          context.lineTo(end.x, end.y);
          context.strokeStyle = "rgba(129,140,248,0.28)";
          context.stroke();
        }
      }

      const source = project({ x: -2.65, y: 0, z: 0 });
      context.beginPath();
      context.arc(source.x, source.y, 4, 0, Math.PI * 2);
      context.fillStyle = "#fbbf24";
      context.shadowColor = "rgba(251,191,36,0.8)";
      context.shadowBlur = 14;
      context.fill();
      context.shadowBlur = 0;
      context.font = "9px ui-monospace, SFMono-Regular, monospace";
      context.textAlign = "center";
      context.fillStyle = "rgba(253,230,138,0.75)";
      context.fillText("TASK QUEUE", source.x, source.y + 18);

      if (running) {
        for (let index = 0; index < Math.min(4, nodes.length); index += 1) {
          const phase = ((time / 1500) + index * 0.28) % 1;
          const target = project(nodes[index]);
          const x = source.x + (target.x - source.x) * phase;
          const y = source.y + (target.y - source.y) * phase;
          context.beginPath();
          context.arc(x, y, 2.5, 0, Math.PI * 2);
          context.fillStyle = index % 2 === 0 ? "#6ee7b7" : "#7dd3fc";
          context.shadowColor = context.fillStyle;
          context.shadowBlur = 12;
          context.fill();
          context.shadowBlur = 0;
        }
      }

      nodes.forEach((node, index) => {
        const center = project(node);
        const half = 0.22;
        const corners: Point3D[] = [
          { x: -half, y: -half, z: -half }, { x: half, y: -half, z: -half },
          { x: half, y: half, z: -half }, { x: -half, y: half, z: -half },
          { x: -half, y: -half, z: half }, { x: half, y: -half, z: half },
          { x: half, y: half, z: half }, { x: -half, y: half, z: half },
        ].map((offset) => ({ x: node.x + offset.x, y: node.y + offset.y, z: node.z + offset.z }));
        const face = (indices: number[], fill: string) => {
          context.beginPath();
          indices.forEach((corner, cornerIndex) => {
            const point = project(corners[corner]);
            if (cornerIndex === 0) context.moveTo(point.x, point.y);
            else context.lineTo(point.x, point.y);
          });
          context.closePath();
          context.fillStyle = fill;
          context.fill();
          context.strokeStyle = "rgba(165,180,252,0.48)";
          context.stroke();
        };
        face([4, 5, 6, 7], "rgba(14,116,144,0.72)");
        face([5, 1, 2, 6], "rgba(49,46,129,0.78)");
        face([7, 6, 2, 3], "rgba(99,102,241,0.52)");
        context.beginPath();
        context.arc(center.x, center.y, 2.2, 0, Math.PI * 2);
        context.fillStyle = index % 2 === 0 ? "#a5f3fc" : "#c7d2fe";
        context.fill();
        context.font = "10px ui-monospace, SFMono-Regular, monospace";
        context.textAlign = "center";
        context.fillStyle = "rgba(228,228,231,0.88)";
        context.fillText(`N${String(index + 1).padStart(2, "0")}`, center.x, center.y + 31);
      });

      if (autoOrbit || running) frame = window.requestAnimationFrame(render);
    };

    const observer = new ResizeObserver(() => render(performance.now()));
    observer.observe(canvas);
    render(performance.now());
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [autoOrbit, nodeCount, pitch, running, yaw]);

  function beginDrag(event: ReactPointerEvent<HTMLCanvasElement>) {
    dragRef.current = { active: true, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveCamera(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!dragRef.current.active) return;
    const deltaX = event.clientX - dragRef.current.x;
    const deltaY = event.clientY - dragRef.current.y;
    dragRef.current = { active: true, x: event.clientX, y: event.clientY };
    setYaw((value) => value + deltaX * 0.009);
    setPitch((value) => Math.max(-0.85, Math.min(0.85, value + deltaY * 0.009)));
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-indigo-300/15 bg-[#08090f]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
        <div><div className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-200">3D cluster model</div><div className="mt-1 text-[9px] text-zinc-600">Drag to orbit · task pulses travel through the cluster</div></div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setRunning((value) => !value)} aria-pressed={running} className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300/20 px-2.5 py-1.5 text-[9px] font-semibold text-emerald-200 transition hover:bg-emerald-300/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300">{running ? <Pause aria-hidden="true" className="h-3 w-3" /> : <Play aria-hidden="true" className="h-3 w-3" />}{running ? "Pause traffic" : "Animate traffic"}</button>
          <button type="button" onClick={() => setAutoOrbit((value) => !value)} aria-pressed={autoOrbit} className={`rounded-md border px-2.5 py-1.5 text-[9px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${autoOrbit ? "border-indigo-300/30 bg-indigo-300/[0.09] text-indigo-100" : "border-white/[0.08] text-zinc-400 hover:text-white"}`}>{autoOrbit ? "Stop orbit" : "Auto-orbit"}</button>
          <button type="button" onClick={() => { setYaw(-0.62); setPitch(0.35); setAutoOrbit(false); }} aria-label="Reset 3D camera" className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.08] text-zinc-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"><RotateCcw aria-hidden="true" className="h-3 w-3" /></button>
        </div>
      </div>
      <canvas ref={canvasRef} aria-label={`Three-dimensional cluster illustration with ${nodeCount} connected machines. Drag to orbit the view.`} role="img" onPointerDown={beginDrag} onPointerMove={moveCamera} onPointerUp={() => { dragRef.current.active = false; }} onPointerCancel={() => { dragRef.current.active = false; }} className="block h-[270px] w-full cursor-grab touch-none active:cursor-grabbing sm:h-[330px]" />
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] px-4 py-2 text-[9px] text-zinc-600"><span>Illustrative topology · not a live policy inference</span><span className="inline-flex items-center gap-3"><span className="inline-flex items-center gap-1"><i className="h-1.5 w-1.5 rounded-full bg-amber-300" />Task queue</span><span className="inline-flex items-center gap-1"><i className="h-1.5 w-1.5 rounded-full bg-cyan-200" />Machine</span></span></div>
    </div>
  );
}

function ClusterScaleDemo({ accent }: { accent: Project["accent"] }) {
  const [nodeCount, setNodeCount] = useState(4);
  const [reordered, setReordered] = useState(false);
  const nodes = Array.from({ length: nodeCount }, (_, index) => index);
  const visibleNodes = reordered ? [...nodes].reverse() : nodes;
  const fixedWorks = nodeCount === 4;
  return <div className="rounded-2xl border border-white/[0.09] bg-zinc-900/70 p-5 sm:p-6"><div className="mb-5 flex flex-wrap items-start justify-between gap-4"><div><div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500"><Network aria-hidden="true" className={`h-3.5 w-3.5 ${accents[accent].text}`} />Generalization sandbox</div><h3 className="text-base font-semibold text-zinc-100">Scale the cluster and reorder the nodes</h3><p className="mt-1 text-xs text-zinc-500">Illustrative model view; this preview does not run policy inference.</p></div><div className="rounded-lg border border-white/[0.08] bg-black/20 px-3 py-2 text-xs text-zinc-300"><span className="font-mono font-semibold text-indigo-300">{nodeCount}</span> nodes</div></div>
    <div className="mb-5 flex flex-wrap items-center gap-2">{[4, 8, 16].map((count) => <button key={count} type="button" onClick={() => setNodeCount(count)} aria-pressed={nodeCount === count} className={`rounded-lg border px-3 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 ${nodeCount === count ? "border-indigo-400/40 bg-indigo-400/10 text-indigo-200" : "border-white/[0.08] text-zinc-400 hover:border-white/20 hover:text-zinc-200"}`}>{count} nodes</button>)}<label className="ml-auto flex min-w-[180px] flex-1 items-center gap-3 sm:max-w-[240px]"><SlidersHorizontal aria-hidden="true" className="h-4 w-4 shrink-0 text-zinc-500" /><input aria-label="Cluster node count" type="range" min="4" max="16" step="4" value={nodeCount} onChange={(event) => setNodeCount(Number(event.target.value))} className="w-full accent-indigo-400" /></label><button type="button" aria-pressed={reordered} onClick={() => setReordered((value) => !value)} className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-indigo-300/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"><RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />{reordered ? "Restore node order" : "Reorder nodes"}</button></div>
    <div className="mb-4"><Cluster3DScene nodeCount={nodeCount} /></div>
    <div className="grid gap-3 md:grid-cols-2"><div className="rounded-xl border border-indigo-400/20 bg-indigo-400/[0.045] p-4"><div className="mb-3 flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-xs font-semibold text-zinc-100"><Sparkles aria-hidden="true" className="h-4 w-4 text-indigo-300" />Set-Attention policy</div><span className="text-[10px] text-indigo-200">same set · any order</span></div><div className="flex min-h-[76px] flex-wrap items-center justify-center gap-2 rounded-lg border border-white/[0.06] bg-black/20 p-3">{visibleNodes.map((node) => <span key={node} className="flex h-8 w-8 items-center justify-center rounded-md border border-indigo-300/20 bg-indigo-300/[0.08] font-mono text-[10px] text-indigo-100">N{node + 1}</span>)}</div><p className="mt-3 text-[11px] leading-relaxed text-zinc-400">Node-wise outputs follow their node identities when the input is permuted; the pooled cluster context remains order-independent.</p></div>
      <div className={`rounded-xl border p-4 ${fixedWorks ? "border-amber-300/20 bg-amber-300/[0.035]" : "border-rose-400/20 bg-rose-400/[0.035]"}`}><div className="mb-3 flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-xs font-semibold text-zinc-100"><CircuitBoard aria-hidden="true" className={`h-4 w-4 ${fixedWorks ? "text-amber-300" : "text-rose-300"}`} />Fixed-size MLP baseline</div><span className={`text-[10px] ${fixedWorks ? "text-amber-200" : "text-rose-200"}`}>{fixedWorks ? "4 fixed slots" : "shape mismatch"}</span></div><div className="flex min-h-[76px] flex-wrap items-center justify-center gap-2 rounded-lg border border-white/[0.06] bg-black/20 p-3">{fixedWorks ? visibleNodes.map((node, slot) => <span key={node} className="flex flex-col items-center justify-center rounded-md border border-amber-300/20 bg-amber-300/[0.08] px-2 py-1 font-mono text-[10px] text-amber-100"><span>slot {slot + 1}</span><span className="text-amber-200">N{node + 1}</span></span>) : <div className="flex items-center gap-2 text-xs text-rose-200"><XCircle aria-hidden="true" className="h-4 w-4" />Expected 4 fixed input slots</div>}</div><p className="mt-3 text-[11px] leading-relaxed text-zinc-400">The flattened MLP keeps the same dimensions at four nodes, but a permutation changes which entity occupies each learned slot. Larger clusters also break its input shape.</p></div></div>
    <div className="mt-4 flex items-start gap-2 rounded-lg border border-white/[0.06] bg-black/15 px-3 py-2.5 text-[11px] leading-relaxed text-zinc-400"><RotateCcw aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-300" />Try 8 or 16 nodes: the Set Transformer consumes the expanded set while the four-slot baseline no longer matches its training shape.</div>
  </div>;
}

interface DemoTask { id: string; name: string; cpu: number; memory: number }
interface DemoNode { id: string; name: string; cpu: number; memory: number }
type ConstraintMode = "mask" | "penalty";

const demoTasks: DemoTask[] = [
  { id: "frontend", name: "Front-end service", cpu: 3, memory: 6 },
  { id: "batch", name: "Batch worker", cpu: 5, memory: 6 },
  { id: "cache", name: "Cache process", cpu: 2, memory: 3 },
];

const demoNodes: DemoNode[] = [
  { id: "node-a", name: "Node A", cpu: 4, memory: 8 },
  { id: "node-b", name: "Node B", cpu: 8, memory: 16 },
  { id: "node-c", name: "Node C", cpu: 4, memory: 4 },
];

function TaskPlacementLab() {
  const [mode, setMode] = useState<ConstraintMode>("mask");
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Record<string, string | null>>(() => Object.fromEntries(demoTasks.map((task) => [task.id, null])));
  const [feedback, setFeedback] = useState("Select a task, then place it on a node. Try Batch worker → Node A.");

  function usage(nodeId: string, excludingTaskId?: string) {
    return demoTasks.reduce((total, task) => {
      if (task.id === excludingTaskId || assignments[task.id] !== nodeId) return total;
      return { cpu: total.cpu + task.cpu, memory: total.memory + task.memory };
    }, { cpu: 0, memory: 0 });
  }

  function placeTask(taskId: string, nodeId: string) {
    const task = demoTasks.find((item) => item.id === taskId);
    const node = demoNodes.find((item) => item.id === nodeId);
    if (!task || !node) return;
    const occupied = usage(nodeId, taskId);
    const fits = occupied.cpu + task.cpu <= node.cpu && occupied.memory + task.memory <= node.memory;
    if (!fits && mode === "mask") {
      setFeedback(`Masked: ${task.name} needs ${task.cpu} CPU / ${task.memory} GB. ${node.name} has ${Math.max(0, node.cpu - occupied.cpu)} CPU / ${Math.max(0, node.memory - occupied.memory)} GB available.`);
      return;
    }
    setAssignments((current) => ({ ...current, [taskId]: nodeId }));
    setSelectedTask(null);
    setFeedback(fits ? `${task.name} placed on ${node.name}; allocation stays within capacity.` : `Penalty baseline accepted ${task.name} on ${node.name}. The node is now over capacity.`);
  }

  function reset() {
    setAssignments(Object.fromEntries(demoTasks.map((task) => [task.id, null])));
    setSelectedTask(null);
    setFeedback("Select a task, then place it on a node. Try Batch worker → Node A.");
  }

  const violations = demoNodes.filter((node) => {
    const current = usage(node.id);
    return current.cpu > node.cpu || current.memory > node.memory;
  }).length;

  return (
    <section aria-labelledby="placement-heading" className="rounded-2xl border border-white/[0.09] bg-zinc-900/70 p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500"><Hand aria-hidden="true" className="h-3.5 w-3.5 text-indigo-300" />Gesture-driven allocation lab</div>
          <h3 id="placement-heading" className="text-base font-semibold text-zinc-100">Place a workload under a hard capacity limit</h3>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-500">Drag a task onto a machine, or select a task then click a machine. The sample capacities are illustrative, not benchmark measurements.</p>
        </div>
        <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-[11px] text-zinc-400 transition hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"><RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />Reset</button>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-black/20 p-3">
        <div><div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Constraint handling</div><div className="mt-1 text-[11px] text-zinc-400">Try Batch worker on Node A in both modes.</div></div>
        <div role="tablist" aria-label="Choose constraint handling" className="flex rounded-lg border border-white/[0.08] bg-zinc-950 p-1">
          <button type="button" role="tab" aria-selected={mode === "mask"} onClick={() => { setMode("mask"); setFeedback("Masking is active. Try Batch worker → Node A to see the invalid action blocked."); }} className={`rounded-md px-3 py-2 text-[10px] font-semibold transition ${mode === "mask" ? "bg-emerald-300/10 text-emerald-200" : "text-zinc-500 hover:text-zinc-200"}`}>Action mask</button>
          <button type="button" role="tab" aria-selected={mode === "penalty"} onClick={() => { setMode("penalty"); setFeedback("Penalty mode is active. Invalid assignments are accepted and counted as violations."); }} className={`rounded-md px-3 py-2 text-[10px] font-semibold transition ${mode === "penalty" ? "bg-rose-300/10 text-rose-200" : "text-zinc-500 hover:text-zinc-200"}`}>Reward penalty</button>
        </div>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-[0.78fr_1.22fr]">
        <div className="rounded-xl border border-white/[0.07] bg-black/15 p-3.5">
          <div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">Incoming tasks</span><span className="text-[9px] text-zinc-600">Select or drag ↗</span></div>
          <div className="space-y-2">{demoTasks.map((task) => {
            const assigned = assignments[task.id] !== null;
            return <button key={task.id} type="button" draggable onDragStart={(event) => { event.dataTransfer.setData("text/plain", task.id); event.dataTransfer.effectAllowed = "move"; setSelectedTask(task.id); }} onClick={() => { setSelectedTask((current) => current === task.id ? null : task.id); setFeedback(`${task.name} selected. Choose a machine or drag this task onto one.`); }} aria-pressed={selectedTask === task.id} className={`flex w-full cursor-grab items-center justify-between gap-2 rounded-lg border p-3 text-left transition active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${selectedTask === task.id ? "border-indigo-300/40 bg-indigo-300/[0.08]" : "border-white/[0.07] bg-zinc-950/70 hover:border-white/20"}`}>
              <span><span className="block text-[11px] font-semibold text-zinc-200">{task.name}</span><span className="mt-1 block font-mono text-[9px] text-zinc-500">{task.cpu} CPU · {task.memory} GB</span></span><span className={`rounded-full px-2 py-1 text-[8px] ${assigned ? "bg-white/[0.06] text-zinc-400" : "bg-indigo-300/[0.08] text-indigo-200"}`}>{assigned ? `on ${demoNodes.find((node) => node.id === assignments[task.id])?.name}` : "queued"}</span>
            </button>;
          })}</div>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">{demoNodes.map((node) => {
          const current = usage(node.id);
          const over = current.cpu > node.cpu || current.memory > node.memory;
          const cpuPercent = Math.min(100, (current.cpu / node.cpu) * 100);
          const memoryPercent = Math.min(100, (current.memory / node.memory) * 100);
          const placedTasks = demoTasks.filter((task) => assignments[task.id] === node.id);
          return <div key={node.id} role="button" tabIndex={0} aria-label={`${node.name}, ${node.cpu} CPU and ${node.memory} gigabytes memory capacity. Click to place selected task.`} onClick={() => selectedTask && placeTask(selectedTask, node.id)} onKeyDown={(event) => { if ((event.key === "Enter" || event.key === " ") && selectedTask) { event.preventDefault(); placeTask(selectedTask, node.id); } }} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }} onDrop={(event) => { event.preventDefault(); const taskId = event.dataTransfer.getData("text/plain"); if (taskId) placeTask(taskId, node.id); }} className={`min-h-[210px] rounded-xl border p-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${over ? "border-rose-400/30 bg-rose-400/[0.045]" : "border-white/[0.07] bg-black/15 hover:border-indigo-300/25"}`}>
            <div className="mb-3 flex items-center justify-between"><span className="text-xs font-semibold text-zinc-200">{node.name}</span><span className="font-mono text-[9px] text-zinc-600">{node.cpu} CPU / {node.memory} GB</span></div>
            <div className="space-y-2"><div><div className="mb-1 flex justify-between text-[8px] uppercase tracking-wider text-zinc-600"><span>CPU used</span><span className={current.cpu > node.cpu ? "text-rose-300" : "text-zinc-400"}>{current.cpu}/{node.cpu}</span></div><div className="h-1.5 rounded-full bg-white/[0.06]"><div className={`h-full rounded-full transition-all ${current.cpu > node.cpu ? "bg-rose-400" : "bg-indigo-300/80"}`} style={{ width: `${cpuPercent}%` }} /></div></div><div><div className="mb-1 flex justify-between text-[8px] uppercase tracking-wider text-zinc-600"><span>Memory used</span><span className={current.memory > node.memory ? "text-rose-300" : "text-zinc-400"}>{current.memory}/{node.memory} GB</span></div><div className="h-1.5 rounded-full bg-white/[0.06]"><div className={`h-full rounded-full transition-all ${current.memory > node.memory ? "bg-rose-400" : "bg-sky-300/80"}`} style={{ width: `${memoryPercent}%` }} /></div></div></div>
            <div className="mt-3 min-h-12 space-y-1">{placedTasks.length ? placedTasks.map((task) => <div key={task.id} className={`rounded-md border px-2 py-1.5 text-[9px] ${over ? "border-rose-300/15 bg-rose-300/[0.06] text-rose-100" : "border-white/[0.06] bg-white/[0.025] text-zinc-300"}`}>{task.name}</div>) : <div className="rounded-md border border-dashed border-white/[0.08] px-2 py-2 text-center text-[9px] text-zinc-600">Drop task here</div>}</div>
            <div className={`mt-2 text-center text-[8px] font-semibold uppercase tracking-wider ${over ? "text-rose-300" : "text-emerald-300/70"}`}>{over ? "Capacity exceeded" : selectedTask ? "Click or drop to place" : "Within constraints"}</div>
          </div>;
        })}</div>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-white/[0.07] bg-black/20 px-3.5 py-3">
        <p aria-live="polite" className={`flex min-w-0 flex-1 items-start gap-2 text-[11px] leading-relaxed ${feedback.startsWith("Masked:") ? "text-amber-200" : "text-zinc-400"}`}><span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${feedback.startsWith("Masked:") ? "bg-amber-300" : "bg-indigo-300"}`} />{feedback}</p>
        <div className={`rounded-md px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-wider ${violations ? "bg-rose-400/10 text-rose-200" : "bg-emerald-400/[0.08] text-emerald-200"}`}>{violations} constraint violations</div>
      </div>
      <p className="mt-3 text-[9px] leading-relaxed text-zinc-600">Illustrative CPU and memory values demonstrate the interaction only. The benchmark figures shown in the decision cards are project-reported results.</p>
    </section>
  );
}

export default function ArchitecturalDecisions() {
  const [activeId, setActiveId] = useState<Project["id"]>(projects[0].id);
  const project = projects.find((item) => item.id === activeId) ?? projects[0];
  const isTrace = project.id === "trace2code";
  return <section aria-labelledby="architecture-heading" className="relative overflow-hidden bg-[#09090b] px-4 py-16 text-zinc-100 sm:px-6 lg:px-8 lg:py-24"><div aria-hidden="true" className={`pointer-events-none absolute -top-40 ${isTrace ? "left-[-10rem] bg-emerald-500/[0.07]" : "right-[-10rem] bg-indigo-500/[0.09]"} h-[28rem] w-[28rem] rounded-full blur-[100px]`} /><div className="relative mx-auto max-w-7xl">
    <div className="mb-8 flex flex-col gap-7 border-b border-white/[0.08] pb-8 lg:flex-row lg:items-end lg:justify-between"><div className="max-w-2xl"><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400"><Cpu aria-hidden="true" className="h-3.5 w-3.5 text-zinc-300" />System design field notes</div><h2 id="architecture-heading" className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">Architectural decisions<span className="text-zinc-500">, made visible.</span></h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">For technical interviewers and hiring teams: scan each project’s objective and outcomes, then open a decision to inspect its failure modes and trade-offs.</p><div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500"><span className="inline-flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.07] font-mono text-zinc-300">30s</span>Thesis + results</span><span className="inline-flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.07] font-mono text-zinc-300">2m</span>Compare alternatives</span><span className="inline-flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.07] font-mono text-zinc-300">↗</span>Explore system model</span></div></div>
      <div role="tablist" aria-label="Select a project" className="inline-flex w-full rounded-xl border border-white/[0.09] bg-zinc-900/80 p-1 sm:w-auto">{projects.map((item) => { const active = project.id === item.id; return <button key={item.id} type="button" role="tab" aria-selected={active} onClick={() => setActiveId(item.id)} className={`flex-1 whitespace-nowrap rounded-lg border-b-2 px-4 py-2.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 ${active ? `${accents[item.accent].tab} bg-white/[0.04]` : "border-transparent text-zinc-500 hover:text-zinc-200"}`}>{item.name}</button>; })}</div></div>
    <div className="mb-8 grid gap-6 rounded-2xl border border-white/[0.09] bg-zinc-900/55 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center"><div><div className="mb-2 flex flex-wrap items-center gap-2"><span className={`text-[10px] font-bold uppercase tracking-[0.16em] ${accents[project.accent].text}`}>{project.eyebrow}</span><span className="text-zinc-700">/</span><span className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">Engineering thesis</span></div><p className="max-w-3xl text-base leading-relaxed text-zinc-200 sm:text-lg">{project.thesis}</p></div><div className="flex max-w-xl flex-wrap gap-2 lg:max-w-[400px] lg:justify-end">{project.stack.map((tech) => <span key={tech} className="rounded-md border border-white/[0.08] bg-black/20 px-2.5 py-1.5 text-[10px] font-medium text-zinc-400">{tech}</span>)}</div></div>
    <div className="mb-4 flex items-end justify-between gap-4"><div><div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500"><ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />Decision matrix</div><h3 className="text-xl font-semibold tracking-tight text-zinc-100">Three choices that shape the system</h3></div><div className="hidden items-center gap-2 text-[10px] text-zinc-500 sm:flex"><ShieldCheck aria-hidden="true" className="h-3.5 w-3.5 text-emerald-400" />Chosen architecture <span className="text-zinc-700">·</span><XCircle aria-hidden="true" className="h-3.5 w-3.5 text-rose-400" />Rejected baseline</div></div>
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">{project.decisions.map((decision) => <DecisionCard key={`${project.id}-${decision.id}`} data={decision} accent={project.accent} />)}</div>
    <div className="mb-4 mt-12 flex items-end justify-between gap-4"><div><div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500"><Gauge aria-hidden="true" className={`h-3.5 w-3.5 ${accents[project.accent].text}`} />System model</div><h3 className="text-xl font-semibold tracking-tight text-zinc-100">Explore the architecture in motion</h3></div><div className="hidden items-center gap-2 text-[10px] text-zinc-500 sm:flex"><Clock3 aria-hidden="true" className="h-3.5 w-3.5" />Interactive preview</div></div>
    {isTrace ? <TracePipeline accent={project.accent} /> : <div className="space-y-4"><ClusterScaleDemo accent={project.accent} /><TaskPlacementLab /></div>}
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4 text-[10px] text-zinc-600"><span>Architecture is a set of trade-offs. These are the ones that mattered in production.</span><span className={`inline-flex items-center gap-1.5 ${accents[project.accent].text}`}><CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />Decision rationale documented</span></div>
  </div></section>;
}
