// Renders llms.txt (https://llmstxt.org) from the same content.json the site uses.
export function llmsTxt(c) {
  const list = (xs) => xs.map((x) => `- ${x}`).join('\n');
  const link = (name, url, note) => `- [${name}](${url})${note ? `: ${note}` : ''}`;
  const h = c.hackathons;
  return `# ${c.name}

> ${c.tagline} ${c.badge}. Building software professionally since ${c.since}.

Personal site: https://saurav.tech. The page is a client-rendered single-page app; this file carries the same content as plain text.

## Contact

${link('Email', `mailto:${c.socials.email}`)}
${link('GitHub', c.socials.github)}
${link('LinkedIn', c.socials.linkedin)}
${link('Twitter', c.socials.twitter)}
${link('Medium', c.socials.medium)}
${link('Résumé (PDF)', c.resume)}

## Experience

${c.experience.map((e) => `### ${e.role}, ${e.company} (${e.date})\n\n${list(e.bullets)}`).join('\n\n')}

## Projects

${c.projects.map((p) => (p.link ? link(p.name, p.link, `${p.description} (${p.kind}, ${p.date})`) : `- ${p.name}: ${p.description} (${p.kind}, ${p.date})`)).join('\n')}

## Hackathons

${list([...h.recent.map((x) => ({ ...x, event: `ETHGlobal ${x.event}` })), ...h.early].map((x) => `${x.event}: ${x.result}${x.project ? ` (${x.project})` : ''}`))}

## Skills

${c.stack.join(', ')}

## Education

- ${c.education.degree}, ${c.education.school} (${c.education.date})

## Research papers

${c.achievements.papers.map((p) => link(p.title, p.url)).join('\n')}

## Certifications

${list(c.achievements.certifications)}

## Writing

${c.blogs.map((b) => link(b.title, b.url, b.description)).join('\n')}

## Talks

${c.talks.map((t) => link(t.title, t.url, t.subtitle)).join('\n')}
`;
}
