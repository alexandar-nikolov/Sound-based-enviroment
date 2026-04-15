const sounds = [
  { id: 'rain',      label: 'Rain',      icon: 'cloud-rain',      file: 'sounds/rain.mp3'      },
  { id: 'waves',     label: 'Ocean',     icon: 'waves',           file: 'sounds/waves.mp3'     },
  { id: 'fire',      label: 'Fire',      icon: 'flame',           file: 'sounds/fire.mp3'      },
  { id: 'birds',     label: 'Birds',     icon: 'bird',            file: 'sounds/birds.mp3'     },
  { id: 'waterfall', label: 'Waterfall', icon: 'droplets',        file: 'sounds/waterfall.mp3' },
  { id: 'thunder',   label: 'Thunder',   icon: 'cloud-lightning', file: 'sounds/thunder.mp3'   },
  { id: 'crickets',  label: 'Crickets',  icon: 'bug',             file: 'sounds/crickets.mp3'  },
];

const audioNodes = {};
let masterVolume = 0.85;
let muted = false;

function getAudio(id, file) {
  if (audioNodes[id]) return audioNodes[id];
  const audio = new Audio(file);
  audio.loop = true;
  audio.volume = 0;
  audioNodes[id] = audio;
  return audio;
}

function applyVolume(id, sliderVal) {
  const audio = audioNodes[id];
  if (!audio) return;
  const effective = muted ? 0 : (sliderVal / 100) * masterVolume;
  audio.volume = Math.min(1, Math.max(0, effective));
}

function setVol(id, file, sliderVal) {
  const audio = getAudio(id, file);
  const effective = muted ? 0 : (sliderVal / 100) * masterVolume;
  audio.volume = Math.min(1, Math.max(0, effective));
  if (sliderVal > 0 && audio.paused && !muted) {
    audio.play().catch(() => {});
  } else if ((sliderVal === 0 || muted) && !audio.paused) {
    if (sliderVal === 0) audio.pause();
  }
}

function getSliderVal(id) {
  const el = document.getElementById('sl-' + id);
  return el ? parseInt(el.value) : 0;
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
        <div class="thumb" id="thumb-${s.id}" style="bottom:-11px"></div>
      </div>
      <div class="ch-val" id="val-${s.id}">0</div>
    `;

    grid.appendChild(ch);

    const sl = ch.querySelector('.ch-range');
    sl.addEventListener('input', () => {
      const v = parseInt(sl.value);
      document.getElementById('fill-' + s.id).style.height = v + '%';
      document.getElementById('thumb-' + s.id).style.bottom = `calc(${v}% - 11px)`;
      document.getElementById('val-' + s.id).textContent = v;
      setVol(s.id, s.file, v);
      ch.classList.toggle('active', v > 0);
    });
  });

  // Master volume slider
  const masterSlider = document.getElementById('masterSlider');
  const masterFill   = document.getElementById('masterFill');
  const masterThumb  = document.getElementById('masterThumb');

  masterSlider.addEventListener('input', () => {
    const v = parseInt(masterSlider.value);
    masterVolume = v / 100;
    masterFill.style.width = v + '%';
    masterThumb.style.left = `calc(${v}% - 10px)`;
    sounds.forEach(s => applyVolume(s.id, getSliderVal(s.id)));
  });

  // Power / mute button
  const powerBtn = document.getElementById('powerBtn');
  powerBtn.addEventListener('click', () => {
    muted = !muted;
    powerBtn.classList.toggle('muted', muted);
    sounds.forEach(s => {
      const audio = audioNodes[s.id];
      if (!audio) return;
      const v = getSliderVal(s.id);
      if (muted) {
        audio.volume = 0;
      } else {
        audio.volume = Math.min(1, (v / 100) * masterVolume);
        if (v > 0 && audio.paused) audio.play().catch(() => {});
      }
    });
  });

  if (window.lucide) lucide.createIcons();
}

buildUI();