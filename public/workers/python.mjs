import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/pyodide.mjs";

const pyodideReady = loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/" });
pyodideReady.then(() => self.postMessage({ type: "ready" }));

self.addEventListener("message", async ({ data }) => {
  const output = [];
  try {
    const pyodide = await pyodideReady;
    pyodide.setStdout({ batched: (line) => output.push(line) });
    pyodide.setStderr({ batched: (line) => output.push(line) });
    const globals = pyodide.toPy({});
    try {
      await pyodide.runPythonAsync(data.code, { globals });
    } finally {
      globals.destroy();
    }
    self.postMessage({ id: data.id, output: output.join("\n") });
  } catch (error) {
    self.postMessage({ id: data.id, output: output.join("\n"), error: String(error?.message ?? error) });
  }
});
