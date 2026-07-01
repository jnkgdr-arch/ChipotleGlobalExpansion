const chartData = {
  imports: {
    title: 'BRI food import value growth',
    type: 'line',
    labels: ['2013', '2015', '2017', '2019', '2021'],
    values: [18.3, 24.8, 31.6, 39.4, 47.9],
    suffix: 'B',
    insight: '<strong>Supply tailwind:</strong> BRI food imports increased from $18.3B to $47.9B, giving Chipotle a stronger sourcing story for China through diversified ingredients, fewer logistics bottlenecks, and pilot-store cost control.'
  },
  fit: {
    title: 'Consumer fit by adaptation lever',
    type: 'bar',
    labels: ['Freshness', 'Health', 'Local flavor', 'Family format', 'QR ordering'],
    values: [88, 84, 92, 89, 81],
    suffix: '%',
    insight: '<strong>Demand signal:</strong> Health and freshness can travel, but local flavor and family-format adaptation drive the strongest China fit.'
  },
  risk: {
    title: 'Market entry risk exposure',
    type: 'bar',
    labels: ['Taste gap', 'Price-value', 'Supply', 'Regulatory', 'Competition'],
    values: [91, 78, 70, 68, 86],
    suffix: '/100',
    insight: '<strong>Risk focus:</strong> Taste mismatch and intense competition are the highest-priority risks to manage before scale-up.'
  }
};

const strategies = {
  localize: {
    name: 'Localize menu',
    values: [94, 82, 78, 86, 88],
    total: 86,
    text: 'Best overall fit. It directly addresses cultural barriers through Sichuan-inspired flavors, family meals, value pricing, and digital convenience while keeping Chipotle’s freshness promise.'
  },
  partner: {
    name: 'Joint venture',
    values: [78, 90, 84, 76, 82],
    total: 82,
    text: 'Strong for speed and risk sharing. A partner can unlock supply chains, digital channels, and trust, but profit sharing and governance complexity reduce strategic control.'
  },
  popup: {
    name: 'Pop-ups + influencers',
    values: [82, 74, 64, 92, 70],
    total: 76,
    text: 'Excellent for learning and buzz. Pop-ups create fast feedback with young urban consumers, but limited reach makes this a test vehicle rather than the main entry model.'
  }
};

const mainCanvas = document.getElementById('mainChart');
const strategyCanvas = document.getElementById('strategyChart');
const chartInsight = document.getElementById('chartInsight');
const scoreCopy = document.getElementById('scoreCopy');
const mainCtx = mainCanvas ? mainCanvas.getContext('2d') : null;
const strategyCtx = strategyCanvas ? strategyCanvas.getContext('2d') : null;

