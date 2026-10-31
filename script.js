window.onload = function() {
  var container = document.getElementById('cards-container');
  if (!container) return;
  if (typeof ocDatabase === 'undefined') return;

  var threadPath = document.getElementById('dynamic-thread');
  var cardWidth = 140; 
  var gap = 20; 
  var startX = 40;
  var startY = 60; 

  var cards = [];
  var nodes = []; // 物理节点，用于画线
  var totalWidth = 0;

  // 初始化
  for (var i = 0; i < ocDatabase.length; i++) {
    var oc = ocDatabase[i];
    var card = document.createElement('div');
    card.className = 'list-item';
    card.setAttribute('data-id', oc.id);
    
    // 物理属性
    card.baseX = startX + i * (cardWidth + gap);
    card.baseY = startY;
    card.x = card.baseX; 
    card.y = card.baseY;
    card.vx = 0; 
    card.vy = 0;
    card.angle = (i % 2 === 0) ? -2 : 2; 
    card.targetAngle = card.angle;
    card.va = 0; // 角速度

    // 创建绳子节点（每个卡片中心一个挂点）
    nodes.push({
      baseX: card.baseX + cardWidth / 2,
      baseY: card.baseY,
      x: card.baseX + cardWidth / 2,
      y: card.baseY,
      vx: 0, vy: 0
    });
    
    card.innerHTML = '<div class="item-index">' + (i + 1) + '</div>' +
                     '<div class="item-name">' + oc.name + '</div>' +
                     '<div class="item-title">' + oc.title + '</div>';
                     
    (function(cardEl, id) {
      cardEl.onclick = function() {
        if (Math.abs(cardEl.vx) < 2) showProfile(id);
      };
    })(card, oc.id);

    container.appendChild(card);
    cards.push(card);
    totalWidth = card.baseX + cardWidth;
  }
  container.style.width = totalWidth + 100 + 'px';

  // 物理引擎循环
  function physicsLoop() {
    // 绘制路径
    var pathD = '';

    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      var n = nodes[i];

      // 1. 卡片物理 (弹簧力回弹)
      var k = 0.1; // 弹性系数
      var damping = 0.85; // 阻尼
      
      // 如果没有拖拽，计算弹簧力
      if (!c.isDragging) {
        var dx = c.baseX - c.x;
        var ax = dx * k;
        c.vx = (c.vx + ax) * damping;
        c.x += c.vx;

        var da = c.targetAngle - c.angle;
        var aa = da * 0.1;
        c.va = (c.va + aa) * damping;
        c.angle += c.va;
      }

      // 2. 绳子节点物理 (受卡片牵连)
      var ndx = (c.x + cardWidth/2) - n.x;
      var ndy = c.y - n.y;
      n.vx = (n.vx + ndx * 0.2) * 0.8;
      n.vy = (n.vy + ndy * 0.2) * 0.8;
      n.x += n.vx;
      n.y += n.vy;

      // 应用卡片位置
      c.style.transform = 'translate(' + c.x + 'px, ' + c.y + 'px) rotate(' + c.angle + 'deg)';

      // 3. 构建平滑曲线（使用三次贝塞尔近似穿过所有节点）
      if (i === 0) {
        pathD += 'M ' + (n.x - 80) + ',' + (n.y - 15) + ' '; // 左侧延伸
        pathD += 'Q ' + (n.x - 40) + ',' + (n.y + 10) + ' ' + n.x + ',' + n.y + ' ';
      } else {
        var prevN = nodes[i-1];
        // 控制点计算（用于平滑连接）
        var cx1 = prevN.x + (n.x - prevN.x) * 0.5;
        var cy1 = prevN.y + (n.y - prevN.y) * 0.5 + 15; // 下坠感
        
        pathD += 'Q ' + cx1 + ',' + cy1 + ' ' + n.x + ',' + n.y + ' ';
      }
    }

    // 右侧延伸
    var lastN = nodes[nodes.length - 1];
    pathD += 'Q ' + (lastN.x + 40) + ',' + (lastN.y + 10) + ' ' + (lastN.x + 80) + ',' + (lastN.y - 15);

    if (threadPath) threadPath.setAttribute('d', pathD);

    requestAnimationFrame(physicsLoop);
  }

  // 启动物理循环
  physicsLoop();

  // 交互逻辑
  var draggingCard = null;
  var startMouseX = 0;
  var getClientX = function(e) { return e.touches ? e.touches[0].clientX : e.clientX; };
  
  container.addEventListener('mousedown', startDrag);
  container.addEventListener('touchstart', startDrag, {passive: true});

  function startDrag(e) {
    var target = e.target.closest('.list-item');
    if (target) {
      draggingCard = target;
      draggingCard.isDragging = true;
      startMouseX = getClientX(e);
    }
  }

  document.addEventListener('mousemove', moveDrag);
  document.addEventListener('touchmove', moveDrag, {passive: true});

  function moveDrag(e) {
    if (!draggingCard) return;
    var currentX = getClientX(e);
    var deltaX = currentX - startMouseX;
    if (deltaX > 60) deltaX = 60;
    if (deltaX < -60) deltaX = -60;

    var dragIdx = cards.indexOf(draggingCard);
    
    // 给被拖拽的卡片直接赋值
    draggingCard.x = draggingCard.baseX + deltaX;
    draggingCard.angle = (dragIdx % 2 === 0 ? -2 : 2) + deltaX * 0.6;

    // 传递力给周围卡片，制造拉扯感
    for (var i = 0; i < cards.length; i++) {
      if (i === dragIdx) continue;
      var distance = Math.abs(i - dragIdx);
      if (distance < 3) { // 只有附近的会受影响
        var factor = 1 - (distance * 0.3);
        cards[i].x = cards[i].baseX + deltaX * 0.2 * factor;
      }
    }
  }

  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchend', endDrag);

  function endDrag() {
    if (!draggingCard) return;
    draggingCard.isDragging = false;
    
    // 触发回弹（物理引擎自动处理）
    var dragIdx = cards.indexOf(draggingCard);
    draggingCard.targetAngle = (dragIdx % 2 === 0 ? -2 : 2);
    draggingCard = null;
  }

  // 初始化观察器
  setupObserver();
};

