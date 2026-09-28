import * as lamejs from '@breezystack/lamejs';
self.onmessage = (event: MessageEvent<{samples: Float32Array; rate: number}>) => {
  try {
    const {samples, rate} = event.data;
    const encoder = new lamejs.Mp3Encoder(1, rate, 64);
    const chunks: Uint8Array[] = [];
    for (let i = 0; i < samples.length; i += 1152) {
      const block = new Int16Array(Math.min(1152, samples.length - i));
      for (let j = 0; j < block.length; j++) {
        const sample = Math.max(-1, Math.min(1, samples[i+j]));
        block[j] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      }
      const out = encoder.encodeBuffer(block);
      if (out.length) chunks.push(new Uint8Array(out));
    }
    const end = encoder.flush();
    if (end.length) chunks.push(new Uint8Array(end));
    self.postMessage({chunks});
  } catch (error) { self.postMessage({error: (error as Error).message}); }
};
