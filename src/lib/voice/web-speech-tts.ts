export function speakText(text: string, rate = 1) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = Math.min(2, Math.max(0.5, rate));
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}
