const sounds = [
  { id: 'rain',      label: 'Rain',      icon: 'cloud-rain' },
  { id: 'ocean',     label: 'Ocean',     icon: 'waves' },
  { id: 'wind',      label: 'Wind',      icon: 'wind' },
  { id: 'forest',    label: 'Forest',    icon: 'tree-pine' },
  { id: 'fire',      label: 'Fire',      icon: 'flame' },
  { id: 'waterfall', label: 'Waterfall', icon: 'droplets' },
  { id: 'thunder',   label: 'Thunder',   icon: 'cloud-lightning' },
  { id: 'crickets',  label: 'Crickets',  icon: 'bug' },
];

const noiseTypes = {
  rain: 'brown', ocean: 'brown', wind: 'pink',
  forest: 'pink', fire: 'white', waterfall: 'white',
  thunder: 'brown', crickets: 'white'
};

const filterCfg = {
  rain:      { type: 'bandpass', freq: 1800, Q: 0.5 },
  ocean:     { type: 'lowpass',  freq: 350,  Q: 1   },
  wind:      { type: 'bandpass', freq: 700,  Q: 0.8 },
  forest:    { type: 'bandpass', freq: 1200, Q: 0.6 },
  fire:      { type: 'highpass', freq: 2000, Q: 0.5 },
  waterfall: { type: 'highpass', freq: 4000, Q: 0.5 },
  thunder:   { type: 'lowpass',  freq: 180,  Q: 2   },
  crickets:  { type: 'bandpass', freq: 4500, Q: 18  },
};

let audioCtx = null;
const nodes = {};

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function makeNoise(type) {
  const ac = getCtx();
  const buf = ac.createBuffer(1, ac.sampleRate * 4, ac.sampleRate);
  const d = buf.getChannelData(0);

  if (type === 'white') {
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  } else if (type === 'brown') {
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      d[i] = last * 3.5;
    }
  } else {
    let b = [0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < d.length; i++) {
      const w = Math.random() * 2 - 1;
      b[0] = 0.99886 * b[0] + w * 0.0555179;
      b[1] = 0.99332 * b[1] + w * 0.0750759;
      b[2] = 0.969   * b[2] + w * 0.1538520;
      b[3] = 0.8665  * b[3] + w * 0.3104856;
      b[4] = 0.55    * b[4] + w * 0.5329522;
      b[5] = -0.7616 * b[5] - w * 0.0168980;
      d[i] = (b[0] + b[1] + b[2] + b[3] + b[4] + b[5] + b[6] + w * 0.5362) * 0.11;
      b[6] = w * 0.115926;
    }
  }
  return buf;
}

function ensureChannel(id) {
  if (nodes[id]) return;
  const ac = getCtx();
  const src = ac.createBufferSource();
  src.buffer = makeNoise(noiseTypes[id]);
  src.loop = true;

  const cfg = filterCfg[id];
  const filt = ac.createBiquadFilter();
  filt.type = cfg.type;
  filt.frequency.value = cfg.freq;
  if (cfg.Q) filt.Q.value = cfg.Q;

  const gain = ac.createGain();
  gain.gain.value = 0;

  src.connect(filt);
  filt.connect(gain);
  gain.connect(ac.destination);
  src.start();

  nodes[id] = { gain };
}

function setVol(id, v) {
  const ac = getCtx();
  if (ac.state === 'suspended') ac.resume();
  ensureChannel(id);
  nodes[id].gain.gain.setTargetAtTime(v / 100, ac.currentTime, 0.05);
}

function buildUI() {
  const grid = document.getElementById('channels');

  sounds.forEach(s => {
    const ch = document.createElement('div');
    ch.className = 'channel';
    ch.id = 'ch-' + s.id;
    ch.innerHTML = `
      <div class="ch-icon"><i data-lucide="${s.icon}"></i></div>
      <div class="ch-label">${s.label}</div>
      <div class="slider-track">
        <div class="track-bg"></div>
        <div class="track-fill" id="fill-${s.id}" style="height:0%"></div>
        <input type="range" class="ch-range" id="sl-${s.id}" min="0" max="100" value="0" step="1">
        <div class="thumb" id="thumb-${s.id}" style="bottom:-9px"></div>
      </div>
      <div class="ch-val" id="val-${s.id}">0</div>
    `;
    grid.appendChild(ch);

    const sl = ch.querySelector('.ch-range');

    sl.addEventListener('input', () => {
      const v = parseInt(sl.value);

      document.getElementById('fill-' + s.id).style.height = v + '%';
      document.getElementById('thumb-' + s.id).style.bottom = `calc(${v}% - 9px)`;
      document.getElementById('val-' + s.id).textContent = v;

      setVol(s.id, v);

      if (v > 0) ch.classList.add('active');
      else ch.classList.remove('active');

      const active = sounds.filter(x => parseInt(document.getElementById('sl-' + x.id).value) > 0);
      document.getElementById('hint').textContent =
        active.length === 0 ? 'Move a slider to begin' : active.map(x => x.label).join(' · ');
    });
  });

  if (window.lucide) lucide.createIcons();
}

buildUI();