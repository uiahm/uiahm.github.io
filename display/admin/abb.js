// AdBreakBox admin helpers. Static-site login for GitHub Pages.
// The GitHub token is stored in the repo only in encrypted form (admin/auth.json),
// locked with your password (PBKDF2-SHA256, 600k rounds + AES-GCM). It is decrypted
// in your browser at login and kept in sessionStorage until you log out or close the tab.
const ABB = (() => {
  const enc = new TextEncoder(), dec = new TextDecoder();
  const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
  const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const ITER = 600000;

  async function key(password, salt) {
    const base = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" },
      base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }
  async function encrypt(text, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await key(password, salt), enc.encode(text));
    return { v: 1, iter: ITER, salt: b64(salt), iv: b64(iv), ct: b64(ct) };
  }
  async function decrypt(blob, password) {
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(blob.iv) },
      await key(password, unb64(blob.salt)), unb64(blob.ct));
    return dec.decode(pt);
  }

  // Session
  const S = "abb_session";
  const session = () => { try { return JSON.parse(sessionStorage.getItem(S)); } catch { return null; } };
  const setSession = s => sessionStorage.setItem(S, JSON.stringify(s));
  const logout = () => { sessionStorage.removeItem(S); location.href = "login.html"; };
  const requireLogin = () => { const s = session(); if (!s) location.href = "login.html"; return s; };

  // GitHub contents API
  async function gh(s, method, path, body) {
    const url = `https://api.github.com/repos/${s.owner}/${s.repo}/contents/${path}` +
      (method === "GET" ? `?ref=${encodeURIComponent(s.branch)}&t=${Date.now()}` : "");
    const r = await fetch(url, { method, headers: {
      Authorization: `Bearer ${s.token}`, Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28" }, body: body ? JSON.stringify(body) : undefined });
    if (!r.ok) { const e = new Error(`GitHub ${r.status}: ${(await r.json().catch(() => ({}))).message || r.statusText}`); e.status = r.status; throw e; }
    return r.json();
  }
  const utf8ToB64 = s => btoa(String.fromCharCode(...enc.encode(s)));
  const b64ToUtf8 = s => dec.decode(unb64(s.replace(/\n/g, "")));
  async function readJson(s, path) { const f = await gh(s, "GET", path); return { data: JSON.parse(b64ToUtf8(f.content)), sha: f.sha }; }
  async function writeFile(s, path, text, message, sha) {
    return gh(s, "PUT", path, { message, content: utf8ToB64(text), branch: s.branch, ...(sha ? { sha } : {}) });
  }
  async function list(s, dir) { return gh(s, "GET", dir); }

  // Repo folder that holds this package, guessed from the URL (…/admin/xxx.html → …/)
  const guessFolder = () => location.pathname.replace(/admin\/[^/]*$/, "").replace(/^\//, "");

  const h = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  return { encrypt, decrypt, session, setSession, logout, requireLogin, readJson, writeFile, list, guessFolder, h, gh };
})();
