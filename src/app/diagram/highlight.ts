import { CodeLang } from './diagram.model';

export type TokKind =
  'kw' | 'str' | 'com' | 'num' | 'ann' | 'type' | 'fn' | 'key' | 'hdr' | 'status';

export interface Tok {
  t: string;
  k?: TokKind;
}

const JAVA_KW = new Set(
  (
    'abstract boolean break byte case catch char class continue default do double else enum extends final ' +
    'finally float for if implements import instanceof int interface long new null package private protected ' +
    'public return short static super switch this throw throws try void volatile while var yield record true false'
  ).split(' '),
);

const TS_KW = new Set(
  (
    'const let var function return if else for of in new class extends import export from async await try ' +
    'catch throw this null undefined true false typeof interface type private public readonly'
  ).split(' '),
);

const SQL_KW = new Set(
  'create unique index if not exists on table select from where insert into values update set delete and or null primary key references'.split(
    ' ',
  ),
);

/** Resaltado ligero hecho a mano: suficiente para fragmentos cortos y sin dependencias. */
export function highlight(code: string, lang: CodeLang): Tok[][] {
  const lines = code.split('\n');
  switch (lang) {
    case 'java':
      return clike(lines, JAVA_KW, true);
    case 'ts':
    case 'js':
      return clike(lines, TS_KW, false);
    case 'yaml':
      return lines.map(yamlLine);
    case 'sql':
      return lines.map(sqlLine);
    case 'json':
      return lines.map(jsonLine);
    case 'http':
      return httpLines(lines);
  }
}

function push(out: Tok[], t: string, k?: TokKind) {
  if (!t) return;
  const last = out[out.length - 1];
  if (last && last.k === k) last.t += t;
  else out.push(k ? { t, k } : { t });
}

function clike(lines: string[], keywords: Set<string>, java: boolean): Tok[][] {
  let inBlock = false;
  return lines.map((line) => {
    const out: Tok[] = [];
    let i = 0;
    while (i < line.length) {
      if (inBlock) {
        const end = line.indexOf('*/', i);
        if (end < 0) {
          push(out, line.slice(i), 'com');
          i = line.length;
        } else {
          push(out, line.slice(i, end + 2), 'com');
          i = end + 2;
          inBlock = false;
        }
        continue;
      }
      const rest = line.slice(i);
      if (rest.startsWith('//')) {
        push(out, rest, 'com');
        break;
      }
      if (rest.startsWith('/*')) {
        inBlock = true;
        continue;
      }
      const ch = line[i];
      if (ch === '"' || ch === "'" || ch === '`') {
        let j = i + 1;
        while (j < line.length && line[j] !== ch) j += line[j] === '\\' ? 2 : 1;
        push(out, line.slice(i, j + 1), 'str');
        i = j + 1;
        continue;
      }
      const ann = /^@[A-Za-z_][\w.]*/.exec(rest);
      if (ann) {
        push(out, ann[0], 'ann');
        i += ann[0].length;
        continue;
      }
      const num = /^\d[\d_]*(\.\d+)?[LlFfDd]?\b/.exec(rest);
      if (num && !/[\w$]/.test(line[i - 1] ?? '')) {
        push(out, num[0], 'num');
        i += num[0].length;
        continue;
      }
      const id = /^[A-Za-z_$][\w$]*/.exec(rest);
      if (id) {
        const word = id[0];
        const after = line.slice(i + word.length);
        let k: TokKind | undefined;
        if (keywords.has(word)) k = 'kw';
        else if (/^\s*\(/.test(after)) k = 'fn';
        else if (/^[A-Z]/.test(word) && (java || /[a-z]/.test(word))) k = 'type';
        push(out, word, k);
        i += word.length;
        continue;
      }
      push(out, ch);
      i++;
    }
    return out;
  });
}

function yamlLine(line: string): Tok[] {
  const out: Tok[] = [];
  const m = /^(\s*-?\s*)([\w.-]+)(:)(.*)$/.exec(line);
  if (m) {
    push(out, m[1]);
    push(out, m[2], 'key');
    push(out, m[3]);
    push(out, m[4], m[4].trim().startsWith('#') ? 'com' : 'str');
    return out;
  }
  const item = /^(\s*-\s*)(.*)$/.exec(line);
  if (item) {
    push(out, item[1]);
    push(out, item[2], 'str');
    return out;
  }
  push(out, line, line.trim().startsWith('#') ? 'com' : undefined);
  return out;
}

function sqlLine(line: string): Tok[] {
  const out: Tok[] = [];
  const c = line.indexOf('--');
  const body = c >= 0 ? line.slice(0, c) : line;
  for (const part of body.split(/(\s+|[(),]|'[^']*')/)) {
    if (!part) continue;
    if (part.startsWith("'")) push(out, part, 'str');
    else if (/^-?\d+$/.test(part)) push(out, part, 'num');
    else if (SQL_KW.has(part.toLowerCase())) push(out, part, 'kw');
    else if (/^[A-Z_]+$/.test(part)) push(out, part, 'fn');
    else push(out, part);
  }
  if (c >= 0) push(out, line.slice(c), 'com');
  return out;
}

function jsonLine(line: string): Tok[] {
  const out: Tok[] = [];
  const re = /("(?:[^"\\]|\\.)*")(\s*:)?|(-?\d+(?:\.\d+)?)|\b(true|false|null)\b/g;
  let last = 0;
  for (let m = re.exec(line); m; m = re.exec(line)) {
    push(out, line.slice(last, m.index));
    if (m[1]) {
      push(out, m[1], m[2] ? 'key' : 'str');
      if (m[2]) push(out, m[2]);
    } else if (m[3]) push(out, m[3], 'num');
    else push(out, m[4], 'kw');
    last = re.lastIndex;
  }
  push(out, line.slice(last));
  return out;
}

function httpLines(lines: string[]): Tok[][] {
  let body = false;
  return lines.map((line, i) => {
    if (i === 0) {
      const out: Tok[] = [];
      const status = /^(HTTP\/[\d.]+)(\s+)(\d{3})(.*)$/.exec(line);
      if (status) {
        push(out, status[1], 'kw');
        push(out, status[2]);
        push(out, status[3] + status[4], 'status');
        return out;
      }
      const req = /^([A-Z]+)(\s+)(\S+)(.*)$/.exec(line);
      if (req) {
        push(out, req[1], 'kw');
        push(out, req[2]);
        push(out, req[3], 'str');
        push(out, req[4], 'com');
        return out;
      }
    }
    if (!body && line.trim() === '') {
      body = true;
      return [];
    }
    if (body) return jsonLine(line);
    const h = /^([\w-]+)(:)(.*)$/.exec(line);
    if (h) return [{ t: h[1], k: 'hdr' }, { t: h[2] }, { t: h[3] }];
    return [{ t: line }];
  });
}
