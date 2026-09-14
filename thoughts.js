// Hollow Hours shared-thought client.
// IMPORTANT: never put a GitHub token in this file.
const THOUGHTS_API = "https://hollow-hours-thoughts.anand-param-2804.workers.dev";
const MAX_CHARS = 400;

document.addEventListener("DOMContentLoaded", () => {
  const box = document.querySelector("textarea");
  if (!box) return;

  const buttons = [...document.querySelectorAll("button")];
  const button = buttons.find(b =>
    b.textContent.trim().toLowerCase().includes("release")
  ) || box.closest("form")?.querySelector("button");
  if (!button) return;

  box.maxLength = MAX_CHARS;

  const counter = document.createElement("div");
  counter.style.cssText =
    "font:11px monospace;opacity:.45;text-align:right;margin-top:7px";
  box.parentElement?.appendChild(counter);

  const update = () => counter.textContent =
    `${box.value.length} of ${MAX_CHARS} characters`;
  box.addEventListener("input", update);
  update();

  const list = document.createElement("section");
  list.id = "shared-thoughts";
  list.style.marginTop = "28px";
  (box.closest("section") || box.parentElement)?.parentElement?.appendChild(list);

  async function load() {
    if (THOUGHTS_API.includes("PASTE_YOUR")) return;
    try {
      const r = await fetch(`${THOUGHTS_API}/thoughts`, {cache:"no-store"});
      if (!r.ok) throw Error();
      const data = await r.json();
      list.innerHTML = "";
      const thoughts = (data.thoughts || []).slice(-20).reverse();
      if (!thoughts.length) return;

      const h = document.createElement("div");
      h.textContent = "THOUGHTS LEFT HERE";
      h.style.cssText =
        "font:10px monospace;letter-spacing:.3em;opacity:.45;margin-bottom:12px";
      list.appendChild(h);

      for (const t of thoughts) {
        const card = document.createElement("article");
        card.style.cssText =
          "padding:18px 20px;margin:10px 0;border:1px solid rgba(255,255,255,.08);" +
          "border-radius:14px;background:rgba(15,18,29,.55)";
        const text = document.createElement("div");
        text.textContent = `“${t.text}”`;
        text.style.cssText =
          "font-family:Georgia,serif;font-size:17px;line-height:1.55;opacity:.9";
        const time = document.createElement("div");
        time.textContent = `— ${new Date(t.timestamp).toLocaleString("en-IN",
          {dateStyle:"medium",timeStyle:"short"})}`;
        time.style.cssText =
          "font:11px monospace;opacity:.4;margin-top:10px";
        card.append(text,time);
        list.appendChild(card);
      }
    } catch(e) { console.warn("Thoughts:",e); }
  }

  button.addEventListener("click", async e => {
    e.preventDefault();
    const text = box.value.trim();
    if (!text || text.length > MAX_CHARS) return;
    if (THOUGHTS_API.includes("PASTE_YOUR")) {
      alert("The shared-thought backend is not connected yet.");
      return;
    }

    const old = button.textContent;
    button.disabled = true;
    button.textContent = "Leaving it…";
    try {
      const r = await fetch(`${THOUGHTS_API}/thoughts`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({text})
      });
      const data = await r.json().catch(()=>({}));
      if (!r.ok) throw Error(data.error || "Save failed");
      box.value = "";
      update();
      button.textContent = "Left here";
      await load();
      setTimeout(()=>{button.textContent=old;button.disabled=false},1800);
    } catch(e) {
      alert("The thought could not be released right now. Please try again.");
      button.textContent=old;
      button.disabled=false;
    }
  });

  load();
});

