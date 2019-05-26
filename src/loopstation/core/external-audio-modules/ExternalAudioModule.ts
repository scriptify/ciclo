import { listWAMS, createWam } from '../web-audio-modules/WebAudioModules';

export async function listExternalAudioModules(): Promise<
  ExternalAudioModule[]
> {
  const wams = await listWAMS();
  return wams.map(wam => ({
    thumbnail: wam.thumbnail,
    name: wam.name,
    id: wam.name,
    type: 'WAM',
    url: wam.gui || wam.url,
  }));
}

export async function createExternalAudioModule(
  audioModule: ExternalAudioModule,
  audioCtx: AudioContext,
  destination: AudioNode,
) {
  if (audioModule.type === 'WAM') {
    await createWam(audioModule.url, audioCtx, destination);
  }
}
