window.onload = function() {
  const list = document.getElementById('dir-list');
  if (typeof ocDatabase === 'undefined') {
    list.innerHTML = '<div style="color:red; text-align:center;">❌ data.js 读取失败！</div>';
    return;
  }
  let html = '';
  for(let i=0; i<ocDatabase.length; i++) {
    let oc = ocDatabase[i];
    let num = (i + 1).toString().padStart(2, '0');
    html += `<div class="list-item" onclick="showProfile('${oc.id}')"><div class="item-index">${num}</div><div class="item-name">${oc.name}</div><div class="item-title">${oc.title}</div></div>`;
  }
  list.innerHTML = html;

  const btn = document.getElementById('glitch-btn');
  if (btn) {
    const warning = document.createElement('div');
    warning.className = 'epilepsy-warning';
    warning.innerHTML = '光敏性癫痫患者请勿点击';
    btn.parentNode.insertBefore(warning, btn);
    const observerBtn = new MutationObserver(() => {
      warning.style.display = (btn.style.display === 'block') ? 'block' : 'none';
    });
    observerBtn.observe(btn, { attributes: true, attributeFilter: ['style'] });
  }
};

let isGlitchMode = false;
let currentActiveId = "";

// 强制控制页面的显示与隐藏
function switchView(viewId) {
  // 1. 把所有页面全部隐藏
  document.querySelectorAll('.view').forEach(v => {
    v.classList.remove('active');
    v.style.display = 'none';
  });
  // 2. 把目标页面显示出来
  let target = document.getElementById(viewId);
  target.classList.add('active');
  target.style.display = 'block';
  
  window.scrollTo(0, 0);

  if (viewId === 'view-main') {
    document.body.classList.remove('glitch-mode');
    isGlitchMode = false;
    document.getElementById('glitch-matrix').innerHTML = '';
  }
}

function toggleGlitch() {
  isGlitchMode = !isGlitchMode;
  document.body.classList.toggle('glitch-mode', isGlitchMode);
  document.getElementById('glitch-matrix').innerHTML = '';
  if (isGlitchMode) {
    showProfile(currentActiveId, true); 
    let container = document.getElementById('glitch-matrix');
    container.innerHTML = `<div class="glitch-text-box">此恨何时已。滴空阶、寒更雨歇，葬花天气。<br><br>重泉若有双鱼寄。好知他、年来苦乐，与谁相倚。</div>`;
    setTimeout(() => { container.innerHTML = ''; }, 1200);
  } else {
    showProfile(currentActiveId, true); 
  }
}

function showProfile(id, isToggle) {
  if (isToggle !== true) {
    currentActiveId = id;
    document.body.classList.remove('glitch-mode');
    isGlitchMode = false;
  }
  
  const oc = ocDatabase.find(o => o.id === id);
  if(!oc) return;

  const avatarBox = document.getElementById('p-avatar-box');
  let currentAvatar = (isGlitchMode && oc.mutated_avatar) ? oc.mutated_avatar : oc.avatar;
  avatarBox.innerHTML = currentAvatar ? `<img src="${currentAvatar}">` : '无图';

  let statsToRender = oc.stats;

  if (id === 'yeyao' && isGlitchMode) {
    document.getElementById('glitch-btn').style.display = 'block';
    if (oc.mutated_stats) statsToRender = oc.mutated_stats;
    document.getElementById('p-name').textContent = "叶 瑶 ？";
    document.getElementById('p-title').textContent = "是我做错了吗?";
    document.getElementById('p-info-list').innerHTML = oc.mutated_basic.map(b=>`<div class="info-item"><div class="k">${b.k}</div><div class="v">${b.v}</div></div>`).join('');
    document.getElementById('p-timeline').innerHTML = oc.mutated_timeline.map(t=>`<div class="tl-item"><div class="tl-time">${t.time}</div><div class="tl-event">${t.event}</div></div>`).join('');
    document.getElementById('p-relations').innerHTML = oc.mutated_relations.map(r=>`<div class="rel-item"><div class="rel-name">${r.name}</div><div class="rel-desc" style="color:red;">${r.desc}</div></div>`).join('');
  } else {
    document.getElementById('glitch-btn').style.display = (id === 'yeyao') ? 'block' : 'none';
    document.getElementById('p-name').textContent = oc.name;
    document.getElementById('p-title').textContent = oc.title;
    document.getElementById('p-info-list').innerHTML = oc.basic.map(b=>`<div class="info-item"><div class="k">${b.k}</div><div class="v">${b.v}</div></div>`).join('');
    document.getElementById('p-timeline').innerHTML = oc.timeline.map(t=>`<div class="tl-item"><div class="tl-time">${t.time}</div><div class="tl-event">${t.event}</div></div>`).join('');
    document.getElementById('p-relations').innerHTML = oc.relations.map(r=>`<div class="rel-item"><div class="rel-name">${r.name}</div><div class="rel-desc">${r.desc}</div></div>`).join('');
  }
  
  document.getElementById('p-top-id').textContent = isGlitchMode ? "ERROR: UNKNOWN" : `ID: ${oc.id.toUpperCase()}`;
  renderRadarChart(statsToRender);
  
  // 触发跳转的核心代码
  if (isToggle !== true) {
    switchView('view-profile');
  } else {
    window.scrollTo(0, 0);
  }
}

