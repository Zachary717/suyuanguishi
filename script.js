window.onload = function() {
  var list = document.getElementById('dir-list');
  if (!list) return;
  if (typeof ocDatabase === 'undefined') {
    list.innerHTML = '<div style="color:red;text-align:center;">data.js 读取失败</div>';
    return;
  }

  var html = '';
  for (var i = 0; i < ocDatabase.length; i++) {
    var oc = ocDatabase[i];
    var num = (i + 1) < 10 ? '0' + (i + 1) : (i + 1);
    var baseRotate = (i % 2 === 0) ? -3 : 2;
    html += '<div class="list-item" data-id="' + oc.id + '" data-idx="' + i + '" data-base="' + baseRotate + '" onclick="if(!isDragging) showProfile(\'' + oc.id + '\')" style="transform: rotate(' + baseRotate + 'deg);">' +
      '<div class="item-index">' + num + '</div>' +
      '<div class="item-name">' + oc.name + '</div>' +
      '<div class="item-title">' + oc.title + '</div>' +
      '</div>';
  }
  list.innerHTML = html;

  var cards = document.querySelectorAll('.list-item');
  var threadPath = document.getElementById('dynamic-thread');
  
  // 物理状态
  var isDragging = false;
  var startX = 0;
  var activeIdx = -1;

  // 统一处理触摸和鼠标事件
  var getClientX = function(e) {
    return e.touches ? e.touches[0].clientX : e.clientX;
  };

  // 1. 按下卡片
  cards.forEach(function(card, idx) {
    var startDrag = function(e) {
      isDragging = true;
      activeIdx = idx;
      startX = getClientX(e);
      
      // 按下时取消所有过渡，保证跟手
      cards.forEach(function(c) { c.style.transition = 'none'; });
      if (threadPath) threadPath.style.transition = 'none';
    };
    
    card.addEventListener('mousedown', startDrag);
    card.addEventListener('touchstart', startDrag, {passive: true});
  });

  // 2. 拖拽移动 (全局监听)
  var onMove = function(e) {
    if (!isDragging) return;
    var currentX = getClientX(e);
    var deltaX = currentX - startX;
    
    // 限制单次拖拽幅度，防止卡片飞出去
    if (deltaX > 40) deltaX = 40;
    if (deltaX < -40) deltaX = -40;

    // 计算波传导
    cards.forEach(function(card, idx) {
      var base = parseFloat(card.getAttribute('data-base'));
      
      if (idx === activeIdx) {
        // 被拖拽的卡片：直接响应拖拽角度
        card.style.transform = 'rotate(' + (base + deltaX * 0.8) + 'deg)';
      } else {
        // 其他卡片：根据与当前卡片的距离，产生逐渐减弱的波浪倾斜
        var dist = Math.abs(idx - activeIdx);
        // 延迟和衰减系数
        var decay = Math.max(0, 1 - dist * 0.2); 
        // 用正弦波模拟传递的抖动
        var wave = Math.sin(dist) * deltaX * 0.3 * decay;
        card.style.transform = 'rotate(' + (base - wave) + 'deg)';
      }
    });

    // 红线变形
    if (threadPath) {
      var flex = deltaX * 0.5;
      // 构造路径，在中心附近产生一个下凹或上凸
      threadPath.setAttribute('d', 'M 0,30 Q ' + (500 - flex * 10) + ',' + (30 - flex) + ' 1000,30');
    }
  };

  // 3. 松手回弹
  var onEnd = function() {
    if (!isDragging) return;
    
    // 稍微延迟一下再重置 isDragging，防止触发点击事件跳转
    setTimeout(function() { isDragging = false; }, 50);

    cards.forEach(function(card) {
      var base = parseFloat(card.getAttribute('data-base'));
      card.style.transition = 'transform 0.6s cubic-bezier(0.25, 1.5, 0.5, 1)';
      card.style.transform = 'rotate(' + base + 'deg)';
    });

    if (threadPath) {
      threadPath.style.transition = 'd 0.6s ease-out';
      threadPath.setAttribute('d', 'M 0,30 Q 500,30 1000,30');
    }
    
    activeIdx = -1;
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('touchmove', onMove, {passive: true});
  document.addEventListener('mouseup', onEnd);
  document.addEventListener('touchend', onEnd);

  // 4. 容器原生滚动时的联动 (兼容左右滑列表)
  var scrollTimer = null;
  list.addEventListener('scroll', function() {
    if (isDragging) return; // 如果正在拖拽单张卡片，不触发滚动逻辑

    // 快速滚动时给一个整体的倾斜
    var baseScroll = list.scrollLeft;
    // 这里省略复杂逻辑，只要保证原生滑动顺滑即可
  });

  // 其他逻辑
  var btn = document.getElementById('glitch-btn');
  if (btn) {
    var warning = document.createElement('div');
    warning.className = 'epilepsy-warning';
    warning.innerHTML = '警告：光敏性癫痫患者请勿点击';
    btn.parentNode.insertBefore(warning, btn);
  }
  var ticketEgg = document.getElementById('ticket-egg');
  if (ticketEgg) {
    ticketEgg.addEventListener('click', function() {
      if (this.classList.contains('show')) { this.classList.remove('show'); } 
      else { this.classList.add('show'); }
    });
  }
};

var isGlitchMode = false;
var currentActiveId = "";

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

  var ticketEgg = document.getElementById('ticket-egg');
  if (ticketEgg) {
    if (id === 'yinghong') { ticketEgg.style.display = 'block'; } 
    else { ticketEgg.style.display = 'none'; ticketEgg.classList.remove('show'); }
  }

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
    var btn = document.getElementById('glitch-btn');
    if (btn) btn.style.display = 'block';
    if (oc.mutated_stats) statsToRender = oc.mutated_stats;
    pName.textContent = "叶 瑶 ？";
    pTitle.textContent = "是我做错了吗?";
  } else {
    var btn2 = document.getElementById('glitch-btn');
    if (btn2) btn2.style.display = (id === 'yeyao') ? 'block' : 'none';
    pName.textContent = oc.name;
    pTitle.textContent = oc.title;
  }

  if (basicData) {
    for (var b = 0; b < basicData.length; b++) {
      bHtml += '<div class="info-item"><div class="k">' + basicData[b].k + '</div><div class="v">' + basicData[b].v + '</div></div>';
    }
  }
  infoList.innerHTML = bHtml;

  if (timelineData) {
    for (var t = 0; t < timelineData.length; t++) {
      var timeColor = isMutated ? 'style="color:red;"' : '';
      tHtml += '<div class="tl-item"><div class="tl-time" ' + timeColor + '>' + timelineData[t].time + '</div><div class="tl-event">' + timelineData[t].event + '</div></div>';
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
      
      rHtml += '<div class="rel-item ' + linkClass + '" ' + clickStr + '>';
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
  for (var i3 = 0; i3 < n; i3++) {
    var cr2 = (r * stats[keys[i3]]) / maxVal;
    var angle3 = (Math.PI * 2 / n) * i3 - Math.PI / 2;
    var x = cx + cr2 * Math.cos(angle3), y = cy + cr2 * Math.sin(angle3);
    dataPoints.push(x + ',' + y);
  }
  
  svg += '<g style="opacity: 1;">';
  svg += '<polygon points="' + dataPoints.join(' ') + '" fill="rgba(181,106,88,0.1)" stroke="#B56A58" stroke-width="1.5" stroke-linejoin="round" />';
  svg += '</g>';
  
  svg += '<g>';
  for (var i4 = 0; i4 < n; i4++) {
    var key = keys[i4];
    var angle4 = (Math.PI * 2 / n) * i4 - Math.PI / 2;
    var lx = cx + (r + 20) * Math.cos(angle4), ly = cy + (r + 20) * Math.sin(angle4);
    var textAnchor = Math.cos(angle4) > 0.1 ? "start" : (Math.cos(angle4) < -0.1 ? "end" : "middle");
    svg += '<text x="' + lx + '" y="' + ly + '" fill="#2E3A35" font-size="12" text-anchor="' + textAnchor + '" dominant-baseline="middle">' + key + '</text>';
    svg += '<text x="' + lx + '" y="' + (ly + 16) + '" fill="#5E8C87" font-size="11" text-anchor="' + textAnchor + '" dominant-baseline="middle">' + stats[key] + ' / 6</text>';
  }
  svg += '</g>';
  
  document.getElementById('p-stats').innerHTML = svg + '</svg>';
}
