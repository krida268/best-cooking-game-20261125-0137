// Warung Kilat — sound: tiny synthesized bleeps via WebAudio, no audio files.
// Everything is created on first use (a user gesture), so a silent browser
// never errors and a muted game never beeps.

const TONES = {
  pick: [[660, 0.06]],
  ding: [[880, 0.12], [1174, 0.16]],
  serve: [[523, 0.09], [659, 0.09], [784, 0.18]],
  error: [[196, 0.18]],
  miss: [[330, 0.15], [247, 0.25]],
  trash: [[440, 0.05], [330, 0.08]],
  over: [[392, 0.15], [330, 0.15], [262, 0.3]],
};

export function createSfx(game) {
  let ctx = null;
  return function play(name) {
    if (game.muted) return;
    try {
      ctx ??= new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') void ctx.resume();
      const now = ctx.currentTime;
      (TONES[name] || []).forEach(([freq, dur], i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.12, now + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + dur + 0.02);
      });
    } catch {
      // Audio is decoration: never let it break the game.
    }
  };
}