function renderRadarChart(stats) {
  const cx = 150, cy = 140, r = 90, maxVal = 6; 
  const keys = Object.keys(stats), n = keys.length;
  let svg = '<svg viewBox="0 0 300 280" style="width:100%; max-width:300px;">';
  for (let level = 1; level <= maxVal; level++) {
    let points = [];
    for (let i = 0; i < n; i++) {
      let angle = (Math.PI * 2 / n) * i - Math.PI / 2;
      let cr = (r * level) / maxVal;
      points.push((cx + cr * Math.cos(angle)) + ',' + (cy + cr * Math.sin(angle)));
    }
    let strokeColor = level === maxVal ? (isGlitchMode ? "rgba(232,226,214,0.3)" : "rgba(94,140,135,0.2)") : (isGlitchMode ? "rgba(232,226,214,0.1)" : "rgba(94,140,135,0.05)");
    svg += '<polygon points="' + points.join(' ') + '" fill="none" stroke="' + strokeColor + '" stroke-width="1" stroke-dasharray="' + (level === maxVal ? '0' : '2 2') + '" />';
  }
  for (let i = 0; i < n; i++) {
    let angle = (Math.PI * 2 / n) * i - Math.PI / 2;
    svg += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + r * Math.cos(angle)) + '" y2="' + (cy + r * Math.sin(angle)) + '" stroke="' + (isGlitchMode ? 'rgba(232,226,214,0.15)' : 'rgba(94,140,135,0.1)') + '" stroke-width="1" />';
  }
  let dataPoints = [];
  for (let i = 0; i < n; i++) {
    let cr = (r * stats[keys[i]]) / maxVal;
    let angle = (Math.PI * 2 / n) * i - Math.PI / 2;
    dataPoints.push((cx + cr * Math.cos(angle)) + ',' + (cy + cr * Math.sin(angle)));
  }
  svg += '<polygon points="' + dataPoints.join(' ') + '" fill="' + (isGlitchMode ? 'rgba(204,51,68,0.15)' : 'rgba(181,106,88,0.1)') + '" stroke="' + (isGlitchMode ? '#cc3344' : '#B56A58') + '" stroke-width="1.5" />';
  for (let i = 0; i < n; i++) {
    let key = keys[i], cr = (r * stats[key]) / maxVal;
    let angle = (Math.PI * 2 / n) * i - Math.PI / 2;
    let lx = cx + (r + 20) * Math.cos(angle), ly = cy + (r + 20) * Math.sin(angle);
    let textAnchor = Math.cos(angle) > 0.1 ? "start" : (Math.cos(angle) < -0.1 ? "end" : "middle");
    svg += '<text x="' + lx + '" y="' + ly + '" fill="' + (isGlitchMode ? '#e8e2d6' : '#2E3A35') + '" font-size="12" text-anchor="' + textAnchor + '" dominant-baseline="middle">' + key + ' ' + stats[key] + '</text>';
  }
  svg += '</svg>';
  document.getElementById('p-stats').innerHTML = svg;
}
