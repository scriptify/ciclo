export function audioDataToBuffer(audioCtx: AudioContext, data: Blob[]): Promise<AudioBuffer> {
  return new Promise((resolve) => {
    const blob = new Blob(data, { type: 'audio/ogg; codecs=opus' });
    const fileReader = new FileReader();
    fileReader.addEventListener('loadend', async () => {
      if (!fileReader.result) return;
      const decodedData = await audioCtx.decodeAudioData(fileReader.result as ArrayBuffer);
      resolve(decodedData);
    });
    fileReader.readAsArrayBuffer(blob);
  });
}

export function prepareAudioBuffer(audioBuffer: AudioBuffer) {
  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
    const channelData = audioBuffer.getChannelData(channel);
    const FADE_LENGTH = 100;
    for (let i = 0; i < FADE_LENGTH && i < channelData.length; i += 1) {
      const fadeOutPos = channelData.length - i - 1;
      channelData[i] = (channelData[i] * i) / FADE_LENGTH;
      channelData[fadeOutPos] = (channelData[fadeOutPos] * i) / FADE_LENGTH;
    }
  }
}

export function getResizeFactor(firstSampleLength: number, newSampleLength: number) {
  return (
    (Math.ceil(newSampleLength / firstSampleLength) * firstSampleLength)
    / newSampleLength
  );
}

interface ResizeAudioBufferParams {
  audioCtx: AudioContext;
  audioBuffer: AudioBuffer;
  newLength: number;
  mode?: string;
}

export function resizeAudioBuffer({
  audioCtx,
  audioBuffer,
  newLength,
  mode = 'after',
}: ResizeAudioBufferParams) {
  if (audioBuffer.length === newLength) return audioBuffer;

  const newAudioBuffer = audioCtx.createBuffer(
    audioBuffer.numberOfChannels,
    newLength,
    audioBuffer.sampleRate,
  );

  const setOffset = (mode === 'after' || newLength < audioBuffer.sampleRate)
    ? 0
    :newLength - audioBuffer.length;

  for (let channel = 0; channel < newAudioBuffer.numberOfChannels; channel += 1) {
    newAudioBuffer.copyToChannel(audioBuffer.getChannelData(channel), channel, setOffset);
  }

  return newAudioBuffer;
}

interface RepeatBufferParams {
  audioBuffer: AudioBuffer;
  audioCtx: AudioContext;
  times: number;
}

export function repeatBuffer({ audioBuffer, audioCtx, times }: RepeatBufferParams) {
  const newBuffer = audioCtx.createBuffer(
    audioBuffer.numberOfChannels,
    audioBuffer.length * times,
    audioBuffer.sampleRate,
  );

  for (let currOffset = 0; currOffset < newBuffer.length; currOffset += audioBuffer.length) {
    for (let channel = 0; channel < newBuffer.numberOfChannels; channel += 1) {
      newBuffer.copyToChannel(audioBuffer.getChannelData(channel), channel, currOffset);
    }
  }
  return newBuffer;
}
