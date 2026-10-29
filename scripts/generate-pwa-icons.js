const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Full icon SVG
const getSvg = (isMaskable = false) => {
  const scale = isMaskable ? 0.75 : 0.85;
  const offset = isMaskable ? 64 : 38;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#022c22" />
      <stop offset="50%" stop-color="#064e3b" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#34d399" />
      <stop offset="100%" stop-color="#10b981" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.4" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" rx="${isMaskable ? 0 : 110}" fill="url(#bgGrad)" />

  <g transform="translate(${offset}, ${offset}) scale(${scale})" filter="url(#shadow)">
    <!-- Inner subtle glow circle -->
    <circle cx="256" cy="256" r="210" fill="none" stroke="url(#goldGrad)" stroke-width="4" stroke-opacity="0.3" stroke-dasharray="8 8" />

    <!-- Tree Canopy (Organic Nodes & Branches) -->
    <!-- Trunk & Root -->
    <path d="M 236 400 Q 248 330 244 260 L 268 260 Q 264 330 276 400 Q 256 390 236 400 Z" fill="url(#goldGrad)" />
    <!-- Root base flare -->
    <path d="M 210 410 Q 240 395 256 398 Q 272 395 302 410 C 275 402 235 402 210 410 Z" fill="url(#goldGrad)" opacity="0.9" />

    <!-- Branch lines -->
    <!-- Central branch -->
    <path d="M 256 260 L 256 160" stroke="url(#goldGrad)" stroke-width="12" stroke-linecap="round" />
    <!-- Left branch 1 -->
    <path d="M 250 250 Q 180 230 150 170" fill="none" stroke="url(#goldGrad)" stroke-width="10" stroke-linecap="round" />
    <!-- Right branch 1 -->
    <path d="M 262 250 Q 332 230 362 170" fill="none" stroke="url(#goldGrad)" stroke-width="10" stroke-linecap="round" />
    <!-- Left branch 2 -->
    <path d="M 248 200 Q 200 170 180 110" fill="none" stroke="url(#goldGrad)" stroke-width="8" stroke-linecap="round" />
    <!-- Right branch 2 -->
    <path d="M 264 200 Q 312 170 332 110" fill="none" stroke="url(#goldGrad)" stroke-width="8" stroke-linecap="round" />

    <!-- Connecting network lines (family tree relationships) -->
    <path d="M 150 170 L 180 110 L 256 80 L 332 110 L 362 170" fill="none" stroke="#fef08a" stroke-width="3" stroke-dasharray="5 5" opacity="0.5" />
    <path d="M 150 170 Q 256 200 362 170" fill="none" stroke="#fef08a" stroke-width="2" stroke-dasharray="4 4" opacity="0.4" />

    <!-- Leaf / Member Nodes (Circles with icons/dots) -->
    <!-- Top Apex Node (G1) -->
    <circle cx="256" cy="80" r="28" fill="url(#goldGrad)" stroke="#ffffff" stroke-width="4" />
    <circle cx="256" cy="80" r="14" fill="#064e3b" />

    <!-- Generation 2 Nodes -->
    <circle cx="180" cy="110" r="22" fill="url(#emeraldGrad)" stroke="url(#goldGrad)" stroke-width="4" />
    <circle cx="332" cy="110" r="22" fill="url(#emeraldGrad)" stroke="url(#goldGrad)" stroke-width="4" />

    <circle cx="150" cy="170" r="20" fill="url(#emeraldGrad)" stroke="url(#goldGrad)" stroke-width="3.5" />
    <circle cx="256" cy="160" r="22" fill="url(#goldGrad)" stroke="#ffffff" stroke-width="3.5" />
    <circle cx="362" cy="170" r="20" fill="url(#emeraldGrad)" stroke="url(#goldGrad)" stroke-width="3.5" />

    <!-- Sub nodes / leaves -->
    <circle cx="120" cy="220" r="15" fill="#fef08a" opacity="0.9" />
    <circle cx="392" cy="220" r="15" fill="#fef08a" opacity="0.9" />
    <path d="M 150 170 L 120 220" stroke="url(#goldGrad)" stroke-width="6" stroke-linecap="round" />
    <path d="M 362 170 L 392 220" stroke="url(#goldGrad)" stroke-width="6" stroke-linecap="round" />

    <!-- Text: 'বংশবৃক্ষ' badge at bottom -->
    <rect x="146" y="420" width="220" height="42" rx="21" fill="#022c22" stroke="url(#goldGrad)" stroke-width="2" />
    <text x="256" y="448" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="22" fill="#fbbf24" letter-spacing="2">বংশবৃক্ষ</text>
  </g>
</svg>`;
};

async function generate() {
  const standardSvg = Buffer.from(getSvg(false));
  const maskableSvg = Buffer.from(getSvg(true));

  // Save SVG
  fs.writeFileSync(path.join(iconsDir, 'icon.svg'), standardSvg);

  // 512x512 standard
  await sharp(standardSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'icon-512x512.png'));
  console.log('Generated icon-512x512.png');

  // 192x192 standard
  await sharp(standardSvg)
    .resize(192, 192)
    .png()
    .toFile(path.join(iconsDir, 'icon-192x192.png'));
  console.log('Generated icon-192x192.png');

  // 512x512 maskable
  await sharp(maskableSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(iconsDir, 'maskable-icon-512x512.png'));
  console.log('Generated maskable-icon-512x512.png');

  // 180x180 Apple touch icon
  await sharp(standardSvg)
    .resize(180, 180)
    .png()
    .toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // 32x32 favicon
  await sharp(standardSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, '..', 'public', 'favicon.png'));
  console.log('Generated favicon.png');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});

