"use client";

export interface IStringKV {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
}

class MemoryKV implements IStringKV {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
}

function pickBrowserKV(): IStringKV {
  if (typeof window === "undefined") return new MemoryKV();                 // SSR
  try {
    // Một số browser chặn localStorage (3rd-party / incognito) → thử sessionStorage
    const kv = window.localStorage ?? window.sessionStorage;
    const testKey = "__fhevm_test__";
    kv.setItem(testKey, "1"); kv.removeItem(testKey);
    return kv as IStringKV;
  } catch {
    return new MemoryKV();
  }
}

export class GenericStringStorage {
  private kv: IStringKV;
  private prefix: string;
  constructor(prefix = "fhevm:decsig:v1", kv?: IStringKV) {
    this.kv = kv ?? pickBrowserKV();
    this.prefix = prefix;
  }
  private k(key: string) { return `${this.prefix}:${key}`; }

  get(key: string): string | null {
    try { return this.kv.getItem(this.k(key)); } catch { return null; }
  }
  set(key: string, value: string) {
    try { this.kv.setItem(this.k(key), value); } catch { /* ignore */ }
  }
  remove(key: string) {
    try { this.kv.removeItem(this.k(key)); } catch { /* ignore */ }
  }
  // tiện ích reset mọi bản ghi theo prefix (tuỳ bạn gọi từ UI)
  resetAll(keys: string[]) { keys.forEach(k => this.remove(k)); }
}