async function createWamHostWebComponent() {
  const html = await fetch('https://webaudiomodules.org/wam-host.html', {
    mode: 'cors',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  }).then((res) => res.text());
  class WamHost extends HTMLElement {
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: 'open' });
      shadow.innerHTML = html;
    }
  }
  customElements.define('wam-host', WamHost);
}

export async function listWAMS(): Promise<WamMeta[]> {
  return [];
  await createWamHostWebComponent();
  // First create was-host webcomponent
  const wams = await fetch('https://webaudiomodules.org/meta.json', {
    mode: 'cors',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  }).then((r) => r.json());
  console.log({ wams });
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
      wam.disconnect(audioCtx.destination);
      console.log(wam);
    });
  }

  const frontPanelBtn = document.getElementById(`toggle-frontpanel-${elemId}`);
  if (frontPanelBtn) {
    frontPanelBtn.addEventListener('click', () => {
      wamhost.toggleFrontPanel();
    });
  }
}
