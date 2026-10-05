import type { Firestore } from 'firebase-admin/firestore';
type Data = Record<string, any>; // Firestore's DocumentData boundary in this in-memory fake.
export class FakeFirestore {
  documents = new Map<string, Data>();
  failReads = false;
  private tail: Promise<unknown> = Promise.resolve();
  asFirestore() { return this as unknown as Firestore; }
  collection(name: string) { return new FakeQuery(this, name); }
  async runTransaction<T>(operation: (tx: FakeTransaction) => Promise<T>): Promise<T> {
    const previous = this.tail;
    let release!: () => void;
    this.tail = new Promise<void>(resolve => { release = resolve; });
    await previous;
    const working = new Map([...this.documents].map(([key, data]) => [key, structuredClone(data)]));
    try {
      const result = await operation(new FakeTransaction(this, working));
      this.documents = working; return result;
    } finally { release(); }
  }
  async recursiveDelete(ref: FakeRef) {
    for (const key of [...this.documents.keys()]) if (key === ref.path || key.startsWith(`${ref.path}/`)) this.documents.delete(key);
  }
}
class FakeSnapshot {
  constructor(public ref: FakeRef, private value?: Data) {}
  get id() { return this.ref.id; }
  get exists() { return this.value !== undefined; }
  data() { return this.value === undefined ? undefined : structuredClone(this.value); }
}
export class FakeRef {
  constructor(public db: FakeFirestore, public path: string) {}
  get id() { return this.path.split('/').at(-1)!; }
  async get() { if (this.db.failReads) throw new Error('read failed'); return new FakeSnapshot(this, this.db.documents.get(this.path)); }
  async set(data: Data, options?: { merge?: boolean }) {
    return this.db.runTransaction(async tx => { tx.set(this, data, options); });
  }
  async update(data: Data) { return this.set(data, { merge: true }); }
}
class FakeQuery {
  constructor(public db: FakeFirestore, public name: string, public filters: [string, unknown][] = [], public cap = Infinity) {}
  doc(id = 'random-test-document') { return new FakeRef(this.db, `${this.name}/${id}`); }
  where(field: string, _operator: string, value: unknown) { return new FakeQuery(this.db, this.name, [...this.filters, [field, value]], this.cap); }
  limit(cap: number) { return new FakeQuery(this.db, this.name, this.filters, cap); }
  snapshot(map: Map<string, Data>) {
    const docs = [...map.entries()].filter(([key, value]) => key.startsWith(`${this.name}/`)
      && key.split('/').length === 2 && this.filters.every(([field, expected]) => value[field] === expected))
      .slice(0, this.cap).map(([key, value]) => new FakeSnapshot(new FakeRef(this.db, key), value));
    return { docs, empty: docs.length === 0, size: docs.length, forEach: (visit: (doc: FakeSnapshot) => void) => docs.forEach(visit) };
  }
  async get() { if (this.db.failReads) throw new Error('read failed'); return this.snapshot(this.db.documents); }
}
class FakeTransaction {
  constructor(private db: FakeFirestore, private map: Map<string, Data>) {}
  async get(target: FakeRef | FakeQuery): Promise<any> {
    if (this.db.failReads) throw new Error('read failed');
    return target instanceof FakeRef ? new FakeSnapshot(target, this.map.get(target.path)) : target.snapshot(this.map);
  }
  set(ref: FakeRef, data: Data, options?: { merge?: boolean }) {
    this.map.set(ref.path, { ...(options?.merge ? this.map.get(ref.path) : {}), ...structuredClone(data) });
  }
  create(ref: FakeRef, data: Data) { if (this.map.has(ref.path)) throw new Error('Already exists'); this.set(ref, data); }
  update(ref: FakeRef, data: Data) { this.set(ref, data, { merge: true }); }
  delete(ref: FakeRef) { this.map.delete(ref.path); }
}
