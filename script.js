window.onload = function() {
  var list = document.getElementById('dir-list');
  if (!list) return;
  if (typeof ocDatabase === 'undefined') {
    list.innerHTML = '<div style="color:red;text-align:center;">data.js 读取失败</div>';
    return;
  }

  // 1. 渲染卡片并记录初始角度
  var html = '';
  for (var i = 0; i < ocDatabase.length; i++) {
    var oc = ocDatabase[i];
    var num = (i + 1) < 10 ? '0' + (i + 1) : (i + 1);
    var baseRotate = (i % 2 === 0) ? -3 : 2;
    var baseY = (i % 3 === 0) ? 0 : 15;
    html += '<div class="list-item" onclick="showProfile(\'' + oc.id + '\')" data-base="' + baseRotate + '" data-y="' + baseY + '" style="transform: rotate(' + baseRotate + 'deg) translateY(' + baseY + 'px);">' +
      '<div class="item-index">' + num + '</div>' +
      '<div class="item-name">' + oc.name + '</div>' +
      '<div class="item-title">' + oc.title + '</div>' +
      '</div>';
  }
  list.innerHTML = html;

  // 2. 物理拖拽和红线拉扯
  var threadPath = document.getElementById('dynamic-thread');
  var lastScrollLeft = list.scrollLeft;
  var scrollTimer = null;

  list.addEventListener('scroll', function() {
    var currentScrollLeft = list.scrollLeft;
    var speed = currentScrollLeft - lastScrollLeft;
    
    // 限制最大速度防止卡片翻面
    if (speed > 50) speed = 50;
    if (speed < -50) speed = -50;

    var tilt = speed * 0.6; 

    var cards = list.querySelectorAll('.list-item');
    for (var j = 0; j < cards.length; j++) {
      var baseRotate = parseFloat(cards[j].getAttribute('data-base'));
      var baseY = cards[j].getAttribute('data-y');
      
      cards[j].style.transition = 'none';
      cards[j].style.transform = 'rotate(' + (baseRotate + tilt) + 'deg) translateY(' + baseY + 'px)';
    }

    if (threadPath) {
       var pull = speed * 1.5;
       threadPath.setAttribute('d', 'M 0,30 Q ' + (250 - pull) + ',' + (70 + pull) + ' 500,40 T 1000,50');
    }

    lastScrollLeft = currentScrollLeft;

    // 回弹
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function() {
      for (var k = 0; k < cards.length; k++) {
        var baseRotate = parseFloat(cards[k].getAttribute('data-base'));
        var baseY = cards[k].getAttribute('data-y');
        
        cards[k].style.transition = 'transform 0.8s cubic-bezier(0.25, 1.25, 0.5, 1)'; 
        cards[k].style.transform = 'rotate(' + baseRotate + 'deg) translateY(' + baseY + 'px)';
      }
      if (threadPath) {
        threadPath.style.transition = 'd 0.8s ease-out';
        threadPath.setAttribute('d', 'M 0,30 Q 250,70 500,40 T 1000,50');
      }
    }, 150);
  });

  var stopTransition = function() {
    var cards = list.querySelectorAll('.list-item');
    for (var j = 0; j < cards.length; j++) {
      cards[j].style.transition = 'none';
    }
    if (threadPath) threadPath.style.transition = 'none';
  };
  list.addEventListener('mousedown', stopTransition);
  list.addEventListener('touchstart', stopTransition);

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

  // 渲染基础卷宗
  if (basicData) {
    for (var b = 0; b < basicData.length; b++) {
      bHtml += '<div class="info-item"><div class="k">' + basicData[b].k + '</div><div class="v">' + basicData[b].v + '</div></div>';
    }
  }
  infoList.innerHTML = bHtml;

  // 渲染生平轨迹
  if (timelineData) {
    for (var t = 0; t < timelineData.length; t++) {
      var timeColor = isMutated ? 'style="color:red;"' : '';
      tHtml += '<div class="tl-item"><div class="tl-time" ' + timeColor + '>' + timelineData[t].time + '</div><div class="tl-event">' + timelineData[t].event + '</div></div>';
    }
  }
  timelineBox.innerHTML = tHtml;

  // 渲染人际羁绊（核心修复）
  if (relationsData && relationsData.length > 0) {
    for (var r = 0; r < relationsData.length; r++) {
      var rel = relationsData[r];
      var hasLink = false;
      
      if (!isMutated) {
        for (var x = 0; x < ocDatabase.length; x++) {
          if (ocDatabase[x].id === rel.id && rel.id !== '') {
            hasLink = true;
            break;
          }
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
