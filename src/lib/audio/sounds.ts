export function playQuestChime() {
  if (typeof window === "undefined") return;
  const AudioContextClass = window.AudioContext;
  if (!AudioContextClass) return;
  const context = new AudioContextClass();
  const now = context.currentTime;
  [659.25, 783.99, 987.77].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, now + index * 0.11);
    gain.gain.exponentialRampToValueAtTime(0.08, now + index * 0.11 + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.11 + 0.32);
    oscillator.connect(gain); gain.connect(context.destination);
    oscillator.start(now + index * 0.11); oscillator.stop(now + index * 0.11 + 0.34);
  });
  window.setTimeout(() => void context.close(), 700);
}
