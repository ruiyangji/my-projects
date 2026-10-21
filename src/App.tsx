import { useEffect, useState } from "react";
import { ArrowDown, ArrowUpRight, AudioLines, Braces, CircuitBoard, MousePointer2, Pause, Play, Square, Workflow } from "lucide-react";
import ArchitecturalDecisions from "../ArchitecturalDecisions";

const mapStages = [
  {
    id: "observe",
    number: "01 / INPUT",
    title: "Observe",
    detail: "Events and machine state enter the system.",
    icon: MousePointer2,
    color: "text-emerald-300",
    border: "border-emerald-400/20",
    shape: "events",
  },
  {
    id: "represent",
    number: "02 / MODEL",
    title: "Represent",
    detail: "Structure intent or reason over a set of nodes.",
    icon: Braces,
    color: "text-sky-300",
    border: "border-sky-400/20",
    shape: "model",
  },
  {
    id: "execute",
    number: "03 / OUTPUT",
    title: "Execute",
    detail: "Generate code or choose a valid allocation.",
    icon: CircuitBoard,
    color: "text-indigo-300",
    border: "border-indigo-400/20",
    shape: "output",
  },
];

function SystemMap() {
  const [active, setActive] = useState(mapStages[0]);

  return (
    <div className="relative rounded-2xl border border-white/[0.09] bg-zinc-950/80 p-4 shadow-2xl shadow-indigo-950/20 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-600">Original system map</div>
          <div className="mt-1 text-xs font-semibold text-zinc-200">A shared design loop</div>
        </div>
        <span className="rounded-full border border-white/[0.08] px-2.5 py-1 font-mono text-[9px] text-zinc-500">01 — 03</span>
      </div>
      <div className="relative">
        <svg aria-hidden="true" viewBox="0 0 600 100" preserveAspectRatio="none" className="pointer-events-none absolute left-0 top-8 hidden h-12 w-full sm:block">
          <path d="M72 50 C175 50 175 50 280 50 S425 50 528 50" fill="none" stroke="rgba(161,161,170,.22)" strokeWidth="1.5" strokeDasharray="5 7" />
          <path d="M72 50 C175 50 175 50 280 50 S425 50 528 50" fill="none" stroke="url(#map-flow)" strokeWidth="1.5" className="map-flow-line" />
          <defs><linearGradient id="map-flow"><stop stopColor="#6ee7b7" /><stop offset=".5" stopColor="#7dd3fc" /><stop offset="1" stopColor="#a5b4fc" /></linearGradient></defs>
        </svg>
        <div className="relative grid gap-2 sm:grid-cols-3 sm:gap-3">
          {mapStages.map(({ id, number, title, detail, icon: Icon, color, border, shape }) => {
            const selected = active.id === id;
            return (
              <button key={id} type="button" aria-pressed={selected} onMouseEnter={() => setActive(mapStages.find((stage) => stage.id === id) ?? mapStages[0])} onFocus={() => setActive(mapStages.find((stage) => stage.id === id) ?? mapStages[0])} onClick={() => setActive(mapStages.find((stage) => stage.id === id) ?? mapStages[0])} className={`group relative min-h-[150px] rounded-xl border p-3 text-left transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 sm:p-3.5 ${border} ${selected ? "bg-white/[0.06] shadow-[0_10px_30px_-18px_rgba(129,140,248,0.6)]" : "bg-zinc-900/70 hover:bg-white/[0.035]"}`}>
                <div className="mb-3 flex items-center justify-between"><span className={`font-mono text-[8px] tracking-[0.12em] ${color}`}>{number}</span><Icon aria-hidden="true" className={`h-3.5 w-3.5 ${color}`} /></div>
                <div className="mb-2 flex h-11 items-center justify-center rounded-lg border border-white/[0.05] bg-black/20">
                  {shape === "events" && <div className="flex w-4/5 flex-col gap-1">{[["w-3/4", "bg-emerald-300/70"], ["w-1/2", "bg-emerald-300/30"], ["w-2/3", "bg-emerald-300/30"]].map(([width, color], index) => <div key={index} className={`h-1 rounded-full ${color} ${width}`} />)}</div>}
                  {shape === "model" && <svg aria-hidden="true" viewBox="0 0 100 36" className="h-9 w-4/5"><path d="M17 18 50 7 82 18 50 29Z M17 18 50 29 M50 7 50 29 M50 7 82 18" fill="none" stroke="rgba(125,211,252,.55)" strokeWidth="1" /><circle cx="17" cy="18" r="3" fill="#7dd3fc" /><circle cx="50" cy="7" r="3" fill="#a5b4fc" /><circle cx="50" cy="29" r="3" fill="#7dd3fc" /><circle cx="82" cy="18" r="3" fill="#a5b4fc" /></svg>}
                  {shape === "output" && <div className="flex items-end gap-1">{[14, 24, 18, 30, 20].map((height, index) => <div key={index} style={{ height }} className="w-1.5 rounded-t bg-indigo-300/70" />)}</div>}
                </div>
                <div className="text-xs font-semibold text-zinc-100">{title}</div>
                <div className="mt-1 text-[10px] leading-relaxed text-zinc-500">{detail}</div>
              </button>
            );
          })}
        </div>
      </div>
      <div aria-live="polite" className="mt-3 flex items-center gap-2 border-t border-white/[0.06] pt-3 text-[10px] text-zinc-400"><span className={`h-1.5 w-1.5 rounded-full ${active.id === "observe" ? "bg-emerald-300" : active.id === "represent" ? "bg-sky-300" : "bg-indigo-300"}`} />Focus: <span className="font-semibold text-zinc-200">{active.title}</span> <span className="text-zinc-600">— {active.detail}</span></div>
    </div>
  );
}

