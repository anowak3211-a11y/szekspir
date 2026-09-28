export async function runUploads(tasks: (() => Promise<void>)[], concurrency = 2) {
  let next = 0;
  const errors: string[] = [];
  await Promise.all(Array.from({length: Math.min(concurrency, tasks.length)}, async () => {
    while (next < tasks.length) {
      const task = tasks[next++];
      try { await task(); } catch (error) { errors.push((error as Error).message); }
    }
  }));
  return errors;
}
