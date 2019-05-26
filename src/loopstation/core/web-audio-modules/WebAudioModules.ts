// function loadWebComponent(href: string, tags: string = '') {
//   return new Promise(resolve => {
//     const link = document.createElement('link');
//     link.setAttribute('rel', 'import');
//     link.setAttribute('href', href);
//     link.onload = () => {
//       console.log('loaded', href);
//       document.body.insertAdjacentHTML('beforeend', tags);
//       resolve();
//     };
//     document.body.appendChild(link);
//   });
// }

// function loadScript(src: string) {
//   return new Promise(resolve => {
//     const script = document.createElement('script');
//     script.setAttribute('src', src);
//     script.onload = resolve;
//     document.body.appendChild(script);
//   });
// }

export async function listWAMS(): Promise<WamMeta[]> {
  const wams = await fetch('https://webaudiomodules.org/meta.json').then(r =>
    r.json(),
  );
  return wams;
}

export async function createWam(
  url: string,
  audioCtx: AudioContext,
  destination: AudioNode,
) {
  const elemId = url
    .replace(new RegExp('/', 'g'), '')
    .replace(new RegExp(':', 'g'), '')
    .replace(new RegExp('\\.', 'g'), '');

  const wrapperElem = document.getElementById(`wrapper-${elemId}`);
  if (wrapperElem) {
    wrapperElem.style.display = 'block';
  } else {
    document.body.insertAdjacentHTML(
      'beforeend',
      `
        <div style="position: absolute; top: 10px; left: 10px;" id="wrapper-${elemId}">
          <button id="close-${elemId}">Close</button>
          <button id="toggle-frontpanel-${elemId}">Toggle Front Panel</button>
          <wam-host id="${elemId}"></wam-host>
        </div>
      `,
    );
  }

  const wamhost = document.getElementById(`${elemId}`) as any;
  wamhost.context = audioCtx;
  const wam = await wamhost.load(url);
  wam.connect(destination);
  wam.connect(audioCtx.destination);

  const closeBtn = document.getElementById(`close-${elemId}`);
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      const wrapperElem = document.getElementById(`wrapper-${elemId}`);
      if (wrapperElem) wrapperElem.style.display = 'none';
    });
  }

  const frontPanelBtn = document.getElementById(`toggle-frontpanel-${elemId}`);
  if (frontPanelBtn) {
    frontPanelBtn.addEventListener('click', () => {
      wamhost.toggleFrontPanel();
    });
  }
}
