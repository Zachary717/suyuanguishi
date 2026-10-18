window.onload = function() {
  const list = document.getElementById('dir-list');
  if (typeof ocDatabase === 'undefined') {
    list.innerHTML = '<div style="color:red; padding:20px;">❌ data.js 读取失败！</div>';
    return;
  }
  let html = '';
  for(let i=0; i<ocDatabase.length; i++) {
    let oc = ocDatabase[i];
    let num = (i + 1).toString().padStart(2, '0');
    html += '<div class="list-item reveal" onclick="showProfile(\'' + oc.id + '\')"><div class="item-left"><span class="item-index">' + num + '</span><span class="item-name">' + oc.name + '</span></div><div class="item-title">' + oc.title + '</div></div>';
  }
  list.innerHTML = html;
  setupObserver();
  setTimeout(() => document.querySelectorAll('.reveal').forEach(el => el.classList.add('active')), 100);
};

let isGlitchMode = false;
let currentActiveId = "";
let observer;
let glitchInterval, glitchTimeout;

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
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(viewId).classList.add('active');
  window.scrollTo(0, 0);
  if (viewId === 'view-main') {
    document.body.classList.remove('glitch-mode');
    isGlitchMode = false;
    clearInterval(glitchInterval);
    clearTimeout(glitchTimeout);
    document.getElementById('glitch-matrix').innerHTML = '';
  }
}

function makeZalgo(text) {
    const up = ['̍', '̎', '̄', '̅', '̿', '̑', '̆', '̐', '͒', '͗', '͑', '̇', '̈', '̊', '͂', '̓', '̈́', '͊', '͋', '͌', '̃', '̂', '̌', '͐', '̀', '́', '̋', '̏', '̒', '̓', '̔', '̽', '̉'];
    const down = ['̖', '̗', '̘', '̙', '̜', '̝', '̞', '̟', '̠', '̤', '̥', '̦', '̩', '̪', '̫', '̬', '̭', '̮', '̯', '̰', '̱', '̲', '̳', '̹', '̺', '̻', '̼', 'ͅ'];
    let result = "";
    for(let i=0; i<text.length; i++) {
        result += text[i];
        for(let j=0; j<Math.floor(Math.random()*3)+2; j++) {
            result += up[Math.floor(Math.random() * up.length)] + down[Math.floor(Math.random() * down.length)];
        }
    }
    return result;
}

// 触发循环特效
function startGlitchLoop() {
  function loop() {
    if (!isGlitchMode) return;
    
    const container = document.getElementById('glitch-matrix');
    let poem = "此恨何时已。滴空阶、寒更雨歇，葬花天气。三载悠悠魂梦杳，是梦久应醒矣。料也觉、人间无味。不及夜台尘土隔，清冷冷、一片埋愁地。钗钿约，竟抛弃。重泉若有双鱼寄。好知他、年来苦乐，与谁相倚。我自中宵成转侧，忍听湘弦重理。待结个、他生知己。还怕两人俱薄命，再缘悭、剩月零风里。清泪尽，纸灰起。";
    
    // 文字重复铺满屏幕
    let fullText = (poem + "<br><br>").repeat(5);
    
    // 1. 插入满屏诗词
    container.innerHTML = `<div class="glitch-text-box" data-text="${fullText.replace(/<br>/g, ' ')}">${fullText}</div>`;
    // 2. 底层文字变乱码
    renderDataUI(true);
    
    // 3. 停留 2 秒后消失并恢复
    clearTimeout(glitchTimeout);
    glitchTimeout = setTimeout(() => {
      if (!isGlitchMode) return;
      container.innerHTML = '';
      renderDataUI(false);
      
      // 4. 等 3 秒后再次循环
      glitchTimeout = setTimeout(loop, 3000);
    }, 2000);
  }
  loop();
}

function toggleGlitch() {
  isGlitchMode = !isGlitchMode;
  document.body.classList.toggle('glitch-mode', isGlitchMode);
  
  clearInterval(glitchInterval);
  clearTimeout(glitchTimeout);
  document.getElementById('glitch-matrix').innerHTML = '';

  if (isGlitchMode) {
    startGlitchLoop();
  } else {
    renderDataUI(false);
  }
}

