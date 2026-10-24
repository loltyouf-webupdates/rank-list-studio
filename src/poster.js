(function () {
  'use strict';
  const WIDTH = 2000, HEIGHT = 2000;
  const SANS = '"RankMontserrat", Arial, sans-serif';
  const STUDENT_FONT = '"RankStudentBebas", sans-serif';
  const TITLE_FONT = '"RankTitleEvagrande", Georgia, serif';
  const CONTENT = { left:494, width:1411 };
  const FOOTER = { top:1700, height:240 };
  const imageCache = new Map();

  function loadImage(source) {
    if (!source) return Promise.resolve(null);
    if (!imageCache.has(source)) imageCache.set(source, new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = source;
    }));
    return imageCache.get(source);
  }
  function safeColor(value, fallback = '#e00000') { return /^#[0-9a-f]{6}$/i.test(value || '') ? value : fallback; }
  function shade(hex, amount) {
    const raw = hex.replace('#', '');
    const channels = [0, 2, 4].map(i => Math.max(0, Math.min(255, parseInt(raw.slice(i, i + 2), 16) + amount)));
    return `rgb(${channels.join(',')})`;
  }
  function polygon(ctx, points, fill) {
    ctx.beginPath();
    points.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]));
    ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
  }
  function fitText(ctx, text, x, y, maxWidth, size, options = {}) {
    const value = String(text == null ? '' : text);
    const family = options.family || SANS, weight = options.weight || '600';
    let actualSize = size;
    ctx.font = `${weight} ${actualSize}px ${family}`;
    const minimum = options.minimum || Math.max(11, size * 0.57);
    while (ctx.measureText(value).width > maxWidth && actualSize > minimum) {
      actualSize -= 0.5; ctx.font = `${weight} ${actualSize}px ${family}`;
    }
    ctx.textAlign = options.align || 'left'; ctx.textBaseline = options.baseline || 'middle';
    ctx.fillStyle = options.color || '#090a0b';
    ctx.fillText(value, x, y, maxWidth);
    return actualSize;
  }
  function drawBackground(ctx, data, accent) {
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.save(); ctx.beginPath(); ctx.rect(365, 0, 1635, HEIGHT); ctx.clip();
    ctx.lineWidth = 3; ctx.strokeStyle = '#f8f8f8';
    for (let x = 365; x <= WIDTH; x += 201) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, HEIGHT); ctx.stroke();
    }
    for (let y = 119; y <= HEIGHT; y += 198) {
      ctx.beginPath(); ctx.moveTo(365, y); ctx.lineTo(WIDTH, y); ctx.stroke();
    }
    ctx.setLineDash([10, 13]); ctx.strokeStyle = '#fafafa';
    for (let x = 465; x <= WIDTH; x += 201) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, HEIGHT); ctx.stroke();
    }
    for (let y = 20; y <= HEIGHT; y += 198) {
      ctx.beginPath(); ctx.moveTo(365, y); ctx.lineTo(WIDTH, y); ctx.stroke();
    }
    ctx.restore();
    const strip = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    strip.addColorStop(0, safeColor(data.barColorStart, '#ff8a00'));
    strip.addColorStop(1, safeColor(data.barColorEnd, '#ad0000'));
    ctx.fillStyle = strip; ctx.fillRect(0, 0, 365, HEIGHT);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 365, HEIGHT); ctx.clip();
    for (let y = -470; y < HEIGHT + 300; y += 350) {
      polygon(ctx, [[-100, y], [465, y + 565], [465, y + 770], [-100, y + 205]], 'rgba(0,0,0,.10)');
      polygon(ctx, [[-100, y + 205], [465, y + 770], [465, y + 835], [-100, y + 270]], 'rgba(255,255,255,.04)');
    }
    ctx.translate(263, 1095); ctx.rotate(-Math.PI / 2);
    fitText(ctx, String(data.sideText || data.subject || 'CHEMISTRY').toUpperCase(), 0, 0, 1700, 315, {
      family: SANS, weight: '700', align: 'center', color: 'rgba(255,255,255,.22)', minimum: 160
    });
    ctx.restore();
  }
  function drawMedal(ctx, x, y, rank, size, ribbon) {
    const palettes = [
      { light: '#fff6ab', mid: '#f6ce59', dark: '#b47e17', line: '#cb9225' },
      { light: '#ffffff', mid: '#d8dce0', dark: '#93999e', line: '#a1a7ac' },
      { light: '#ffd6a4', mid: '#e9a165', dark: '#a95326', line: '#c36b35' }
    ];
    const c = palettes[Math.min(2, rank - 1)];
    ctx.save(); ctx.translate(x, y);
    const r = size * .40;
    if (ribbon) {
      polygon(ctx, [[-r * .62, r * .4], [-r * .95, r * 1.85], [-r * .43, r * 1.56], [-r * .12, r * 1.97], [r * .12, r * .55]], '#e4001b');
      polygon(ctx, [[r * .05, r * .55], [r * .34, r * 1.97], [r * .63, r * 1.56], [r * 1.02, r * 1.85], [r * .62, r * .4]], '#cf0016');
    } else {
      ctx.lineWidth = size * .065; ctx.strokeStyle = c.mid;
      for (const direction of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(direction * r * .58, r * .78);
        ctx.bezierCurveTo(direction * r * 1.35, r * .6, direction * r * 1.52, -r * .08, direction * r * 1.14, -r * .4); ctx.stroke();
        for (let j = 0; j < 4; j++) {
          ctx.save(); ctx.translate(direction * r * (1.18 - j * .05), r * (.48 - j * .22)); ctx.rotate(direction * (-.7 + j * .24));
          ctx.beginPath(); ctx.ellipse(0, 0, size * .085, size * .16, 0, 0, Math.PI * 2);
          ctx.fillStyle = j % 2 ? c.light : c.mid; ctx.fill(); ctx.restore();
        }
      }
    }
    ctx.shadowColor = 'rgba(81,50,0,.13)'; ctx.shadowBlur = 2; ctx.shadowOffsetY = 2;
    const gold = ctx.createLinearGradient(-r, -r, r, r);
    gold.addColorStop(0, c.light); gold.addColorStop(.48, c.mid); gold.addColorStop(1, c.dark);
    ctx.fillStyle = gold; ctx.strokeStyle = c.line; ctx.lineWidth = size * .045; ctx.beginPath();
    if (ribbon) ctx.arc(0, 0, r, 0, Math.PI * 2);
    else {
      ctx.moveTo(0, -r * 1.08); ctx.lineTo(r * .9, -r * .72); ctx.lineTo(r * .85, r * .47);
      ctx.quadraticCurveTo(r * .55, r * .95, 0, r * 1.1); ctx.quadraticCurveTo(-r * .55, r * .95, -r * .85, r * .47);
      ctx.lineTo(-r * .9, -r * .72); ctx.closePath();
    }
    ctx.fill(); ctx.stroke(); ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(255,255,255,.68)'; ctx.lineWidth = size * .025;
    ctx.beginPath(); ctx.arc(0, 0, r * .78, 0, Math.PI * 2); ctx.stroke();
    fitText(ctx, rank, 0, size * .025, size * .55, size * .58, { family: ribbon ? SANS : STUDENT_FONT, weight: ribbon ? '700' : '400', align: 'center', color: c.dark });
    ctx.restore();
  }
  function drawHeader(ctx, data, accent) {
    ctx.fillStyle = accent; ctx.fillRect(495, 148, 163, 65);
    fitText(ctx, data.year || '2026', 576.5, 183, 147, 58, { family: SANS, weight: '700', align: 'center', color: '#ffffff' });
    fitText(ctx, 'GENERAL CERTIFICATE OF EDUCATION', 664, 151, 390, 8.7, { family: SANS, baseline: 'alphabetic' });
    fitText(ctx, 'Advanced Level Examination', 664, 172, 390, 17, { family: SANS, baseline: 'alphabetic' });
    fitText(ctx, String(data.subject || 'CHEMISTRY').toUpperCase(), 661, 212, 660, 48, { family: SANS, weight: '700', baseline: 'alphabetic' });
    const headline = ctx.createLinearGradient(495, 0, 1200, 0);
    headline.addColorStop(0, shade(accent, 25)); headline.addColorStop(1, shade(accent, -60));
    fitText(ctx, String(data.topLabel || 'TOP 20').toUpperCase(), 493, 405, 1000, 232, {
      family: TITLE_FONT, weight: '400', color: headline, baseline: 'alphabetic', minimum: 105
    });
    fitText(ctx, String(data.exam || 'MAIN EXAM 07').toUpperCase(), 491, 496, 970, 86, {
      family: SANS, weight: '700', color: headline, baseline: 'alphabetic', minimum: 40
    });
    const medalsCenter = 1808;
    drawMedal(ctx, medalsCenter - 71, 356, 1, 65, true); drawMedal(ctx, medalsCenter, 356, 2, 65, true); drawMedal(ctx, medalsCenter + 71, 356, 3, 65, true);
    fitText(ctx, String(data.institute || 'SYZYGY').toUpperCase(), 1905, 449, 420, 49, { family: SANS, weight: '700', align: 'right', baseline: 'alphabetic' });
    fitText(ctx, String(data.branch || 'NUGEGODA').toUpperCase(), 1905, 497, 420, 49, { family: SANS, weight: '700', align: 'right', baseline: 'alphabetic' });
  }
  function drawRanking(ctx, data, accent) {
    ctx.fillStyle = accent; ctx.fillRect(494, 516, 1411, 89);
    const labels = [['RANK', 581, 'center', 160], ['NAME', 714, 'left', 382], ['SCHOOL', 1124, 'left', 520], ['MARKS', 1806, 'center', 180]];
    labels.forEach(([text, x, align, maxWidth]) => fitText(ctx, text, x, 562, maxWidth, 36, { family: SANS, weight: '700', align, color: '#ffffff' }));
    const limit = Math.max(1, Math.min(50, Number(data.maxRows) || 20));
    const students = (Array.isArray(data.students) ? data.students : []).slice(0, limit);
    const rowHeight = Math.min(102.5, 1020 / Math.max(1, students.length)), fontSize = Math.min(35, rowHeight * .64);
    students.forEach((student, index) => {
      const centerY = 646 + (rowHeight * index) - (102.5 - rowHeight) * .18, rank = index + 1;
      if (rank <= 3) drawMedal(ctx, 581, centerY - 2, rank, Math.min(58, rowHeight * .71), false);
      else fitText(ctx, rank, 580, centerY, 90, fontSize, { family: STUDENT_FONT, weight: '400', align: 'center' });
      fitText(ctx, String(student.name || '').toUpperCase(), 714, centerY, 382, fontSize, { family: STUDENT_FONT, weight: '400', minimum: Math.max(11, fontSize * .57) });
      fitText(ctx, String(student.school || '').toUpperCase(), 1124, centerY, 605, fontSize, { family: STUDENT_FONT, weight: '400', minimum: Math.max(11, fontSize * .52) });
      fitText(ctx, student.marks == null ? '' : String(student.marks), 1806, centerY, 167, fontSize, { family: STUDENT_FONT, weight: '400', align: 'center' });
    });
  }
  function drawFallbackFooter(ctx, data, accent) {
    ctx.save(); ctx.strokeStyle = accent; ctx.lineWidth = 4;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(602, 1747, 84, 29, i * Math.PI / 3, 0, Math.PI * 2); ctx.stroke(); }
    ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(602, 1747, 14, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    fitText(ctx, data.teacher || '', 732, 1712, 1090, 76, { family: '"RankMontserrat", "Nirmala UI", "Iskoola Pota", Arial, sans-serif', weight: '700', color: accent });
    fitText(ctx, data.qualification || '', 735, 1778, 1040, 22, { family: SANS });
    ctx.fillStyle = accent; ctx.fillRect(734, 1810, 132, 43);
    fitText(ctx, 'Hotline', 800, 1833, 116, 26, { family: SANS, weight: '700', align: 'center', color: '#ffffff' });
    fitText(ctx, data.hotline || '', 877, 1833, 760, 29, { family: SANS, weight: '700' });
  }
  function footerFrames(data) {
    const centerX = CONTENT.left + CONTENT.width / 2;
    if (data.additionalLogo) {
      const teacherWidth = 700, logoWidth = 440, gap = 90;
      const groupLeft = centerX - (teacherWidth + gap + logoWidth) / 2;
      return {
        teacher: { x:groupLeft, width:teacherWidth },
        logo: { x:groupLeft + teacherWidth + gap, width:logoWidth }
      };
    }
    return { teacher:{ x:CONTENT.left, width:CONTENT.width } };
  }
  function containInFooter(ctx, img, frame, maxWidth = frame.width) {
    const scale = Math.min(maxWidth / img.width, FOOTER.height / img.height);
    const width = img.width * scale, height = img.height * scale;
    ctx.drawImage(img, frame.x + (frame.width - width) / 2, FOOTER.top + (FOOTER.height - height) / 2, width, height);
  }
  async function drawFooter(ctx, data, accent) {
    const frame = footerFrames(data).teacher;
    if (data.customFooter) {
      const img = await loadImage(data.customFooter);
      if (img) {
        containInFooter(ctx, img, frame, Math.min(frame.width, 1260)); return;
      }
    }
    if (data.showOriginalFooter !== false && data.footerAsset) {
      const img = await loadImage(data.footerAsset);
      if (img) {
        const scaleX = img.width / WIDTH, scaleY = img.height / HEIGHT;
        const bannerWidth = data.additionalLogo ? frame.width : 850;
        const bannerHeight = bannerWidth * 240 / 850;
        ctx.drawImage(img, 490 * scaleX, 1640 * scaleY, 850 * scaleX, 240 * scaleY,
          frame.x + (frame.width - bannerWidth) / 2, FOOTER.top + (FOOTER.height - bannerHeight) / 2, bannerWidth, bannerHeight); return;
      }
    }
    ctx.save();
    const footerScale = data.additionalLogo ? frame.width / CONTENT.width : 1;
    ctx.translate(frame.x + (data.additionalLogo ? 0 : 25), FOOTER.top + FOOTER.height * (1 - footerScale) / 2);
    ctx.scale(footerScale, footerScale);
    ctx.translate(-CONTENT.left, -1640);
    drawFallbackFooter(ctx, data, accent);
    ctx.restore();
  }
  async function drawAdditionalLogo(ctx, data) {
    const frame = footerFrames(data).logo;
    if (!frame) return;
    const img = await loadImage(data.additionalLogo);
    if (img) containInFooter(ctx, img, frame);
  }
  async function render(canvas, data = {}) {
    if (!canvas || typeof canvas.getContext !== 'function') throw new Error('A canvas element is required.');
    if (document.fonts && document.fonts.load) {
      await Promise.all([
        document.fonts.load('600 35px RankMontserrat'),
        document.fonts.load('700 35px RankMontserrat'),
        document.fonts.load('35px RankStudentBebas'),
        document.fonts.load('232px RankTitleEvagrande')
      ]);
    }
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    canvas.width = WIDTH; canvas.height = HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Your browser could not create the poster canvas.');
    ctx.save();
    try {
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      const accent = safeColor(data.accent);
      drawBackground(ctx, data, accent); drawHeader(ctx, data, accent); drawRanking(ctx, data, accent);
      await drawFooter(ctx, data, accent);
      await drawAdditionalLogo(ctx, data);
    } finally { ctx.restore(); }
    return canvas;
  }
  window.RankPoster = { render, WIDTH, HEIGHT };
})();


