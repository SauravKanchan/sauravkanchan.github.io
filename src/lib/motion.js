import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const reduce =
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export { gsap, ScrollTrigger };

// Scenes are built in mount (= document) order so pin spacing stacks correctly,
// and all of them are rebuilt from a clean layout when the width changes.
const scenes = [];

// Register before building: a build may flushSync(), which can mount later sections first.
// App calls rebuildAll() on the next frame, so triggers end up created in document order.
export function scene(build) {
  if (reduce) return () => {};
  const s = { build, ctx: null };
  scenes.push(s);
  s.ctx = gsap.context(build);
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