// 渲染里世界数据，可自由控制是否乱码
function renderDataUI(isZalgo) {
  const oc = ocDatabase.find(o => o.id === currentActiveId);
  if (!oc || currentActiveId !== 'yeyao' || !isGlitchMode) return;

  const infoList = document.getElementById('p-info-list');
  const timelineBox = document.getElementById('p-timeline');
  const relationsBox = document.getElementById('p-relations');
  
  let b_list = '', t_list = '', r_list = '';

  oc.mutated_basic.forEach((b, i) => { 
    let k = isZalgo ? makeZalgo(b.k) : b.k;
    let v = isZalgo ? makeZalgo(b.v) : b.v;
    b_list += `<div class="info-item delay-item active" style="transition-delay:${i*0.1}s"><span class="k" style="color:var(--red)">${k}</span><span class="v">${v}</span></div>`; 
  });
  
  oc.mutated_timeline.forEach((item, i) => { 
    let time = isZalgo ? makeZalgo(item.time) : item.time;
    let event = isZalgo ? makeZalgo(item.event) : item.event;
    t_list += `<div class="tl-item delay-item active" style="transition-delay:${i*0.1}s"><div class="tl-time" style="color:var(--red)">${time}</div><div class="tl-event">${event}</div></div>`; 
  });
  
  oc.mutated_relations.forEach((rel, i) => { 
    let name = isZalgo ? makeZalgo(rel.name) : rel.name;
    let desc = isZalgo ? makeZalgo(rel.desc) : rel.desc;
    // 如果不是乱码状态，且包含我爱你，则变红
    if (!isZalgo && desc.indexOf("我爱你") > -1) {
      desc = `<span style="color: var(--red);">${desc}</span>`;
    }
    r_list += `<div class="rel-item delay-item active" style="transition-delay:${i*0.1}s"><div class="rel-name">${name}</div><div class="rel-desc">${desc}</div></div>`; 
  });

  infoList.innerHTML = b_list;
  timelineBox.innerHTML = t_list;
  relationsBox.innerHTML = r_list;
}