let mainProgress = 0;
let strategyProgress = 0;
let currentChart = 'imports';
let currentStrategy = 'localize';

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function clear(ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawAxes(ctx, width, height, pad) {
  ctx.strokeStyle = 'rgba(69,20,0,.18)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad, pad);
  ctx.lineTo(pad, height - pad);
  ctx.lineTo(width - pad, height - pad);
  ctx.stroke();
}

function drawMainChart(progress = 1) {
  if (!mainCtx || !mainCanvas) return;

  const data = chartData[currentChart];
  const { width, height } = mainCanvas;
  const pad = 64;

  clear(mainCtx, mainCanvas);
  drawAxes(mainCtx, width, height, pad);

  mainCtx.fillStyle = cssVar('--chipotle-brown');
  mainCtx.font = '800 25px Inter, sans-serif';
  mainCtx.textAlign = 'left';
  mainCtx.fillText(data.title, pad, 38);

  const max = Math.max(...data.values) * 1.18;
  const chartHeight = height - pad * 2.1;
  const gap = (width - pad * 2) / (data.labels.length - 1 || data.labels.length);

  if (data.type === 'line') {
    const points = data.values.map((value, index) => ({
      x: pad + index * gap,
      y: height - pad - (value / max) * chartHeight * progress,
      value
    }));

    const gradient = mainCtx.createLinearGradient(0, pad, 0, height - pad);
    gradient.addColorStop(0, 'rgba(0,255,133,.36)');
    gradient.addColorStop(1, 'rgba(0,255,133,0)');

    mainCtx.beginPath();
    mainCtx.moveTo(points[0].x, height - pad);
    points.forEach(point => mainCtx.lineTo(point.x, point.y));
    mainCtx.lineTo(points[points.length - 1].x, height - pad);
    mainCtx.closePath();
    mainCtx.fillStyle = gradient;
    mainCtx.fill();

    mainCtx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) mainCtx.moveTo(point.x, point.y);
      else mainCtx.lineTo(point.x, point.y);
    });
    mainCtx.strokeStyle = cssVar('--jade');
    mainCtx.lineWidth = 5;
    mainCtx.lineCap = 'round';
    mainCtx.stroke();

    points.forEach((point, index) => {
      mainCtx.fillStyle = '#fff7e7';
      mainCtx.strokeStyle = cssVar('--chipotle-red');
      mainCtx.lineWidth = 4;
      mainCtx.beginPath();
      mainCtx.arc(point.x, point.y, 8, 0, Math.PI * 2);
      mainCtx.fill();
      mainCtx.stroke();
      labelPoint(point.x, point.y - 18, `$${point.value}${data.suffix}`);
      labelAxis(point.x - 16, height - 24, data.labels[index]);
    });
  } else {
    const barGap = 22;
    const barWidth = (width - pad * 2 - barGap * (data.values.length - 1)) / data.values.length;

    data.values.forEach((value, index) => {
      const x = pad + index * (barWidth + barGap);
      const barHeight = (value / max) * chartHeight * progress;
      const y = height - pad - barHeight;
      const gradient = mainCtx.createLinearGradient(0, y, 0, height - pad);
      gradient.addColorStop(0, currentChart === 'risk' ? '#126dff' : cssVar('--jade'));
      gradient.addColorStop(1, currentChart === 'risk' ? cssVar('--gold') : cssVar('--gold'));
      roundRect(mainCtx, x, y, barWidth, barHeight, 14, gradient);
      labelPoint(x + barWidth / 2, y - 14, `${value}${data.suffix}`);
      labelAxis(x + 4, height - 26, data.labels[index], barWidth - 8);
    });
  }

  if (chartInsight) chartInsight.innerHTML = data.insight;
}

function labelPoint(x, y, text) {
  mainCtx.fillStyle = cssVar('--chipotle-brown');
  mainCtx.font = '800 18px Inter, sans-serif';
  mainCtx.textAlign = 'center';
  mainCtx.fillText(text, x, y);
}

function labelAxis(x, y, text, maxWidth = 95) {
  mainCtx.fillStyle = 'rgba(35,17,13,.72)';
  mainCtx.font = '700 15px Inter, sans-serif';
  mainCtx.textAlign = 'left';

  const words = text.split(' ');
  if (words.length > 1) {
    words.forEach((word, index) => mainCtx.fillText(word, x, y + index * 16, maxWidth));
  } else {
    mainCtx.fillText(text, x, y, maxWidth);
  }
}

function roundRect(ctx, x, y, width, height, radius, fillStyle) {
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.fill();
}

function animateMain() {
  mainProgress = 0;

  const step = () => {
    mainProgress = Math.min(1, mainProgress + 0.045);
    drawMainChart(easeOutCubic(mainProgress));
    if (mainProgress < 1) requestAnimationFrame(step);
  };

  step();
}

