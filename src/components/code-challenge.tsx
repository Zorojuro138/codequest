"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { AlertCircle, CheckCircle2, Code2, Lightbulb, LoaderCircle, Play, RotateCcw } from "lucide-react";
import type { CodeStep } from "@/lib/content/catalog";
import { runInBrowser } from "@/lib/runner/types";
import { speakText } from "@/lib/voice/web-speech-tts";
import { useGameStore } from "@/store/use-game-store";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });
type Result = { output: string; error?: string; passed: boolean };

export function CodeChallenge({ step, language, lessonId, voiceEnabled, voiceRate, onPass }: { step: CodeStep; language: "python" | "javascript"; lessonId: string; voiceEnabled: boolean; voiceRate: number; onPass: (hintsUsed: number | null) => void }) {
  const [code, setCode] = useState(step.starter);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [shownHints, setShownHints] = useState(0);
  const recordMistake = useGameStore((state) => state.recordMistake);
  const recordChallengePass = useGameStore((state) => state.recordChallengePass);

  async function runCode() {
    setBusy(true);
    setResult(null);
    try {
      const execution = await runInBrowser(language, code);
      const passed = !execution.error && execution.output.trimEnd() === step.expectedOutput.trimEnd();
      setResult({ ...execution, passed });
      if (passed) { onPass(shownHints); recordChallengePass(lessonId); if (voiceEnabled) speakText("Great work. Challenge complete!", voiceRate); }
      else recordMistake();
      if (!passed && voiceEnabled) speakText(execution.error ?? "Almost. Check the output and try again.", voiceRate);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong while running your code.";
      setResult({ output: "", error: message, passed: false });
      recordMistake();
      if (voiceEnabled) speakText(message, voiceRate);
    } finally {
      setBusy(false);
    }
  }

  function resetCode() {
    setCode(step.starter);
    setResult(null);
  }

  function revealHint() {
    setShownHints((count) => Math.min(step.hints.length, count + 1));
    if (voiceEnabled && step.hints[shownHints]) speakText(step.hints[shownHints], voiceRate);
  }

  return (
    <div className="challenge-card">
      <div className="challenge-prompt"><span className="challenge-prompt-icon"><Code2 size={17} /></span><div><span className="challenge-label">YOUR CHALLENGE</span><p>{step.prompt}</p></div></div>
      <div className="editor-frame">
        <div className="editor-topbar"><div className="editor-dots"><i /><i /><i /></div><span>{language === "python" ? "main.py" : "main.js"}</span><button type="button" onClick={resetCode} aria-label="Reset code"><RotateCcw size={14} /></button></div>
        <Editor
          height="250px"
          language={language === "python" ? "python" : "javascript"}
          theme="vs-dark"
          value={code}
          onChange={(value) => { setCode(value ?? ""); setResult(null); onPass(null); }}
          options={{ minimap: { enabled: false }, fontSize: 14, lineNumbers: "on", scrollBeyondLastLine: false, automaticLayout: true, tabSize: 4, wordWrap: "on", padding: { top: 14 }, roundedSelection: false, contextmenu: false, suggestOnTriggerCharacters: false, quickSuggestions: false, readOnly: false }}
        />
      </div>
      <div className="challenge-actions">
        <button type="button" className="button button-primary run-button" onClick={runCode} disabled={busy}>
          {busy ? <LoaderCircle size={16} className="spin-icon" /> : <Play size={15} fill="currentColor" />} {busy ? "Running in your browser…" : "Run code"}
        </button>
        <button type="button" className="hint-button" onClick={revealHint} disabled={shownHints >= step.hints.length || Boolean(result?.passed)}><Lightbulb size={16} /> {shownHints ? `Hint ${shownHints}/${step.hints.length}` : "Need a hint?"}</button>
      </div>
      {shownHints > 0 && <div className="hint-box"><Lightbulb size={16} /><span>{step.hints[shownHints - 1]}</span></div>}
      {result && <div className={`run-result ${result.passed ? "run-success" : "run-failure"}`} role="status">
        {result.passed ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
        <div><strong>{result.passed ? "That’s it — challenge complete!" : result.error ? "Let’s fix that error" : "Almost! Check the output and try again."}</strong>
          {result.error && <p className="run-error-text">{result.error}</p>}
          {!result.error && <pre>{result.output || "(no output)"}</pre>}
        </div>
      </div>}
    </div>
  );
}
