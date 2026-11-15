import c from '../content.json';

const fb = Object.fromEntries(c.projects.filter((p) => p.repo).map((p) => [p.repo, p.fallback?.stars ?? null]));

// Resume figures until the live numbers arrive; they stay if an API is unreachable or rate-limited.
export const stats = $state({
  live: false,
  stars: c.githubFallback.stars,
  followers: c.githubFallback.followers,
  repos: c.githubFallback.repos,
  lastPush: null,
  repoStars: fb,
  downloads: c.projects.find((p) => p.npm)?.fallback?.downloads ?? null,
});

const TTL = 3600_000;

// Cached per browser for an hour: GitHub allows 60 unauthenticated requests/hour per IP.
const get = async (url) => {
  try {
    const hit = JSON.parse(localStorage.getItem(url));
    if (hit && Date.now() - hit.t < TTL) return hit.v;
  } catch (e) {
    console.warn('stats cache read failed', e);
  }
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  const v = await r.json();
  try {
    localStorage.setItem(url, JSON.stringify({ t: Date.now(), v }));
  } catch (e) {
    console.warn('stats cache write failed', e);
  }
  return v;
};

export function ago(iso) {
  const s = (Date.now() - new Date(iso)) / 1000;
  for (const [n, u] of [[86400, 'd'], [3600, 'h'], [60, 'm']]) if (s >= n) return `${Math.floor(s / n)}${u} ago`;
  return 'just now';
}

export async function loadStats() {
  const u = c.github;
  const own = c.projects.filter((p) => p.repo && !p.repo.startsWith(`${u}/`));
  const npm = c.projects.find((p) => p.npm)?.npm;
  const [user, repos, events, ext, dl] = await Promise.allSettled([
    get(`https://api.github.com/users/${u}`),
    get(`https://api.github.com/users/${u}/repos?per_page=100&type=owner`),
    get(`https://api.github.com/users/${u}/events/public?per_page=30`),
    Promise.all(own.map((p) => get(`https://api.github.com/repos/${p.repo}`))),
    npm ? get(`https://api.npmjs.org/downloads/point/last-month/${npm}`) : Promise.reject(new Error('no npm package')),
  ]);
  for (const r of [user, repos, events, ext, dl]) if (r.status === 'rejected') console.warn('live stats:', r.reason);

  if (user.status === 'fulfilled') {
    stats.followers = user.value.followers;
    stats.repos = user.value.public_repos;
  }
  let total = 0;
  if (repos.status === 'fulfilled') {
    for (const r of repos.value) {
      if (r.fork) continue;
      total += r.stargazers_count;
      if (r.full_name in stats.repoStars) stats.repoStars[r.full_name] = r.stargazers_count;
    }
  }
  if (ext.status === 'fulfilled') {
    ext.value.forEach((r, i) => {
      stats.repoStars[own[i].repo] = r.stargazers_count;
      if (own[i].mine) total += r.stargazers_count;
    });
  }
  if (total) stats.stars = total;
  if (events.status === 'fulfilled') {
    const push = events.value.find((e) => e.type === 'PushEvent') ?? events.value[0];
    if (push) stats.lastPush = { at: push.created_at, repo: push.repo.name };
  }
  if (dl.status === 'fulfilled') stats.downloads = dl.value.downloads;
  stats.live = user.status === 'fulfilled' || dl.status === 'fulfilled';
}
