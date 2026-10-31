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
    html += `<div class="list-item reveal" onclick="showProfile('${oc.id}')"><div class="item-index">${num}</div><div class="item-name">${oc.name}</div><div class="item-title">${oc.title}</div></div>`;
  }
  list.innerHTML = html;
  
  setupObserver();
  setTimeout(() => document.querySelectorAll('.reveal').forEach(el => el.classList.add('active')), 100);

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

  // 【门票彩蛋】点击滑出/收回逻辑
  const ticketEgg = document.getElementById('ticket-egg');
  if (ticketEgg) {
    ticketEgg.addEventListener('click', function(e) {
      this.classList.toggle('show');
    });
  }
};

let isGlitchMode = false;
let currentActiveId = "";
let observer;

function setupObserver() {
  const observerOptions = { root: null, rootMargin: '0px 0px -50px 0px', threshold: 0.1 };
  observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        if (entry.target.id === 'p-stats') {
          const radarData = entry.target.querySelector('.radar-anim-group');
          const radarText = entry.target.querySelector('.radar-text');
          if (radarData) animateRadarLines(radarData, radarText);
        }
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);
}

function switchView(viewId) {
  document.querySelectorAll('.view').forEach(v => {
    v.classList.remove('active');
    v.style.display = 'none';
  });
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

  // 控制门票彩蛋显示：仅婴红显示
  const ticketEgg = document.getElementById('ticket-egg');
  if (ticketEgg) {
    if (id === 'yinghong') {
      ticketEgg.style.display = 'block';
    } else {
      ticketEgg.style.display = 'none';
      ticketEgg.classList.remove('show'); // 切换角色时重置门票状态
    }
  }

  const avatarBox = document.getElementById('p-avatar-box');
  let currentAvatar = (isGlitchMode && oc.mutated_avatar) ? oc.mutated_avatar : oc.avatar;
  avatarBox.innerHTML = currentAvatar ? `<img src="${currentAvatar}">` : '无图';

  let statsToRender = oc.stats;

  if (id === 'yeyao' && isGlitchMode) {
    document.getElementById('glitch-btn').style.display = 'block';
    if (oc.mutated_stats) statsToRender = oc.mutated_stats;
    document.getElementById('p-name').textContent = "叶 瑶 ？";
    document.getElementById('p-title').textContent = "是我做错了吗?";
    document.getElementById('p-info-list').innerHTML = oc.mutated_basic.map((b, i)=>`<div class="info-item delay-item" style="transition-delay:${i*0.1}s"><div class="k">${b.k}</div><div class="v">${b.v}</div></div>`).join('');
    document.getElementById('p-timeline').innerHTML = oc.mutated_timeline.map((t, i)=>`<div class="tl-item delay-item" style="transition-delay:${i*0.1}s"><div class="tl-time">${t.time}</div><div class="tl-event">${t.event}</div></div>`).join('');
    document.getElementById('p-relations').innerHTML = oc.mutated_relations.map((r, i)=>`<div class="rel-item delay-item" style="transition-delay:${i*0.1}s"><div class="rel-name">${r.name}</div><div class="rel-desc" style="color:red;">${r.desc}</div></div>`).join('');
  } else {
    document.getElementById('glitch-btn').style.display = (id === 'yeyao') ? 'block' : 'none';
    document.getElementById('p-name').textContent = oc.name;
    document.getElementById('p-title').textContent = oc.title;
    
    document.getElementById('p-info-list').innerHTML = oc.basic.map((b, i)=>`<div class="info-item delay-item" style="transition-delay:${i*0.1}s"><div class="k">${b.k}</div><div class="v">${b.v}</div></div>`).join('');
    document.getElementById('p-timeline').innerHTML = oc.timeline.map((t, i)=>`<div class="tl-item delay-item" style="transition-delay:${i*0.1}s"><div class="tl-time">${t.time}</div><div class="tl-event">${t.event}</div></div>`).join('');
    
    // 【修复】人际羁绊：判断是否具有连接，并绑定 onclick 跳转
    document.getElementById('p-relations').innerHTML = oc.relations.map((r, i)=>{
      const hasLink = ocDatabase.find(o => o.id === r.id) && r.id !== '';
      return `<div class="rel-item delay-item ${hasLink ? 'has-link' : ''}" style="transition-delay:${i*0.1}s" ${hasLink ? `onclick="showProfile('${r.id}')"` : ''}>
                <div class="rel-name">${r.name}</div>
                <div class="rel-desc">${r.desc}</div>
              </div>`;
    }).join('');
  }
  
  document.getElementById('p-top-id').textContent = isGlitchMode ? "ERROR: UNKNOWN" : `ID: ${oc.id.toUpperCase()}`;
  renderRadarChart(statsToRender);
  
  if (isToggle !== true) switchView('view-profile');
  else window.scrollTo(0, 0);
  
  const radarContainer = document.getElementById('p-stats');
  radarContainer.classList.remove('active');
  document.querySelectorAll('.delay-item').forEach(el => el.classList.remove('active'));
  const textGroup = radarContainer.querySelector('.radar-text');
  if (textGroup) textGroup.classList.remove('show');
  void radarContainer.offsetWidth; 

  setTimeout(() => {
    observer.observe(radarContainer);
    document.querySelectorAll('.delay-item').forEach(el => observer.observe(el));
  }, 100);
}