function drawStrategyChart(progress = 1) {
  if (!strategyCtx || !strategyCanvas) return;

  const labels = ['Cultural fit', 'Speed', 'Control', 'Buzz', 'Scalability'];
  const strategy = strategies[currentStrategy];
  const { width, height } = strategyCanvas;
  const centerX = width / 2;
  const centerY = height / 2 + 8;
  const radius = 140;

  clear(strategyCtx, strategyCanvas);

  strategyCtx.fillStyle = cssVar('--chipotle-brown');
  strategyCtx.font = '800 23px Inter, sans-serif';
  strategyCtx.textAlign = 'center';
  strategyCtx.fillText(`${strategy.name} scorecard`, centerX, 34);

  for (let ring = 1; ring <= 4; ring += 1) {
    drawPolygon(radius * ring / 4, 'rgba(69,20,0,.12)', false);
  }

  labels.forEach((label, index) => {
    const angle = -Math.PI / 2 + index * (Math.PI * 2 / labels.length);
    strategyCtx.strokeStyle = 'rgba(69,20,0,.14)';
    strategyCtx.beginPath();
    strategyCtx.moveTo(centerX, centerY);
    strategyCtx.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
    strategyCtx.stroke();
    strategyCtx.fillStyle = '#fff200';
    strategyCtx.font = '900 14px Inter, sans-serif';
    strategyCtx.fillText(label, centerX + Math.cos(angle) * (radius + 48), centerY + Math.sin(angle) * (radius + 32));
  });

  strategyCtx.beginPath();
  strategy.values.forEach((value, index) => {
    const angle = -Math.PI / 2 + index * (Math.PI * 2 / strategy.values.length);
    const r = radius * (value / 100) * progress;
    const x = centerX + Math.cos(angle) * r;
    const y = centerY + Math.sin(angle) * r;
    if (index === 0) strategyCtx.moveTo(x, y);
    else strategyCtx.lineTo(x, y);
  });
  strategyCtx.closePath();
  strategyCtx.fillStyle = 'rgba(0,255,133,.28)';
  strategyCtx.strokeStyle = cssVar('--jade');
  strategyCtx.lineWidth = 4;
  strategyCtx.fill();
  strategyCtx.stroke();

  strategy.values.forEach((value, index) => {
    const angle = -Math.PI / 2 + index * (Math.PI * 2 / strategy.values.length);
    const r = radius * (value / 100) * progress;
    const x = centerX + Math.cos(angle) * r;
    const y = centerY + Math.sin(angle) * r;
    strategyCtx.fillStyle = cssVar('--chipotle-red');
    strategyCtx.beginPath();
    strategyCtx.arc(x, y, 5, 0, Math.PI * 2);
    strategyCtx.fill();
  });

  if (scoreCopy) scoreCopy.innerHTML = `<strong>${strategy.total}/100 weighted score.</strong> ${strategy.text}`;

  function drawPolygon(r, color, fill) {
    strategyCtx.beginPath();
    for (let i = 0; i < labels.length; i += 1) {
      const angle = -Math.PI / 2 + i * (Math.PI * 2 / labels.length);
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      if (i === 0) strategyCtx.moveTo(x, y);
      else strategyCtx.lineTo(x, y);
    }
    strategyCtx.closePath();
    strategyCtx.strokeStyle = color;
    strategyCtx.stroke();
    if (fill) strategyCtx.fill();
  }
}

function animateStrategy() {
  strategyProgress = 0;

  const step = () => {
    strategyProgress = Math.min(1, strategyProgress + 0.05);
    drawStrategyChart(easeOutCubic(strategyProgress));
    if (strategyProgress < 1) requestAnimationFrame(step);
  };

  step();
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function initInteractions() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(item => {
        item.classList.remove('active');
        item.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      currentChart = tab.dataset.chart;
      animateMain();
    });
  });

  document.querySelectorAll('.strategy-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.strategy-card').forEach(item => item.classList.remove('active'));
      card.classList.add('active');
      currentStrategy = card.dataset.strategy;
      animateStrategy();
    });
  });

  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }
}

function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}

function initScoreRing() {
  const ring = document.querySelector('.ring-progress');
  const scoreElement = document.querySelector('.score-ring');

  if (!ring || !scoreElement) return;

  const score = Number(scoreElement.dataset.score);
  const circumference = 2 * Math.PI * 52;
  ring.style.strokeDasharray = circumference;

  setTimeout(() => {
    ring.style.strokeDashoffset = circumference * (1 - score / 100);
  }, 450);
}

window.addEventListener('load', () => {
  initInteractions();
  initReveal();
  initScoreRing();
  animateMain();
  animateStrategy();
});