function showProfile(id, isToggle) {
  if (isToggle !== true) {
    currentActiveId = id;
    document.body.classList.remove('glitch-mode');
    isGlitchMode = false;
    clearInterval(glitchInterval);
    clearTimeout(glitchTimeout);
    document.getElementById('glitch-matrix').innerHTML = '';
  }
  const oc = ocDatabase.find(o => o.id === id);
  if(!oc) return;

  const avatarBox = document.getElementById('p-avatar-box');
  let currentAvatar = (isGlitchMode && oc.mutated_avatar) ? oc.mutated_avatar : oc.avatar;
  avatarBox.innerHTML = currentAvatar ? `<img src="${currentAvatar}" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'empty-text\\'>NO IMAGE</div>';">` : '<div class="empty-text">NO IMAGE</div>';

  let statsToRender = oc.stats;

  if (id === 'yeyao' && isGlitchMode) {
    document.getElementById('glitch-btn').style.display = 'block';
    document.getElementById('p-name').textContent = "叶 瑶 ？";
    document.getElementById('p-title').textContent = "是我做错了吗?";
    if (oc.mutated_stats) statsToRender = oc.mutated_stats;
    renderDataUI(false); 
  } else {
    document.getElementById('glitch-btn').style.display = (id === 'yeyao') ? 'block' : 'none';
    document.getElementById('p-name').textContent = oc.name;
    document.getElementById('p-title').textContent = oc.title;
    
    const infoList = document.getElementById('p-info-list');
    const timelineBox = document.getElementById('p-timeline');
    const relationsBox = document.getElementById('p-relations');
    infoList.innerHTML = ''; timelineBox.innerHTML = ''; relationsBox.innerHTML = '';
    
    oc.basic.forEach((b, i) => { infoList.innerHTML += `<div class="info-item delay-item" style="transition-delay:${i*0.1}s"><span class="k">${b.k}</span><span class="v">${b.v}</span></div>`; });
    oc.timeline.forEach((item, i) => { timelineBox.innerHTML += `<div class="tl-item delay-item" style="transition-delay:${i*0.1}s"><div class="tl-time">${item.time}</div><div class="tl-event">${item.event}</div></div>`; });
    oc.relations.forEach((rel, i) => {
      const hasLink = ocDatabase.find(o => o.id === rel.id) && rel.id !== '';
      relationsBox.innerHTML += `<div class="rel-item delay-item ${hasLink ? 'has-link' : ''}" style="transition-delay:${i*0.1}s" ${hasLink ? `onclick="showProfile('${rel.id}')"` : ''}><div class="rel-name">${rel.name}</div><div class="rel-desc">${rel.desc}</div></div>`;
    });
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
  let svg = '<svg viewBox="0 0 300 280" style="width:100%; max-width:350px; overflow:visible;">';
  for (let level = 1; level <= maxVal; level++) {
    let points = [];
    for (let i = 0; i < n; i++) {
      let angle = (Math.PI * 2 / n) * i - Math.PI / 2;
      let cr = (r * level) / maxVal;
      points.push((cx + cr * Math.cos(angle)) + ',' + (cy + cr * Math.sin(angle)));
    }
    let strokeColor = level === maxVal ? (isGlitchMode ? "rgba(232,226,214,0.3)" : "rgba(26,26,26,0.2)") : (isGlitchMode ? "rgba(232,226,214,0.1)" : "rgba(26,26,26,0.05)");
    svg += '<polygon points="' + points.join(' ') + '" fill="none" stroke="' + strokeColor + '" stroke-width="1" stroke-dasharray="' + (level === maxVal ? '0' : '2 2') + '" />';
  }
  for (let i = 0; i < n; i++) {
    let angle = (Math.PI * 2 / n) * i - Math.PI / 2;
    svg += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + r * Math.cos(angle)) + '" y2="' + (cy + r * Math.sin(angle)) + '" stroke="' + (isGlitchMode ? 'rgba(232,226,214,0.15)' : 'rgba(26,26,26,0.08)') + '" stroke-width="1" />';
  }
  let dataPoints = [];
  let circleTags = '';
  for (let i = 0; i < n; i++) {
    let cr = (r * stats[keys[i]]) / maxVal;
    let angle = (Math.PI * 2 / n) * i - Math.PI / 2;
    let x = cx + cr * Math.cos(angle), y = cy + cr * Math.sin(angle);
    dataPoints.push(x + ',' + y);
    circleTags += '<circle data-tx="' + x + '" data-ty="' + y + '" cx="' + x + '" cy="' + y + '" r="2.5" fill="' + (isGlitchMode ? '#090a0c' : '#f7f6f1') + '" stroke="' + (isGlitchMode ? '#cc3344' : '#b84040') + '" stroke-width="1.5" />';
  }
  svg += '<g class="radar-anim-group" style="opacity: 0;">';
  svg += '<polygon points="' + dataPoints.join(' ') + '" fill="' + (isGlitchMode ? 'rgba(204,51,68,0.15)' : 'rgba(74,98,85,0.1)') + '" stroke="' + (isGlitchMode ? '#cc3344' : '#4a6255') + '" stroke-width="1.5" stroke-linejoin="round" />';
  svg += circleTags;
  svg += '</g>';
  svg += '<g class="radar-text">';
  for (let i = 0; i < n; i++) {
    let key = keys[i], cr = (r * stats[key]) / maxVal;
    let angle = (Math.PI * 2 / n) * i - Math.PI / 2;
    let lx = cx + (r + 25) * Math.cos(angle), ly = cy + (r + 25) * Math.sin(angle);
    let textAnchor = Math.cos(angle) > 0.1 ? "start" : (Math.cos(angle) < -0.1 ? "end" : "middle");
    svg += '<text x="' + lx + '" y="' + ly + '" fill="' + (isGlitchMode ? '#e8e2d6' : '#1a1a1a') + '" font-size="13" font-family="Noto Serif SC" font-weight="600" text-anchor="' + textAnchor + '" dominant-baseline="middle">' + key + '</text>';
    svg += '<text x="' + lx + '" y="' + (ly + 16) + '" fill="' + (isGlitchMode ? '#6a7a73' : '#888') + '" font-size="11" font-family="Oswald" text-anchor="' + textAnchor + '" dominant-baseline="middle">' + stats[key] + ' / 6</text>';
  }
  svg += '</g>';
  document.getElementById('p-stats').innerHTML = svg + '</svg>';
}
