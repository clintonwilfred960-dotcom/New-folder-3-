/* ===== Load the text from Flask ===== */
let CONFIG = { name: "", from: "", letter: "", reasons: [] };

fetch("/api/config")
  .then(r => r.json())
  .then(data => {
    CONFIG = data;
    setup();
  });

/* ===== Shortcuts ===== */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const rnd = (a, b) => a + Math.random() * (b - a);
const wait = ms => new Promise(r => setTimeout(r, ms));

/* ===== Canvas for fireworks and confetti ===== */
const fx = $('#fx');
const c = fx.getContext('2d');
let W, H;
let P = [];

function size() {
  const d = devicePixelRatio || 1;
  W = innerWidth;
  H = innerHeight;
  fx.width = W * d;
  fx.height = H * d;
  c.setTransform(d, 0, 0, d, 0, 0);
}
addEventListener('resize', size);
size();

function burst(x, y, n = 80) {
  const h = rnd(0, 360);
  for (let i = 0; i < n; i++) {
    const a = Math.PI * 2 * i / n;
    const s = rnd(1.5, 6);
    P.push({
      t: 's', x, y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      l: 1,
      c: `hsl(${h + rnd(-30, 30)}, 100%, 65%)`
    });
  }
}

function confetti(n = 150) {
  for (let i = 0; i < n; i++) {
    P.push({
      t: 'c',
      x: rnd(0, W),
      y: rnd(-H * .5, 0),
      vx: rnd(-1, 1),
      vy: rnd(2, 5),
      r: rnd(0, 6),
      vr: rnd(-.2, .2),
      l: 1,
      c: `hsl(${rnd(0, 360)}, 90%, 65%)`
    });
  }
}

function loop() {
  c.globalCompositeOperation = 'destination-out';
  c.fillStyle = 'rgba(0,0,0,.2)';
  c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'lighter';

  P = P.filter(p => p.l > 0);

  for (const p of P) {
    p.x += p.vx;
    p.y += p.vy;

    if (p.t === 's') {
      p.vy += .06;
      p.vx *= .985;
      p.l -= .012;
      c.globalAlpha = Math.max(p.l, 0);
      c.fillStyle = p.c;
      c.fillRect(p.x, p.y, 3, 3);
    } else {
      p.r += p.vr;
      if (p.y > H) p.l = 0;
      c.globalAlpha = 1;
      c.save();
      c.translate(p.x, p.y);
      c.rotate(p.r);
      c.fillStyle = p.c;
      c.fillRect(-4, -2, 8, 4);
      c.restore();
    }
  }
  requestAnimationFrame(loop);
}
loop();

function volley(n) {
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      burst(rnd(W * .1, W * .9), rnd(H * .1, H * .5), rnd(50, 110));
    }, i * 350);
  }
}

function balloons(n) {
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      const b = document.createElement('div');
      b.className = 'balloon';
      b.style.cssText = `left:${rnd(2, 90)}%; background:hsl(${rnd(0, 360)},85%,62%); --d:${rnd(7, 12)}s; --s:${rnd(.8, 1.3)}`;
      b.onclick = () => {
        const r = b.getBoundingClientRect();
        burst(r.x + 27, r.y + 33, 30);
        b.remove();
      };
      b.onanimationend = () => b.remove();
      document.body.append(b);
    }, i * 350);
  }
}

/* ===== Music ===== */
let ac;

function play() {
  try {
    let t = ac.currentTime + .1;
    const song = "392:.75 392:.25 440:1 392:1 523:1 494:2 392:.75 392:.25 440:1 392:1 587:1 523:2 392:.75 392:.25 784:1 659:1 523:1 494:1 440:1 698:.75 698:.25 659:1 523:1 587:1 523:2";

    song.split(' ').forEach(n => {
      const [f, d] = n.split(':').map(Number);
      const o = ac.createOscillator();
      const g = ac.createGain();
      const L = d * .5;

      o.type = 'triangle';
      o.frequency.value = f;
      o.connect(g);
      g.connect(ac.destination);
      g.gain.setValueAtTime(.0001, t);
      g.gain.exponentialRampToValueAtTime(.25, t + .03);
      g.gain.exponentialRampToValueAtTime(.0001, t + L - .02);
      o.start(t);
      o.stop(t + L);
      t += L;
    });
  } catch (e) {}
}

/* ===== Scenes ===== */
const show = id => $$('.scene').forEach(s => s.classList.toggle('on', s.id === id));
let tick;

$('#candles').innerHTML = [100, 125, 150, 175, 200].map(x =>
  `<rect x="${x - 4}" y="82" width="8" height="30" rx="2" fill="#fff3df"/>
   <g class="flame" transform="translate(${x},0)">
     <circle cy="66" r="20" fill="transparent"/>
     <ellipse class="fl" cy="68" rx="6" ry="11" fill="#ffd27a"/>
     <ellipse cy="73" rx="3" ry="6" fill="#ff8a4c"/>
   </g>`
).join('');

function setup() {
  $('#cakeHead').textContent = 'Make a wish, ' + CONFIG.name + '.';
  $('#cards').innerHTML = CONFIG.reasons.map(r =>
    `<button class="card"><span class="f">${r[0]}</span><span class="b">${r[1]}</span></button>`
  ).join('');
  $$('.card').forEach(k => k.onclick = () => k.classList.toggle('flip'));
}

$('#open').onclick = async () => {
  try {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    ac.resume();
  } catch (e) {}

  show('s1');
  const n = $('#num');
  for (const v of [3, 2, 1]) {
    n.textContent = v;
    n.classList.remove('pop');
    void n.offsetWidth;
    n.classList.add('pop');
    await wait(950);
  }
  show('s2');
};

$$('.flame').forEach(f => f.onclick = async () => {
  f.classList.add('out');
  const x = +f.getAttribute('transform').match(/\d+/)[0] / 300 * Math.min(W, 360) + W / 2 - Math.min(W, 360) / 2;
  burst(x, H * .4, 12);

  if ($$('.flame:not(.out)').length) return;

  const cake = $('#cake');
  $('#hint').textContent = '';
  cake.style.filter = 'brightness(.25)';
  await wait(1500);
  cake.style.filter = '';
  $('#cakeHead').textContent = 'Happy birthday, ' + CONFIG.name + '!';
  volley(14);
  confetti();
  balloons(16);
  play();
  await wait(9000);
  show('s3');
  typeLetter();
});

async function typeLetter() {
  $('#lh').textContent = 'Dear ' + CONFIG.name + ',';
  const el = $('#letter');
  el.textContent = '';
  for (const ch of CONFIG.letter) {
    el.textContent += ch;
    await wait(ch === '.' || ch === ',' ? 220 : 32);
  }
  $('#n3').hidden = false;
}

$('#n3').onclick = () => show('s4');

$('#n4').onclick = () => {
  show('s5');
  $('#fin').textContent = 'Happy Birthday, ' + CONFIG.name + '!';
  $('#sig').textContent = 'With love, ' + CONFIG.from;
  confetti(200);
  balloons(10);
  clearInterval(tick);
  tick = setInterval(() => burst(rnd(W * .1, W * .9), rnd(H * .1, H * .55), rnd(60, 120)), 700);
};

$('#again').onclick = () => {
  clearInterval(tick);
  location.reload();
};