// 动效与渲染
var isGlitchMode = false;
var currentActiveId = "";
var observer;

function setupObserver() {
  var observerOptions = { root: null, rootMargin: '0px 0px -50px 0px', threshold: 0.1 };
  observer = new IntersectionObserver(function(entries, obs) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        if (entry.target.id === 'p-stats') {
          var radarData = entry.target.querySelector('.radar-anim-group');
          var radarText = entry.target.querySelector('.radar-text');
          if (radarData) animateRadarLines(radarData, radarText);
        }
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);
}

function switchView(viewId) {
  var views = document.querySelectorAll('.view');
  for (var i = 0; i < views.length; i++) {
    views[i].classList.remove('active');
    views[i].style.display = 'none';
  }
  var target = document.getElementById(viewId);
  if (target) {
    target.classList.add('active');
    target.style.display = 'block';
  }
  window.scrollTo(0, 0);
  if (viewId === 'view-main') {
    document.body.classList.remove('glitch-mode');
    isGlitchMode = false;
    var matrix = document.getElementById('glitch-matrix');
    if (matrix) matrix.innerHTML = '';
  }
}

function toggleGlitch() {
  isGlitchMode = !isGlitchMode;
  if (isGlitchMode) { document.body.classList.add('glitch-mode'); } 
  else { document.body.classList.remove('glitch-mode'); }
  var matrix = document.getElementById('glitch-matrix');
  if (matrix) matrix.innerHTML = '';
  if (isGlitchMode) {
    showProfile(currentActiveId, true);
    if (matrix) {
      matrix.innerHTML = '<div class="glitch-text-box">Text Glitch</div>';
      setTimeout(function() { matrix.innerHTML = ''; }, 1200);
    }
  } else { showProfile(currentActiveId, true); }
}

