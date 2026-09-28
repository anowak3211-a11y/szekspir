"use client";



// Decode any audio/video file in the browser, downmix to 16kHz mono,
// encode to a small mp3 so uploads stay tiny regardless of source size.
export async function extractAudioAsMp3(file: File, onDuration?: (seconds: number) => void): Promise<File> {
  const buf = await file.arrayBuffer();
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ac = new AC();
  let decoded: AudioBuffer;
  try {
    decoded = await ac.decodeAudioData(buf);
  } finally {
    ac.close();
  }

  if (Number.isFinite(decoded.duration) && decoded.duration > 0) onDuration?.(decoded.duration);

  const rate = 16000;
  const off = new OfflineAudioContext(1, Math.ceil(decoded.duration * rate), rate);
  const src = off.createBufferSource();
  src.buffer = decoded;
  src.connect(off.destination);
  src.start();
  const rendered = await off.startRendering();
  const samples = rendered.getChannelData(0);

  return new Promise<File>((resolve, reject) => {
    const worker = new Worker(new URL('./audio-encoder.worker.ts', import.meta.url));
    const timer = setTimeout(() => { worker.terminate(); reject(new Error('Audio preparation timed out. Retry this file.')); }, 300000);
    const finish = () => { clearTimeout(timer); worker.terminate(); };
    worker.onmessage = (event: MessageEvent<{chunks?: Uint8Array[]; error?: string}>) => {
      finish();
      if (event.data.error) { reject(new Error(event.data.error)); return; }
      resolve(new File([new Blob(event.data.chunks as BlobPart[], {type: 'audio/mpeg'})], 'audio.mp3', {type: 'audio/mpeg'}));
    };
    worker.onerror = () => { finish(); reject(new Error('Audio preparation failed. Retry this file.')); };
    worker.postMessage({samples, rate}, [samples.buffer]);
  });
}
