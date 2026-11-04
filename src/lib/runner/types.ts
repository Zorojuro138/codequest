export type RunResult = { output: string; error?: string };

export async function runInBrowser(language: "python" | "javascript", code: string): Promise<RunResult> {
  return language === "python" ? runPython(code) : runJavaScript(code);
}

async function runJavaScript(code: string): Promise<RunResult> {
  const token = crypto.randomUUID();
  const frame = document.createElement("iframe");
  frame.title = "Isolated code runner";
  frame.setAttribute("sandbox", "allow-scripts");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;width:1px;height:1px;left:-9999px;top:-9999px;border:0";
  frame.srcdoc = `<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; connect-src 'none'; img-src 'none'; style-src 'unsafe-inline'; form-action 'none'; worker-src 'none'; base-uri 'none'"><script>
    addEventListener('message', async function(event) {
      if (event.source !== parent || !event.data || event.data.token !== '${token}') return;
      const output = [];
      const safeConsole = { log: (...values) => output.push(values.map(value => typeof value === 'string' ? value : JSON.stringify(value)).join(' ')), info: (...values) => output.push(values.map(String).join(' ')), warn: (...values) => output.push(values.map(String).join(' ')), error: (...values) => output.push(values.map(String).join(' ')) };
      try { await new Function('console', event.data.code)(safeConsole); parent.postMessage({ token: '${token}', output: output.join('\\n') }, '*'); }
      catch (error) { parent.postMessage({ token: '${token}', output: output.join('\\n'), error: String(error && error.message || error) }, '*'); }
    });
  <\/script>`;
  document.body.appendChild(frame);

  try {
    return await new Promise<RunResult>((resolve, reject) => {
      const timeout = window.setTimeout(() => finish(new Error("Your code took too long. Check your loop and try again.")), 4000);
      const finish = (error?: Error, result?: RunResult) => {
        window.clearTimeout(timeout);
        window.removeEventListener("message", onMessage);
        if (error) reject(error);
        else resolve(result ?? { output: "" });
      };
      const onMessage = (event: MessageEvent<{ token?: string; output?: string; error?: string }>) => {
        if (event.source !== frame.contentWindow || event.data?.token !== token) return;
        finish(undefined, { output: event.data.output ?? "", error: event.data.error });
      };
      window.addEventListener("message", onMessage);
      frame.addEventListener("load", () => frame.contentWindow?.postMessage({ token, code }, "*"), { once: true });
    });
  } finally {
    frame.remove();
  }
}

let pythonWorker: Worker | undefined;
let pythonReady = false;
let nextRunId = 1;
const pythonRuns = new Map<number, { resolve: (result: RunResult) => void; reject: (error: Error) => void; timeout: number }>();

function getPythonWorker() {
  if (pythonWorker) return pythonWorker;
  pythonWorker = new Worker("/workers/python.mjs", { type: "module", name: "codequest-python-runner" });
  pythonWorker.addEventListener("message", (event: MessageEvent<{ id?: number; output?: string; error?: string; type?: string }>) => {
    if (event.data.type === "ready") {
      pythonReady = true;
      return;
    }
    if (event.data.id === undefined) return;
    const run = pythonRuns.get(event.data.id);
    if (!run) return;
    window.clearTimeout(run.timeout);
    pythonRuns.delete(event.data.id);
    run.resolve({ output: event.data.output ?? "", error: event.data.error });
  });
  pythonWorker.addEventListener("error", () => {
    pythonWorker?.terminate();
    pythonWorker = undefined;
    pythonReady = false;
    for (const [id, run] of pythonRuns) {
      window.clearTimeout(run.timeout);
      run.reject(new Error("The Python runner could not start. Refresh and try again."));
      pythonRuns.delete(id);
    }
  });
  return pythonWorker;
}

function runPython(code: string) {
  const id = nextRunId++;
  return new Promise<RunResult>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      pythonRuns.delete(id);
      pythonWorker?.terminate();
      pythonWorker = undefined;
      pythonReady = false;
      reject(new Error("Your code took too long. Check your loop and try again."));
    }, pythonReady ? 7000 : 30000);
    pythonRuns.set(id, { resolve, reject, timeout });
    getPythonWorker().postMessage({ id, code });
  });
}
