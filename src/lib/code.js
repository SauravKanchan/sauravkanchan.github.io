// ponytail: regex tokenizer that handles the TS-ish snippets on this page, not a real lexer
const KW = new Set([
  'import', 'from', 'export', 'default', 'const', 'new', 'type', 'satisfies',
  'as', 'return', 'function', 'interface', 'true', 'false', 'await',
]);
const RE = /(\/\/.*$)|("(?:[^"\\]|\\.)*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|(\s+)|([^\sA-Za-z_$\d"]+)/g;

export function tokenize(line) {
  const out = [];
  for (const m of line.matchAll(RE)) {
    const [text, com, str, num, id, ws] = m;
    let c = 'p';
    if (com) c = 'com';
    else if (str) c = 'str';
    else if (num) c = 'num';
    else if (ws) c = 'ws';
    else if (id) {
      const rest = line.slice(m.index + text.length);
      if (KW.has(text)) c = 'kw';
      else if (/^[A-Z]/.test(text)) c = 'type';
      else if (/^\s*:/.test(rest) && !/^\s*::/.test(rest)) c = 'key';
      else if (/^\s*\(/.test(rest)) c = 'fn';
      else c = 'id';
    }
    out.push({ text, c });
  }
  return out;
}

export function lines(src) {
  return src.split('\n').map((l) => {
    const indent = l.match(/^\s*/)[0].length;
    return { indent, tokens: tokenize(l.slice(indent)) };
  });
}

export function hash(s) {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7);
}
