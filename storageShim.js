// Polyfills window.storage with the same shape Claude's artifact sandbox
// provides (get/set/delete/list, each async, each scoped by key + shared
// flag), backed by the browser's real localStorage. This means App.jsx
// (originally written for a Claude artifact) needs zero changes to run
// standalone — every window.storage.get/set/delete call just works.
//
// "shared" data (shared=true) and "personal" data (shared=false, default)
// are namespaced separately, matching the artifact's behavior. Since this
// is a single-user localStorage (no real backend), both are actually
// private to whoever's browser it is — there's no cross-user sharing here,
// which matches how each person who deploys/visits their own copy of this
// app only ever sees their own data anyway.

const NS = "fintrack:";

function nsKey(key, shared) {
  return `${NS}${shared ? "shared" : "local"}:${key}`;
}

async function get(key, shared = false) {
  try {
    const raw = window.localStorage.getItem(nsKey(key, shared));
    if (raw === null) return null;
    return { key, value: raw, shared };
  } catch (e) {
    console.error("storage.get failed", e);
    return null;
  }
}

async function set(key, value, shared = false) {
  try {
    window.localStorage.setItem(nsKey(key, shared), value);
    return { key, value, shared };
  } catch (e) {
    console.error("storage.set failed", e);
    return null;
  }
}

async function del(key, shared = false) {
  try {
    window.localStorage.removeItem(nsKey(key, shared));
    return { key, deleted: true, shared };
  } catch (e) {
    console.error("storage.delete failed", e);
    return null;
  }
}

async function list(prefix = "", shared = false) {
  try {
    const nsPrefix = `${NS}${shared ? "shared" : "local"}:`;
    const keys = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const fullKey = window.localStorage.key(i);
      if (fullKey && fullKey.startsWith(nsPrefix)) {
        const bareKey = fullKey.slice(nsPrefix.length);
        if (bareKey.startsWith(prefix)) keys.push(bareKey);
      }
    }
    return { keys, prefix, shared };
  } catch (e) {
    console.error("storage.list failed", e);
    return { keys: [], prefix, shared };
  }
}

export function installStorageShim() {
  if (typeof window !== "undefined" && !window.storage) {
    window.storage = { get, set, delete: del, list };
  }
}
