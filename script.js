window.onload = function() {
  var list = document.getElementById('dir-list');
  if (typeof ocDatabase === 'undefined') {
    list.innerHTML = '<div style="color:red; text-align:center;">data.js 读取失败！</div>';
    return;
  }
  
  var html = '';
  for(var i = 0; i < ocDatabase.length; i++) {
    var oc = ocDatabase[i];
    var num = (i + 1) < 10 ? '0' + (i + 1) : (i + 1);
    html += '<div class="list-item reveal" onclick="showProfile(\'' + oc.id + '\')">' +
              '<div class="item-index">' + num + '</div>' +
              '<div class="item-name">' + oc.name + '</div>' +
              '<div class="item-title">' + oc.title + '</div>' +
            '</div>';
  }
  list.innerHTML = html;
  
  // 延迟加载动效
  setTimeout(function() {
    var reveals = document.querySelectorAll('.reveal');
    for(var j = 0; j < reveals.length; j++) {
      reveals[j].classList.add('active');
    }
  }, 100);

  var btn = document.getElementById('glitch-btn');
  if (btn) {
    var warning = document.createElement('div');
    warning.className = 'epilepsy-warning';
    warning.innerHTML = '光敏性癫痫患者请勿点击';
    btn.parentNode.insertBefore(warning, btn);
  }

  var ticketEgg = document.getElementById('ticket-egg');
  if (ticketEgg) {
    ticketEgg.addEventListener('click', function() {
      if (this.classList.contains('show')) {
        this.classList.remove('show');
      } else {
        this.classList.add('show');
      }
    });
  }
};

var isGlitchMode = false;
var currentActiveId = "";

function switchView(viewId) {
  var views = document.querySelectorAll('.view');
  for(var i = 0; i < views.length; i++) {
    views[i].classList.remove('active');
    views[i].style.display = 'none';
  }
  var target = document.getElementById(viewId);
  if(target) {
    target.classList.add('active');
    target.style.display = 'block';
  }
  window.scrollTo(0, 0);
  
  if (viewId === 'view-main') {
    document.body.classList.remove('glitch-mode');
    isGlitchMode = false;
    document.getElementById('glitch-matrix').innerHTML = '';
  }
}