function showProfile(id, isToggle) {
  if (isToggle !== true) {
    currentActiveId = id;
    document.body.classList.remove('glitch-mode');
    isGlitchMode = false;
  }
  var oc = null;
  for (var i = 0; i < ocDatabase.length; i++) {
    if (ocDatabase[i].id === id) { oc = ocDatabase[i]; break; }
  }
  if (!oc) return;

  var btn = document.getElementById('glitch-btn');
  if (btn) { btn.style.display = (id === 'yeyao') ? 'block' : 'none'; }

  var avatarBox = document.getElementById('p-avatar-box');
  var currentAvatar = (isGlitchMode && oc.mutated_avatar) ? oc.mutated_avatar : oc.avatar;
  if (currentAvatar) { avatarBox.innerHTML = '<img src="' + currentAvatar + '">'; } 
  else { avatarBox.innerHTML = '<div class="empty-text">NO IMAGE</div>'; }

  var statsToRender = oc.stats;
  var pName = document.getElementById('p-name');
  var pTitle = document.getElementById('p-title');
  var infoList = document.getElementById('p-info-list');
  var timelineBox = document.getElementById('p-timeline');
  var relationsBox = document.getElementById('p-relations');
  
  var bHtml = '', tHtml = '', rHtml = '';

  var isMutated = (id === 'yeyao' && isGlitchMode);
  var basicData = isMutated ? oc.mutated_basic : oc.basic;
  var timelineData = isMutated ? oc.mutated_timeline : oc.timeline;
  var relationsData = isMutated ? oc.mutated_relations : oc.relations;

  if (isMutated) {
    if (oc.mutated_stats) statsToRender = oc.mutated_stats;
    pName.textContent = "叶 瑶 ？";
    pTitle.textContent = "是我做错了吗?";
  } else {
    pName.textContent = oc.name;
    pTitle.textContent = oc.title;
  }

  if (basicData) {
    for (var b = 0; b < basicData.length; b++) {
      bHtml += '<div class="info-item delay-item" style="transition-delay:' + (b*0.1) + 's"><div class="k">' + basicData[b].k + '</div><div class="v">' + basicData[b].v + '</div></div>';
    }
  }
  infoList.innerHTML = bHtml;

  if (timelineData) {
    for (var t = 0; t < timelineData.length; t++) {
      var timeColor = isMutated ? 'style="color:red;"' : '';
      tHtml += '<div class="tl-item delay-item" style="transition-delay:' + (t*0.1) + 's"><div class="tl-time" ' + timeColor + '>' + timelineData[t].time + '</div><div class="tl-event">' + timelineData[t].event + '</div></div>';
    }
  }
  timelineBox.innerHTML = tHtml;

  if (relationsData && relationsData.length > 0) {
    for (var r = 0; r < relationsData.length; r++) {
      var rel = relationsData[r];
      var hasLink = false;
      if (!isMutated) {
        for (var x = 0; x < ocDatabase.length; x++) {
          if (ocDatabase[x].id === rel.id && rel.id !== '') { hasLink = true; break; }
        }
      }
      var clickStr = hasLink ? 'onclick="showProfile(\'' + rel.id + '\')"' : '';
      var linkClass = hasLink ? 'has-link' : '';
      var descStyle = isMutated ? 'style="color:red;"' : '';
      
      rHtml += '<div class="rel-item delay-item ' + linkClass + '" style="transition-delay:' + (r*0.1) + 's" ' + clickStr + '>';
      rHtml += '<div class="rel-name">' + rel.name + '</div>';
      rHtml += '<div class="rel-desc" ' + descStyle + '>' + rel.desc + '</div>';
      rHtml += '</div>';
    }
  } else {
    rHtml = '<div style="color:var(--muted);font-size:14px;">暂无羁绊记录</div>';
  }
  relationsBox.innerHTML = rHtml;

  document.getElementById('p-top-id').textContent = isGlitchMode ? "ERROR" : "ID: " + oc.id.toUpperCase();
  renderRadarChart(statsToRender);

  if (isToggle !== true) { switchView('view-profile'); } 
  else { window.scrollTo(0, 0); }
  
  var radarContainer = document.getElementById('p-stats');
  radarContainer.classList.remove('active');
  var delayItems = document.querySelectorAll('.delay-item');
  for(var k=0; k<delayItems.length; k++) { delayItems[k].classList.remove('active'); }
  var textGroup = radarContainer.querySelector('.radar-text');
  if (textGroup) textGroup.classList.remove('show');
  void radarContainer.offsetWidth; 

  setTimeout(function() {
    if (observer) {
      observer.observe(radarContainer);
      for(var m=0; m<delayItems.length; m++) { observer.observe(delayItems[m]); }
    }
  }, 100);
}

function animateRadarLines(group, textGroup) {
  var circles = group.querySelectorAll('circle');
  var poly = group.querySelector('polygon');
  var targets = [];
  var cx = 150, cy = 140;
  group.style.opacity = 0;
  
  for(var i=0; i<circles.length; i++) {
    var c = circles[i];
    var tx = parseFloat(c.getAttribute('data-tx'));
    var ty = parseFloat(c.getAttribute('data-ty'));
    var distance = Math.hypot(tx - cx, ty - cy);
    targets.push({ el: c, tx: tx, ty: ty, distance: distance });
  }
  var speed = Math.hypot(90, 0) / 800; 
  var startTime = performance.now();
  
  for(var j=0; j<circles.length; j++) {
    circles[j].setAttribute('cx', cx);
    circles[j].setAttribute('cy', cy);
  }
  poly.setAttribute('points', cx + ',' + cy + ' ' + cx + ',' + cy + ' ' + cx + ',' + cy + ' ' + cx + ',' + cy + ' ' + cx + ',' + cy + ' ' + cx + ',' + cy);
  group.style.opacity = 1;
  
  function update(now) {
    var elapsed = now - startTime;
    var currentPoints = [];
    var allFinished = true;
    for(var k=0; k<targets.length; k++) {
      var t = targets[k];
      var progress = Math.min(elapsed / (t.distance / speed), 1);
      if (progress < 1) allFinished = false; 
      var currentX = cx + (t.tx - cx) * progress;
      var currentY = cy + (t.ty - cy) * progress;
      t.el.setAttribute('cx', currentX);
      t.el.setAttribute('cy', currentY);
      currentPoints.push(currentX + ',' + currentY);
    }
    poly.setAttribute('points', currentPoints.join(' '));
    if (!allFinished) requestAnimationFrame(update);
    else textGroup.classList.add('show');
  }
  requestAnimationFrame(update);
}

