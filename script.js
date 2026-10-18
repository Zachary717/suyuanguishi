let isGlitchMode = false;
let currentActiveId = "";

window.onload = function() {
  const poem = "此恨何时已。滴空阶、寒更雨歇，葬花天气。三载悠悠魂梦杳，是梦久应醒矣。料也觉、人间无味。不及夜台尘土隔，清冷冷、一片埋愁地。钗钿约，竟抛弃。重泉若有双鱼寄。好知他、年来苦乐，与谁相倚。我自中宵成转侧，忍听湘弦重理。待结个、他生知己。还怕两人俱薄命，再缘悭、剩月零风里。清泪尽，纸灰起。";
  let html = '';
  for(let i=0; i<20; i++) html += `<div class="matrix-col">${poem}</div>`;
  document.getElementById('glitch-matrix').innerHTML = html;

  const list = document.getElementById('dir-list');
  if (typeof ocDatabase === 'undefined') {
    list.innerHTML = `<div style="color: red; font-weight: bold; padding: 20px;">❌ data.js 加载失败，请检查格式。</div>`;
    return;
  }
  list.innerHTML = '';
  ocDatabase.forEach((oc, index) => {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.onclick = function() { showProfile(oc.id); };
    const num = String(index + 1).padStart(2, '0');
    item.innerHTML = `<div class="item-left"><span class="item-index">${num}</span><span class="item-name">${oc.name}</span></div><div class="item-title">${oc.title}</div>`;
    list.appendChild(item);
  });
};

function switchView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(viewId).classList.add('active');
  window.scrollTo(0, 0);
  if (viewId === 'view-main') {
    document.body.classList.remove('glitch-mode');
    isGlitchMode = false;
  }
}

function toggleGlitch() {
  isGlitchMode = !isGlitchMode;
  document.body.classList.toggle('glitch-mode', isGlitchMode);
  const container = document.getElementById('glitch-matrix');
  container.style.animation = 'none';
  container.offsetHeight; 
  container.style.animation = null;
  showProfile(currentActiveId, true);
}

function renderRadarChart(stats) {
  const cx = 150, cy = 140, r = 90, maxVal = 6; 
  const keys = Object.keys(stats), n = keys.length;
  let svg = `<svg viewBox="0 0 300 280" style="width:100%; max-width:350px; overflow:visible;">`;
  for (let level = 1; level <= maxVal; level++) {
    let points = [];
    for (let i = 0; i < n; i++) {
      let angle = (Math.PI * 2 / n) * i - Math.PI / 2;
      let cr = (r * level) / maxVal;
      points.push(`${cx + cr * Math.cos(angle)},${cy + cr * Math.sin(angle)}`);
    }
    let strokeColor = level === maxVal ? (isGlitchMode ? "rgba(232,226,214,0.3)" : "rgba(26,26,26,0.2)") : (isGlitchMode ? "rgba(232,226,214,0.1)" : "rgba(26,26,26,0.05)");
    svg += `<polygon points="${points.join(' ')}" fill="none" stroke="${strokeColor}" stroke-width="1" stroke-dasharray="${level === maxVal ? '0' : '2 2'}" />`;
  }
  for (let i = 0; i < n; i++) {
    let angle = (Math.PI * 2 / n) * i - Math.PI / 2;
    svg += `<line x1="${cx}" y1="${cy}" x2="${cx + r * Math.cos(angle)}" y2="${cy + r * Math.sin(angle)}" stroke="${isGlitchMode ? 'rgba(232,226,214,0.15)' : 'rgba(26,26,26,0.08)'}" stroke-width="1" />`;
  }
  let dataPoints = [];
  for (let i = 0; i < n; i++) {
    let cr = (r * stats[keys[i]]) / maxVal;
    let angle = (Math.PI * 2 / n) * i - Math.PI / 2;
    dataPoints.push(`${cx + cr * Math.cos(angle)},${cy + cr * Math.sin(angle)}`);
  }
  svg += `<polygon points="${dataPoints.join(' ')}" fill="${isGlitchMode ? 'rgba(204,51,68,0.15)' : 'rgba(74,98,85,0.1)'}" stroke="${isGlitchMode ? '#cc3344' : '#4a6255'}" stroke-width="1.5" stroke-linejoin="round" />`;
  for (let i = 0; i < n; i++) {
    let key = keys[i], cr = (r * stats[key]) / maxVal;
    let angle = (Math.PI * 2 / n) * i - Math.PI / 2;
    let x = cx + cr * Math.cos(angle), y = cy + cr * Math.sin(angle);
    svg += `<circle cx="${x}" cy="${y}" r="2.5" fill="${isGlitchMode ? '#090a0c' : '#f7f6f1'}" stroke="${isGlitchMode ? '#cc3344' : '#b84040'}" stroke-width="1.5" />`;
    let lx = cx + (r + 25) * Math.cos(angle), ly = cy + (r + 25) * Math.sin(angle);
    let textAnchor = Math.cos(angle) > 0.1 ? "start" : (Math.cos(angle) < -0.1 ? "end" : "middle");
    svg += `<text x="${lx}" y="${ly}" fill="${isGlitchMode ? '#e8e2d6' : '#1a1a1a'}" font-size="13" font-family="Noto Serif SC" font-weight="600" text-anchor="${textAnchor}" dominant-baseline="middle">${key}</text>`;
    svg += `<text x="${lx}" y="${ly + 16}" fill="${isGlitchMode ? '#6a7a73' : '#888'}" font-size="11" font-family="Oswald" text-anchor="${textAnchor}" dominant-baseline="middle">${stats[key]} / 6</text>`;
  }
  document.getElementById('p-stats').innerHTML = svg + `</svg>`;
}

