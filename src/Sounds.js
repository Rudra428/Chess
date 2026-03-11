const Sounds = {
  move: new Audio("/sounds/move-self.mp3"),
  capture: new Audio("/sounds/capture.mp3"),
  checkmate: new Audio("/sounds/checkmate.mp3"),
  check: new Audio("/sounds/check.mp3"),
  rook: new Audio("/sounds/the-rook.mp3"),
  knight: new Audio("/sounds/knight.mp3"),
};

export function playSound(type) {
  const sound = Sounds[type];
  if (!sound) return;
  sound.currentTime = 0;
  sound.playbackRate=1.3;
  sound.play().catch(() => {});
}
