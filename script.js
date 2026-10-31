window.onload = function() {
  var container = document.getElementById('cards-container');
  if (!container) return;
  if (typeof ocDatabase === 'undefined') return;

  var threadPath = document.getElementById('dynamic-thread');
  var cardWidth = 150;
  var gap = 40;
  var startX = 50; // 初始偏移
  var startY = 50; // 红线起始高度

  var cards = [];
  var totalWidth = 0;

  // 1. 初始化卡片数据与DOM
  for (var i = 0; i < ocDatabase.length; i++) {
    var oc = ocDatabase[i];
    var card = document.createElement('div');
    card.className = 'list-item';
    card.setAttribute('data-id', oc.id);
    // 基础坐标 (用于后续物理计算)
    card.baseX = startX + i * (cardWidth + gap);
    card.baseY = startY;
    card.angle = (i % 2 === 0) ? -3 : 3; // 初始错落角度
    card.velocity = 0; // 物理速度

    card.innerHTML = '<div class="item-index">' + (i + 1) + '</div>' +
                     '<div class="item-name">' + oc.name + '</div>' +
                     '<div class="item-title">' + oc.title + '</div>';
                     
    // 点击跳转 (拖拽时不跳转)
    card.onclick = function(e) {
      if (Math.abs(this.velocity) < 0.5) {
        showProfile(this.getAttribute('data-id'));
      }
    };

    container.appendChild(card);
    cards.push(card);
    totalWidth = card.baseX + cardWidth;
  }

  // 为了让列表能横滑，撑开容器宽度
  container.style.width = totalWidth + 100 + 'px';

  // 2. 物理引擎 (核心)
  var draggingCard = null;
  var lastMouseX = 0;

  // 渲染函数：每一帧更新卡片位置和红线形状
  function renderPhysics() {
    var pathD = 'M 0,' + startY + ' ';

    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];

      // 限制最大倾角
      if (c.angle > 45) c.angle = 45;
      if (c.angle < -45) c.angle = -45;

      // 应用CSS变换 (基于左上角绝对定位 + 旋转)
      // 注意：transform-origin 是 50% 0%，所以平移只需定位到 X, Y
      c.style.transform = 'translate(' + c.baseX + 'px, ' + c.baseY + 'px) rotate(' + c.angle + 'deg)';
      
      // 如果是拖动中的卡片，不进行自然恢复
      if (c !== draggingCard) {
        // 阻尼正弦运动，使其恢复原始角度
        var baseAngle = (i % 2 === 0) ? -3 : 3;
        var diff = baseAngle - c.angle;
        c.velocity += diff * 0.05; // 回复力
        c.velocity *= 0.92; // 摩擦力
        c.angle += c.velocity;
      }

      // 构建红线路径 (贝塞尔曲线连接各卡片顶部)
      var pivotX = c.baseX + cardWidth / 2;
      var pivotY = c.baseY;
      
      // 简单地用直线连接 (视觉上因为卡片挡住了，其实看不出来)
      if (i === 0) {
        pathD += 'L ' + pivotX + ',' + pivotY + ' ';
      } else {
        var prevC = cards[i-1];
        var prevPivotX = prevC.baseX + cardWidth / 2;
        // 用二次贝塞尔画轻微的下垂
        var controlX = (prevPivotX + pivotX) / 2;
        var controlY = (prevC.baseY + pivotY) / 2 + 15; 
        pathD += 'Q ' + controlX + ',' + controlY + ' ' + pivotX + ',' + pivotY + ' ';
      }
    }
    
    // 收尾红线
    pathD += 'L ' + (totalWidth + 100) + ',' + startY;
    if(threadPath) threadPath.setAttribute('d', pathD);

    requestAnimationFrame(renderPhysics);
  }

  // 3. 拖拽与滑动逻辑
  var isDraggingList = false;
  var listStartX = 0;
  var listScrollX = 0;

  var getClientX = function(e) { return e.touches ? e.touches[0].clientX : e.clientX; };
  
  // 原生横向滚动绑定 (用于滑动整个列表)
  document.getElementById('stage').addEventListener('touchstart', function(e) {
    if (e.target.classList.contains('list-item')) return; // 如果点在卡片上，不触发列表滑动
    isDraggingList = true;
    listStartX = getClientX(e);
    listScrollX = container.offsetLeft || 0;
  }, {passive: true});

  document.addEventListener('touchmove', function(e) {
    if (isDraggingList) {
      var deltaX = getClientX(e) - listStartX;
      container.style.transform = 'translateX(' + (listScrollX + deltaX) + 'px)';
    } else if (draggingCard) {
      // 单张卡片拖拽物理
      var currentX = getClientX(e);
      var deltaX = currentX - lastMouseX;
      // 给目标卡片施加角度
      draggingCard.angle += deltaX * 0.8;
      
      // 波传导：周围的卡片产生反向小倾斜
      var index = cards.indexOf(draggingCard);
      for(var j=0; j<cards.length; j++) {
        if(j !== index) {
          var distance = Math.abs(j - index);
          var decay = Math.max(0, 1 - distance * 0.3);
          cards[j].angle -= deltaX * 0.2 * decay;
        }
      }
      lastMouseX = currentX;
    }
  }, {passive: true});

  document.addEventListener('touchend', function() {
    isDraggingList = false;
    if (draggingCard) {
       draggingCard = null;
    }
  });

  // 绑定鼠标事件（PC端）
  container.addEventListener('mousedown', function(e) {
    var target = e.target.closest('.list-item');
    if (target) {
      draggingCard = target;
      lastMouseX = getClientX(e);
    }
  });

  document.addEventListener('mousemove', function(e) {
    if (draggingCard) {
      var currentX = getClientX(e);
      var deltaX = currentX - lastMouseX;
      draggingCard.angle += deltaX * 0.8;
      
      var index = cards.indexOf(draggingCard);
      for(var j=0; j<cards.length; j++) {
        if(j !== index) {
          var distance = Math.abs(j - index);
          var decay = Math.max(0, 1 - distance * 0.3);
          cards[j].angle -= deltaX * 0.2 * decay;
        }
      }
      lastMouseX = currentX;
    }
  });

  document.addEventListener('mouseup', function() {
    draggingCard = null;
  });
  
  // PC端横向滑动
  document.getElementById('stage').addEventListener('wheel', function(e) {
    // 如果滚轮是横向的，或者按住了shift
    if (e.deltaX !== 0 || e.shiftKey) {
      container.style.transform = 'translateX(' + (container.offsetLeft - (e.deltaX || e.deltaY)) + 'px)';
    }
  });

  // 启动物理引擎
  renderPhysics();
};

// 外部函数保持不报错
function switchView(viewId) { /*... 保持原来的代码 ...*/ }
// 将上面原有的函数完整放进来
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

var isGlitchMode = false;
var currentActiveId = "";

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