function toggleGlitch() {
  isGlitchMode = !isGlitchMode;
  if(isGlitchMode) {
    document.body.classList.add('glitch-mode');
  } else {
    document.body.classList.remove('glitch-mode');
  }
  
  document.getElementById('glitch-matrix').innerHTML = '';
  
  if (isGlitchMode) {
    showProfile(currentActiveId, true); 
    var container = document.getElementById('glitch-matrix');
    container.innerHTML = '<div class="glitch-text-box">此恨何时已。滴空阶、寒更雨歇，葬花天气。<br><br>重泉若有双鱼寄。好知他、年来苦乐，与谁相倚。</div>';
    setTimeout(function() { container.innerHTML = ''; }, 1200);
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
  
  var oc = null;
  for(var i = 0; i < ocDatabase.length; i++) {
    if(ocDatabase[i].id === id) {
      oc = ocDatabase[i];
      break;
    }
  }
  if(!oc) return;

  // 门票彩蛋显隐控制
  var ticketEgg = document.getElementById('ticket-egg');
  if (ticketEgg) {
    if (id === 'yinghong') {
      ticketEgg.style.display = 'block';
    } else {
      ticketEgg.style.display = 'none';
      ticketEgg.classList.remove('show');
    }
  }

  var avatarBox = document.getElementById('p-avatar-box');
  var currentAvatar = (isGlitchMode && oc.mutated_avatar) ? oc.mutated_avatar : oc.avatar;
  
  if (currentAvatar) {
    avatarBox.innerHTML = '<img src="' + currentAvatar + '">';
  } else {
    avatarBox.innerHTML = '<div class="empty-text">NO IMAGE</div>';
  }

  var statsToRender = oc.stats;
  var pName = document.getElementById('p-name');
  var pTitle = document.getElementById('p-title');
  var infoList = document.getElementById('p-info-list');
  var timelineBox = document.getElementById('p-timeline');
  var relationsBox = document.getElementById('p-relations');

  // 构建 HTML
  var bHtml = '', tHtml = '', rHtml = '';

  if (id === 'yeyao' && isGlitchMode) {
    document.getElementById('glitch-btn').style.display = 'block';
    if (oc.mutated_stats) statsToRender = oc.mutated_stats;
    
    pName.textContent = "叶 瑶 ？";
    pTitle.textContent = "是我做错了吗?";
    
    for(var j = 0; j < oc.mutated_basic.length; j++) {
      var b = oc.mutated_basic[j];
      bHtml += '<div class="info-item delay-item active" style="transition-delay:' + (j*0.1) + 's"><div class="k">' + b.k + '</div><div class="v">' + b.v + '</div></div>';
    }
    for(var k = 0; k < oc.mutated_timeline.length; k++) {
      var t = oc.mutated_timeline[k];
      tHtml += '<div class="tl-item delay-item active" style="transition-delay:' + (k*0.1) + 's"><div class="tl-time">' + t.time + '</div><div class="tl-event">' + t.event + '</div></div>';
    }
    for(var m = 0; m < oc.mutated_relations.length; m++) {
      var r = oc.mutated_relations[m];
      rHtml += '<div class="rel-item delay-item active" style="transition-delay:' + (m*0.1) + 's"><div class="rel-name">' + r.name + '</div><div class="rel-desc" style="color:red;">' + r.desc + '</div></div>';
    }

  } else {
    document.getElementById('glitch-btn').style.display = (id === 'yeyao') ? 'block' : 'none';
    pName.textContent = oc.name;
    pTitle.textContent = oc.title;
    
    for(var n = 0; n < oc.basic.length; n++) {
      var b2 = oc.basic[n];
      bHtml += '<div class="info-item delay-item active" style="transition-delay:' + (n*0.1) + 's"><div class="k">' + b2.k + '</div><div class="v">' + b2.v + '</div></div>';
    }
    for(var p = 0; p < oc.timeline.length; p++) {
      var t2 = oc.timeline[p];
      tHtml += '<div class="tl-item delay-item active" style="transition-delay:' + (p*0.1) + 's"><div class="tl-time">' + t2.time + '</div><div class="tl-event">' + t2.event + '</div></div>';
    }
    for(var q = 0; q < oc.relations.length; q++) {
      var r2 = oc.relations[q];
      var hasLink = false;
      for(var x = 0; x < ocDatabase.length; x++) {
        if(ocDatabase[x].id === r2.id && r2.id !== '') hasLink = true;
      }
      var clickStr = hasLink ? 'onclick="showProfile(\'' + r2.id + '\')"' : '';
      var linkClass = hasLink ? 'has-link' : '';
      rHtml += '<div class="rel-item delay-item ' + linkClass + '" style="transition-delay:' + (q*0.1) + 's" ' + clickStr + '><div class="rel-name">' + r2.name + '</div><div class="rel-desc">' + r2.desc + '</div></div>';
    }
  }

  infoList.innerHTML = bHtml;
  timelineBox.innerHTML = tHtml;
  relationsBox.innerHTML = rHtml;

  document.getElementById('p-top-id').textContent = isGlitchMode ? "ERROR: UNKNOWN" : "ID: " + oc.id.toUpperCase();
  
  renderRadarChart(statsToRender);
  
  if (isToggle !== true) {
    switchView('view-profile');
  } else {
    window.scrollTo(0, 0);
  }
}

function renderRadarChart(stats) {
  var cx = 150, cy = 140, r = 90, maxVal = 6; 
  var keys = Object.keys(stats), n = keys.length;
  var svg = '<svg viewBox="0 0 300 280" style="width:100%; max-width:300px; overflow:visible;">';
  
  for (var level = 1; level <= maxVal; level++) {
    var points = [];
    for (var i = 0; i < n; i++) {
      var angle = (Math.PI * 2 / n) * i - Math.PI / 2;
      var cr = (r * level) / maxVal;
      points.push((cx + cr * Math.cos(angle)) + ',' + (cy + cr * Math.sin(angle)));
    }
    var strokeColor = level === maxVal ? (isGlitchMode ? "rgba(232,226,214,0.3)" : "rgba(94,140,135,0.2)") : (isGlitchMode ? "rgba(232,226,214,0.1)" : "rgba(94,140,135,0.05)");
    svg += '<polygon points="' + points.join(' ') + '" fill="none" stroke="' + strokeColor + '" stroke-width="1" stroke-dasharray="' + (level === maxVal ? '0' : '2 2') + '" />';
  }
  
  for (var i2 = 0; i2 < n; i2++) {
    var angle2 = (Math.PI * 2 / n) * i2 - Math.PI / 2;
    svg += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + r * Math.cos(angle2)) + '" y2="' + (cy + r * Math.sin(angle2)) + '" stroke="' + (isGlitchMode ? 'rgba(232,226,214,0.15)' : 'rgba(94,140,135,0.1)') + '" stroke-width="1" />';
  }
  
  var dataPoints = [];
  for (var i3 = 0; i3 < n; i3++) {
    var cr2 = (r * stats[keys[i3]]) / maxVal;
    var angle3 = (Math.PI * 2 / n) * i3 - Math.PI / 2;
    var x = cx + cr2 * Math.cos(angle3), y = cy + cr2 * Math.sin(angle3);
    dataPoints.push(x + ',' + y);
  }
  
  svg += '<g class="radar-anim-group" style="opacity: 1;">'; // 防止动画卡住，直接显形
  svg += '<polygon points="' + dataPoints.join(' ') + '" fill="' + (isGlitchMode ? 'rgba(204,51,68,0.15)' : 'rgba(181,106,88,0.1)') + '" stroke="' + (isGlitchMode ? '#cc3344' : '#B56A58') + '" stroke-width="1.5" stroke-linejoin="round" />';
  svg += '</g>';
  
  svg += '<g class="radar-text show">'; // 防止文字卡透明，直接显示
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