function renderRadarChart(stats) {
  var cx = 150, cy = 140, r = 90, maxVal = 6;
  var keys = Object.keys(stats), n = keys.length;
  var svg = '<svg viewBox="0 0 300 280" style="width:100%;max-width:300px;overflow:visible;">';
  
  for (var level = 1; level <= maxVal; level++) {
    var points = [];
    for (var i = 0; i < n; i++) {
      var angle = (Math.PI * 2 / n) * i - Math.PI / 2;
      var cr = (r * level) / maxVal;
      points.push((cx + cr * Math.cos(angle)) + ',' + (cy + cr * Math.sin(angle)));
    }
    var strokeColor = level === maxVal ? "rgba(94,140,135,0.3)" : "rgba(94,140,135,0.1)";
    svg += '<polygon points="' + points.join(' ') + '" fill="none" stroke="' + strokeColor + '" stroke-width="1" stroke-dasharray="' + (level === maxVal ? '0' : '2 2') + '" />';
  }
  for (var i2 = 0; i2 < n; i2++) {
    var angle2 = (Math.PI * 2 / n) * i2 - Math.PI / 2;
    svg += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + r * Math.cos(angle2)) + '" y2="' + (cy + r * Math.sin(angle2)) + '" stroke="rgba(94,140,135,0.1)" stroke-width="1" />';
  }
  
  var dataPoints = [];
  var circleTags = '';
  for (var i3 = 0; i3 < n; i3++) {
    var cr2 = (r * stats[keys[i3]]) / maxVal;
    var angle3 = (Math.PI * 2 / n) * i3 - Math.PI / 2;
    var x = cx + cr2 * Math.cos(angle3), y = cy + cr2 * Math.sin(angle3);
    dataPoints.push(x + ',' + y);
    circleTags += '<circle data-tx="' + x + '" data-ty="' + y + '" cx="' + x + '" cy="' + y + '" r="2.5" fill="' + (isGlitchMode ? '#090a0c' : '#F1F0E8') + '" stroke="' + (isGlitchMode ? '#cc3344' : '#B56A58') + '" stroke-width="1.5" />';
  }
  svg += '<g class="radar-anim-group" style="opacity: 0;">';
  svg += '<polygon points="' + dataPoints.join(' ') + '" fill="' + (isGlitchMode ? 'rgba(204,51,68,0.15)' : 'rgba(181,106,88,0.1)') + '" stroke="' + (isGlitchMode ? '#cc3344' : '#B56A58') + '" stroke-width="1.5" stroke-linejoin="round" />';
  svg += circleTags;
  svg += '</g>';
  
  svg += '<g class="radar-text">';
  for (var i4 = 0; i4 < n; i4++) {
    var key = keys[i4];
    var angle4 = (Math.PI * 2 / n) * i4 - Math.PI / 2;
    var lx = cx + (r + 20) * Math.cos(angle4), ly = cy + (r + 20) * Math.sin(angle4);
    var textAnchor = Math.cos(angle4) > 0.1 ? "start" : (Math.cos(angle4) < -0.1 ? "end" : "middle");
    svg += '<text x="' + lx + '" y="' + ly + '" fill="' + (isGlitchMode ? '#e8e2d6' : '#2E3A35') + '" font-size="12" font-family="Noto Serif SC" font-weight="600" text-anchor="' + textAnchor + '" dominant-baseline="middle">' + key + '</text>';
    svg += '<text x="' + lx + '" y="' + (ly + 16) + '" fill="' + (isGlitchMode ? '#6a7a73' : '#5E8C87') + '" font-size="11" font-family="Oswald" text-anchor="' + textAnchor + '" dominant-baseline="middle">' + stats[key] + ' / 6</text>';
  }
  svg += '</g>';
  document.getElementById('p-stats').innerHTML = svg + '</svg>';
}