function showProfile(id, isToggle = false) {
  if (!isToggle) {
    currentActiveId = id;
    document.body.classList.remove('glitch-mode');
    isGlitchMode = false;
  }
  const oc = ocDatabase.find(o => o.id === id);
  if(!oc) return;

  const avatarBox = document.getElementById('p-avatar-box');
  if (oc.avatar) {
    avatarBox.innerHTML = `<img src="${oc.avatar}" alt="${oc.name}">`;
    avatarBox.querySelector('img').onerror = function() { this.style.display='none'; avatarBox.innerHTML = `<div class="empty-text">NO IMAGE</div>`; };
  } else { avatarBox.innerHTML = `<div class="empty-text">NO IMAGE</div>`; }

  const infoList = document.getElementById('p-info-list');
  const timelineBox = document.getElementById('p-timeline');
  const relationsBox = document.getElementById('p-relations');
  infoList.innerHTML = ''; timelineBox.innerHTML = ''; relationsBox.innerHTML = '';

  let statsToRender = oc.stats;

  if (id === 'yeyao' && isGlitchMode) {
    document.getElementById('glitch-btn').style.display = 'block';
    document.getElementById('p-name').textContent = "叶 瑶 ？";
    document.getElementById('p-title').textContent = "是我做错了吗?";
    if (oc.mutated_stats) statsToRender = oc.mutated_stats;

    (oc.mutated_basic || []).forEach(b => { infoList.innerHTML += `<div class="info-item"><span class="k" style="color:var(--red)">${b.k}</span><span class="v">${b.v}</span></div>`; });
    (oc.mutated_timeline || []).forEach(item => { timelineBox.innerHTML += `<div class="tl-item"><div class="tl-time" style="color:var(--red)">${item.time}</div><div class="tl-event">${item.event}</div></div>`; });
    
    (oc.mutated_relations || []).forEach(rel => { 
      let descHtml = rel.desc;
      if (rel.desc.includes("我爱你")) descHtml = `<span style="color: var(--red);">${rel.desc}</span>`;
      relationsBox.innerHTML += `<div class="rel-item"><div class="rel-name">${rel.name}</div><div class="rel-desc">${descHtml}</div></div>`; 
    });
    
  } else {
    document.getElementById('glitch-btn').style.display = (id === 'yeyao') ? 'block' : 'none';
    document.getElementById('p-name').textContent = oc.name;
    document.getElementById('p-title').textContent = oc.title;
    oc.basic.forEach(b => { infoList.innerHTML += `<div class="info-item"><span class="k">${b.k}</span><span class="v">${b.v}</span></div>`; });
    oc.timeline.forEach(item => { timelineBox.innerHTML += `<div class="tl-item"><div class="tl-time">${item.time}</div><div class="tl-event">${item.event}</div></div>`; });
    if (oc.relations) {
      oc.relations.forEach(rel => {
        const hasLink = ocDatabase.find(o => o.id === rel.id) && rel.id !== '';
        relationsBox.innerHTML += `<div class="rel-item ${hasLink ? 'has-link' : ''}" ${hasLink ? `onclick="showProfile('${rel.id}')"` : ''}><div class="rel-name">${rel.name}</div><div class="rel-desc">${rel.desc}</div></div>`;
      });
    }
  }
  document.getElementById('p-top-id').textContent = isGlitchMode ? "ERROR: UNKNOWN" : `ID: ${oc.id.toUpperCase()}`;
  renderRadarChart(statsToRender);
  
  if (!isToggle) switchView('view-profile');
  else window.scrollTo(0, 0);
}