function animateRadarLines(group, textGroup) {
  const circles = group.querySelectorAll('circle');
  const poly = group.querySelector('polygon');
  const targets = [];
  const cx = 150, cy = 140;
  group.style.opacity = 0;
  circles.forEach(c => {
    const tx = parseFloat(c.getAttribute('data-tx'));
    const ty = parseFloat(c.getAttribute('data-ty'));
    const distance = Math.hypot(tx - cx, ty - cy);
    targets.push({ el: c, tx, ty, distance });
  });
  const speed = Math.hypot(90, 0) / 800; 
  const startTime = performance.now();
  circles.forEach(c => { c.setAttribute('cx', cx); c.setAttribute('cy', cy); });
  poly.setAttribute('points', `${cx},${cy} ${cx},${cy} ${cx},${cy} ${cx},${cy} ${cx},${cy} ${cx},${cy}`);
  group.style.opacity = 1;
  function update(now) {
    const elapsed = now - startTime;
    let currentPoints = [];
    let allFinished = true;
    targets.forEach(t => {
      let progress = Math.min(elapsed / (t.distance / speed), 1);
      if (progress < 1) allFinished = false; 
      let currentX = cx + (t.tx - cx) * progress;
      let currentY = cy + (t.ty - cy) * progress;
      t.el.setAttribute('cx', currentX);
      t.el.setAttribute('cy', currentY);
      currentPoints.push(`${currentX},${currentY}`);
    });
    poly.setAttribute('points', currentPoints.join(' '));
    if (!allFinished) requestAnimationFrame(update);
    else textGroup.classList.add('show');
  }
  requestAnimationFrame(update);
}

function renderRadarChart(stats) {
  const cx = 150, cy = 140, r = 90, maxVal = 6; 
  const keys = Object.keys(stats), n = keys.length;
  let svg = '<svg viewBox="0 0 300 280" style="width:100%; max-width:300px; overflow:visible;">';
  
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
  let circleTags = '';
  for (let i = 0; i < n; i++) {
    let cr = (r * stats[keys[i]]) / maxVal;
    let angle = (Math.PI * 2 / n) * i - Math.PI / 2;
    let x = cx + cr * Math.cos(angle), y = cy + cr * Math.sin(angle);
    dataPoints.push(x + ',' + y);
    circleTags += '<circle data-tx="' + x + '" data-ty="' + y + '" cx="' + x + '" cy="' + y + '" r="2.5" fill="' + (isGlitchMode ? '#090a0c' : '#F1F0E8') + '" stroke="' + (isGlitchMode ? '#cc3344' : '#B56A58') + '" stroke-width="1.5" />';
  }
  
  svg += '<g class="radar-anim-group" style="opacity: 0;">';
  svg += '<polygon points="' + dataPoints.join(' ') + '" fill="' + (isGlitchMode ? 'rgba(204,51,68,0.15)' : 'rgba(181,106,88,0.1)') + '" stroke="' + (isGlitchMode ? '#cc3344' : '#B56A58') + '" stroke-width="1.5" stroke-linejoin="round" />';
  svg += circleTags;
  svg += '</g>';
  
  svg += '<g class="radar-text">';
  for (let i = 0; i < n; i++) {
    let key = keys[i], cr = (r * stats[key]) / maxVal;
    let angle = (Math.PI * 2 / n) * i - Math.PI / 2;
    let lx = cx + (r + 20) * Math.cos(angle), ly = cy + (r + 20) * Math.sin(angle);
    let textAnchor = Math.cos(angle) > 0.1 ? "start" : (Math.cos(angle) < -0.1 ? "end" : "middle");
    svg += '<text x="' + lx + '" y="' + ly + '" fill="' + (isGlitchMode ? '#e8e2d6' : '#2E3A35') + '" font-size="12" font-family="Noto Serif SC" font-weight="600" text-anchor="' + textAnchor + '" dominant-baseline="middle">' + key + '</text>';
    svg += '<text x="' + lx + '" y="' + (ly + 16) + '" fill="' + (isGlitchMode ? '#6a7a73' : '#5E8C87') + '" font-size="11" font-family="Oswald" text-anchor="' + textAnchor + '" dominant-baseline="middle">' + stats[key] + ' / 6</text>';
  }
  svg += '</g>';
  
  document.getElementById('p-stats').innerHTML = svg + '</svg>';
}