function AudioGuide() {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setSupported("speechSynthesis" in window && "SpeechSynthesisUtterance" in window);
    return () => window.speechSynthesis?.cancel();
  }, []);

  function playNarration() {
    if (!supported) return;
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
      setSpeaking(true);
      return;
    }
    window.speechSynthesis.cancel();
    const narration = new SpeechSynthesisUtterance("This portfolio compares two systems through their engineering trade-offs. Trace two code compiles a browser demonstration into deterministic Playwright code, so the runtime uses no language model tokens. The cluster scheduler uses action masking to exclude allocations that exceed hardware limits, and a set transformer to handle a changing number of machines. Select a project to compare its chosen architecture with the alternative. Open the engineering rationale for failure modes and production takeaways. In the scheduler model, change the cluster size, reorder machines, and drag a task onto a node to see how masking differs from a reward penalty. The diagrams illustrate the design; they do not run the trained policy or browser workflow.");
    narration.lang = "en-US";
    narration.rate = 0.96;
    narration.onstart = () => setSpeaking(true);
    narration.onend = () => { setSpeaking(false); setPaused(false); };
    narration.onerror = () => { setSpeaking(false); setPaused(false); };
    window.speechSynthesis.speak(narration);
  }

  function pauseNarration() {
    window.speechSynthesis.pause();
    setPaused(true);
    setSpeaking(false);
  }

  function stopNarration() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-sky-300/15 bg-sky-300/[0.06] text-sky-200"><AudioLines aria-hidden="true" className="h-4 w-4" /></span>
      <div className="mr-auto"><div className="text-xs font-semibold text-zinc-200">Listen to the project overview</div><div className="mt-0.5 text-[10px] text-zinc-500">Spoken by your browser when you press play</div></div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={speaking ? pauseNarration : playNarration} disabled={!supported} aria-label={speaking ? "Pause narration" : paused ? "Resume narration" : "Play narration"} className="inline-flex items-center gap-2 rounded-lg border border-sky-300/20 bg-sky-300/[0.07] px-3 py-2 text-[11px] font-semibold text-sky-100 transition hover:bg-sky-300/[0.13] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
          {speaking ? <Pause aria-hidden="true" className="h-3.5 w-3.5" /> : <Play aria-hidden="true" className="h-3.5 w-3.5" />}{speaking ? "Pause" : paused ? "Resume" : "Play audio"}
        </button>
        <button type="button" onClick={stopNarration} disabled={!speaking && !paused} aria-label="Stop narration" className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-zinc-400 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"><Square aria-hidden="true" className="h-3 w-3" /></button>
      </div>
      <span aria-live="polite" className="sr-only">{!supported ? "Audio narration is unavailable in this browser." : speaking ? "Narration playing." : paused ? "Narration paused." : "Narration stopped."}</span>
      {!supported && <p className="w-full text-[10px] text-amber-200/80">This browser does not support speech synthesis. The written overview remains available on the page.</p>}
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#09090b] text-zinc-100">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-white px-4 py-2 text-zinc-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to project analysis
      </a>

      <header className="relative border-b border-white/[0.07]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_48%_-25%,rgba(99,102,241,0.16),transparent_58%)]" />
        <nav aria-label="Main navigation" className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <a href="#top" className="flex items-center gap-2.5 text-sm font-semibold tracking-tight text-zinc-100">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] font-mono text-[10px] text-indigo-200">S/02</span>
            Systems work
          </a>
          <div className="flex items-center gap-5 text-xs text-zinc-500">
            <a className="transition hover:text-zinc-200" href="#projects">Project analysis</a>
            <a className="inline-flex items-center gap-1.5 transition hover:text-zinc-200" href="#approach">Approach <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" /></a>
          </div>
        </nav>

        <div id="top" className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:grid-cols-[1fr_0.72fr] lg:items-center lg:gap-16 lg:pb-24">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-300/15 bg-indigo-300/[0.05] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.7)]" />
              Systems portfolio · engineering decisions
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
              The architecture is in the <span className="bg-gradient-to-r from-indigo-200 via-sky-200 to-emerald-200 bg-clip-text text-transparent">trade-offs.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
              Two systems, six consequential choices. Explore how browser workflows become deterministic code—and how a learned scheduler handles changing clusters without losing its constraints.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#projects" className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2.5 text-xs font-semibold text-zinc-950 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300">
                Explore the decisions <ArrowDown aria-hidden="true" className="h-3.5 w-3.5" />
              </a>
              <span className="text-[11px] text-zinc-600">Interactive technical case studies</span>
            </div>
          </div>

          <SystemMap />
          <div className="mt-6 lg:col-span-2 lg:max-w-2xl"><AudioGuide /></div>
        </div>
      </header>

      <main id="main-content">
        <div id="projects" className="scroll-mt-6">
          <ArchitecturalDecisions />
        </div>

        <section id="approach" aria-labelledby="approach-heading" className="border-t border-white/[0.07] bg-[#0c0c0f] px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.65fr_1fr] lg:gap-20">
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-300">How to read this work</p>
              <h2 id="approach-heading" className="max-w-md text-2xl font-semibold tracking-tight text-white sm:text-3xl">Decisions are easier to evaluate in context.</h2>
            </div>
            <div className="space-y-5 text-sm leading-relaxed text-zinc-400">
              <p>Each project view pairs a chosen design with the baseline it replaces. Expand the rationale to see where the baseline fails and what the trade-off costs. The controls let you inspect a pipeline stage or change the scheduler’s input set.</p>
              <p>The previews explain the architecture; they do not execute a browser workflow or run a trained policy. Numeric outcomes are labeled with their evidence context, so design guarantees and reported results are not presented as the same kind of evidence.</p>
              <div className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 text-xs text-zinc-500"><Workflow aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-indigo-300" /><span>This artifact is designed for technical interviewers and hiring teams: a quick scan surfaces system objectives and outcomes; the interactive sections support a deeper engineering conversation.</span></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.07] px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-[10px] text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <span>Systems work <span className="text-zinc-700">/</span> Architectural decisions</span>
          <span>Built as an interactive portfolio artifact</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
