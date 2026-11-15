import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const reduce =
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export { gsap, ScrollTrigger };

// Scenes are built in mount (= document) order so pin spacing stacks correctly,
// and all of them are rebuilt from a clean layout when the width changes.
const scenes = [];

export function scene(build) {
  if (reduce) return () => {};
  const s = { build, ctx: gsap.context(build) };
  scenes.push(s);
  return () => {
    s.ctx.revert();
    scenes.splice(scenes.indexOf(s), 1);
  };
}

export function rebuildAll() {
  for (const s of [...scenes].reverse()) s.ctx.revert();
  for (const s of scenes) s.ctx = gsap.context(s.build);
  ScrollTrigger.refresh();
}
