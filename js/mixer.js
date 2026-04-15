const audioNodes = {};

function getAudio(id, file) {
  if (audioNodes[id]) return audioNodes[id];
  const audio = new Audio(file);
  audio.loop = true;
  audio.volume = 0;
  audioNodes[id] = audio;
  return audio;
}

function setVol(id, file, sliderVal) {
  const audio = getAudio(id, file);
  const volume = Math.min(1, Math.max(0, sliderVal / 100));
  audio.volume = volume;

  if (sliderVal > 0 && audio.paused) {
    audio.play().catch(() => {});
  } else if (sliderVal === 0 && !audio.paused) {
    audio.pause();
    audio.currentTime = 0;
  }
}
