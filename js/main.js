const sounds = [
  { id: 'rain',      label: 'Rain',      icon: 'cloud-rain',      file: 'sounds/rain.mp3'      },
  { id: 'waves',     label: 'Ocean',     icon: 'waves',           file: 'sounds/waves.mp3'     },
  { id: 'fire',      label: 'Fire',      icon: 'flame',           file: 'sounds/fire.mp3'      },
  { id: 'birds',     label: 'Birds',     icon: 'bird',            file: 'sounds/birds.mp3'     },
  { id: 'waterfall', label: 'Waterfall', icon: 'droplets',        file: 'sounds/waterfall.mp3' },
  { id: 'thunder',   label: 'Thunder',   icon: 'cloud-lightning', file: 'sounds/thunder.mp3'   },
  { id: 'crickets',  label: 'Crickets',  icon: 'bug',             file: 'sounds/crickets.mp3'  },
];


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

  if (window.lucide) lucide.createIcons();
}

buildUI();