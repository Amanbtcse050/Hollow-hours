const input = document.getElementById("thoughtInput");
const counter = document.getElementById("counter");
const releaseButton = document.getElementById("releaseButton");
const savedNote = document.getElementById("savedNote");
const soundToggle = document.getElementById("soundToggle");
const soundLabel = document.getElementById("soundLabel");

function updateCounter() {
  const n = input.value.length;
  counter.textContent = `${n} of 400 characters`;
  releaseButton.disabled = n === 0;
}
input.addEventListener("input", updateCounter);

releaseButton.addEventListener("click", () => {
  const text = input.value.trim();
  if (!text) return;
  const thoughts = JSON.parse(localStorage.getItem("hollowHoursThoughts") || "[]");
  thoughts.push({ text, time: new Date().toISOString() });
  localStorage.setItem("hollowHoursThoughts", JSON.stringify(thoughts.slice(-25)));
  input.value = "";
  updateCounter();
  savedNote.textContent = "Left quietly. It will stay on this device.";
  setTimeout(() => savedNote.textContent = "", 5000);
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${Math.min(i * 60, 300)}ms`;
  observer.observe(el);
});

// A tiny self-contained ambient noise generator: no audio file or external service needed.
let audioContext = null;
let noiseSource = null;
let filter = null;
let gain = null;

function startRain() {
  audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
  const bufferSize = audioContext.sampleRate * 2;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    last = last * 0.985 + white * 0.15;
    data[i] = last;
  }
  noiseSource = audioContext.createBufferSource();
  noiseSource.buffer = buffer;
  noiseSource.loop = true;
  filter = audioContext.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1800;
  gain = audioContext.createGain();
  gain.gain.value = 0.055;
  noiseSource.connect(filter).connect(gain).connect(audioContext.destination);
  noiseSource.start();
}

function stopRain() {
  if (noiseSource) {
    try { noiseSource.stop(); } catch (_) {}
    noiseSource.disconnect();
    noiseSource = null;
  }
}

soundToggle.addEventListener("click", async () => {
  const active = soundToggle.classList.toggle("active");
  soundToggle.setAttribute("aria-pressed", String(active));
  soundLabel.textContent = active ? "Ambient sound  on" : "Ambient sound  off";
  if (active) {
    try {
      startRain();
      await audioContext.resume();
    } catch (_) {
      soundToggle.classList.remove("active");
      soundToggle.setAttribute("aria-pressed", "false");
      soundLabel.textContent = "Ambient sound  off";
    }
  } else {
    stopRain();
  }
});

updateCounter();
