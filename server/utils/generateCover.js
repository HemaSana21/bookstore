const fs = require('fs');
const path = require('path');

// Curated palette of vivid gradient pairs - a book's cover color is chosen
// deterministically from its title+category so re-seeding gives consistent results.
const PALETTE = [
  ['#2F54EB', '#5B7CFA'],
  ['#EB4F73', '#F27C9A'],
  ['#0FA968', '#4FD69C'],
  ['#F2994A', '#F7B267'],
  ['#7C3AED', '#A78BFA'],
  ['#0EA5E9', '#67D7F0'],
  ['#DC2626', '#F87171'],
  ['#059669', '#34D399'],
  ['#D97706', '#FBBF24'],
  ['#4338CA', '#818CF8'],
  ['#BE185D', '#F472B6'],
  ['#0891B2', '#22D3EE']
];

const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const wrapText = (text, maxChars) => {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  words.forEach((w) => {
    if ((current + ' ' + w).trim().length > maxChars) {
      lines.push(current.trim());
      current = w;
    } else {
      current = (current + ' ' + w).trim();
    }
  });
  if (current) lines.push(current.trim());
  return lines;
};

const escapeXml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const generateCoverSVG = ({ title, author, category }) => {
  const idx = hashString(`${title}-${category}`) % PALETTE.length;
  const [colorA, colorB] = PALETTE[idx];

  const titleLines = wrapText(title, 16).slice(0, 4);
  const lineHeight = 32;
  const startY = 170 - ((titleLines.length - 1) * lineHeight) / 2;
  const titleTspans = titleLines
    .map((line, i) => `<tspan x="150" y="${startY + i * lineHeight}">${escapeXml(line)}</tspan>`)
    .join('');

  return `<svg width="300" height="400" viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colorA}" />
      <stop offset="100%" stop-color="${colorB}" />
    </linearGradient>
  </defs>
  <rect width="300" height="400" fill="url(#grad)" />
  <rect x="0" y="0" width="10" height="400" fill="rgba(0,0,0,0.18)" />
  <circle cx="250" cy="60" r="70" fill="rgba(255,255,255,0.12)" />
  <text font-family="Arial, sans-serif" font-weight="700" font-size="24" fill="#ffffff" text-anchor="middle">${titleTspans}</text>
  <text x="150" y="358" font-family="Arial, sans-serif" font-size="15" fill="rgba(255,255,255,0.9)" text-anchor="middle">${escapeXml(author)}</text>
  <text x="150" y="382" font-family="Arial, sans-serif" font-size="10" letter-spacing="2" fill="rgba(255,255,255,0.65)" text-anchor="middle">${escapeXml((category || '').toUpperCase())}</text>
</svg>`;
};

// Writes an SVG cover to /uploads/covers/<filename>.svg and returns its public path
const saveCoverForBook = ({ filename, title, author, category }, uploadsDir) => {
  const coversDir = path.join(uploadsDir, 'covers');
  if (!fs.existsSync(coversDir)) fs.mkdirSync(coversDir, { recursive: true });
  const svg = generateCoverSVG({ title, author, category });
  fs.writeFileSync(path.join(coversDir, `${filename}.svg`), svg);
  return `/uploads/covers/${filename}.svg`;
};

module.exports = { generateCoverSVG, saveCoverForBook };
