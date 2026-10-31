window.onload = function() {
  var list = document.getElementById('dir-list');
  if (typeof ocDatabase === 'undefined') {
    list.innerHTML = '<div style="color:red; text-align:center;">data.js 读取失败！</div>';
    return;
  }
  var html = '';
  for(var i=0; i<ocDatabase.length; i++) {
    var oc = ocDatabase[i];
    var num = (i + 1).toString().padStart(2, '0');
    html += '<div class="list-item reveal" onclick="showProfile(\'' + oc.id + '\')"><div class="item-index">' + num + '</div><div class="item-name">' + oc.name + '</div><div class="item-title">' + oc.title + '</div></div>';
  }
  list.innerHTML = html;
  
  setupObserver();
  setTimeout(function(){ 
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('active'); }); 
  }, 100);

  var btn = document.getElementById('glitch-btn');
  if (btn) {
    var warning = document.createElement('div');
    warning.className = 'epilepsy-warning';
    warning.innerHTML = '光敏性癫痫患者请勿点击';
    btn.parentNode.insertBefore(warning, btn);
    var observerBtn = new MutationObserver(function() {
      warning.style.display = (btn.style.display === 'block') ? 'block' : 'none';
    });
    observerBtn.observe(btn, { attributes: true, attributeFilter: ['style'] });
  }

  var ticketEgg = document.getElementById('ticket-egg');
  if (ticketEgg) {
    ticketEgg.addEventListener('click', function() {
      this.classList.toggle('show');
    });
  }
};

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
  document.querySelectorAll('.view').forEach(function(v) {
    v.classList.remove('active');
    v.style.display = 'none';
  });
  var target = document.getElementById(viewId);
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
    var container = document.getElementById('glitch-matrix');
    container.innerHTML = '<div class="glitch-text-box">此恨何时已。滴空阶、寒更雨歇，葬花天气。<br><br>重泉若有双鱼寄。好知他、年来苦乐，与谁相倚。</div>';
    setTimeout(function(){ container.innerHTML = ''; }, 1200);
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
  for(var i=0; i<ocDatabase.length; i++){ if(ocDatabase[i].id === id) oc = ocDatabase[i]; }
  if(!oc) return;

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
  avatarBox.innerHTML = currentAvatar ? '<img src="' + currentAvatar + '">' : '无图';

  var statsToRender = oc.stats;
  var pName = document.getElementById('p-name');
  var pTitle = document.getElementById('p-title');
  var infoList = document.getElementById('p-info-list');
  var timelineBox = document.getElementById('p-timeline');
  var relationsBox = document.getElementById('p-relations');

  if (id === 'yeyao' && isGlitchMode) {
    document.getElementById('glitch-btn').style.display = 'block';
    if (oc.mutated_stats) statsToRender = oc.mutated_stats;
    pName.textContent = "叶 瑶 ？";
    pTitle.textContent = "是我做错了吗?";
    
    var bHtml = '';
    oc.mutated_basic.forEach(function(b, i){ bHtml += '<div class="info-item delay-item" style="transition-delay:' + (i*0.1) + 's"><div class="k">' + b.k + '</div><div class="v">' + b.v + '</div></div>'; });
    infoList.innerHTML = bHtml;
    
    var tHtml = '';
    oc.mutated_timeline.forEach(function(t, i){ tHtml += '<div class="tl-item delay-item" style="transition-delay:' + (i*0.1) + 's"><div class="tl-time">' + t.time + '</div><div class="tl-event">' + t.event + '</div></div>'; });
    timelineBox.innerHTML = tHtml;
    
    var rHtml = '';
    oc.mutated_relations.forEach(function(r, i){ rHtml += '<div class="rel-item delay-item" style="transition-delay:' + (i*0.1) + 's"><div class="rel-name">' + r.name + '</div><div class="rel-desc" style="color:red;">' + r.desc + '</div></div>'; });
    relationsBox.innerHTML = rHtml;

  } else {
    document.getElementById('glitch-btn').style.display = (id === 'yeyao') ? 'block' : 'none';
    pName.textContent = oc.name;
    pTitle.textContent = oc.title;
    
    var bHtml2 = '';
    oc.basic.forEach(function(b, i){ bHtml2 += '<div class="info-item delay-item" style="transition-delay:' + (i*0.1) + 's"><div class="k">' + b.k + '</div><div class="v">' + b.v + '</div></div>'; });
    infoList.innerHTML = bHtml2;
    
    var tHtml2 = '';
    oc.timeline.forEach(function(t, i){ tHtml2 += '<div class="tl-item delay-item" style="transition-delay:' + (i*0.1) + 's"><div class="tl-time">' + t.time + '</div><div class="tl-event">' + t.event + '</div></div>'; });
    timelineBox.innerHTML = tHtml2;
    
    var rHtml2 = '';
    oc.relations.forEach(function(r, i){ 
      var hasLink = false;
      for(var j=0; j<ocDatabase.length; j++){ if(ocDatabase[j].id === r.id && r.id !== '') hasLink = true; }
      var clickAttr = hasLink ? 'onclick="showProfile(\'' + r.id + '\')"' : '';
      rHtml2 += '<div class="rel-item delay-item ' + (hasLink?'has-link':'') + '" style="transition-delay:' + (i*0.1) + 's" ' + clickAttr + '><div class="rel-name">' + r.name + '</div><div class="rel-desc">' + r.desc + '</div></div>';
    });
    relationsBox.innerHTML = rHtml2;
  }
  
  document.getElementById('p-top-id').textContent = isGlitchMode ? "ERROR: UNKNOWN" : "ID: " + oc.id.toUpperCase();
  renderRadarChart(statsToRender);
  
  if (isToggle !== true) switchView('view-profile');
  else window.scrollTo(0, 0);
  
  var radarContainer = document.getElementById('p-stats');
  radarContainer.classList.remove('active');
  document.querySelectorAll('.delay-item').forEach(function(el){ el.classList.remove('active'); });
  var textGroup = radarContainer.querySelector('.radar-text');
  if (textGroup) textGroup.classList.remove('show');
  void radarContainer.offsetWidth; 

  setTimeout(function() {
    observer.observe(radarContainer);
    document.querySelectorAll('.delay-item').forEach(function(el){ observer.observe(el); });
  }, 100);
}

function animateRadarLines(group, textGroup) {
  var circles = group.querySelectorAll('circle');
  var poly = group.querySelector('polygon');
  var targets = [];
  var cx = 150, cy = 140;
  group.style.opacity = 0;
  circles.forEach(function(c) {
    var tx = parseFloat(c.getAttribute('data-tx'));
    var ty = parseFloat(c.getAttribute('data-ty'));
    var distance = Math.hypot(tx - cx, ty - cy);
    targets.push({ el: c, tx: tx, ty: ty, distance: distance });
  });
  var speed = Math.hypot(90, 0) / 800; 
  var startTime = performance.now();
  circles.forEach(function(c) { c.setAttribute('cx', cx); c.setAttribute('cy', cy); });
  poly.setAttribute('points', cx + ',' + cy + ' ' + cx + ',' + cy + ' ' + cx + ',' + cy + ' ' + cx + ',' + cy + ' ' + cx + ',' + cy + ' ' + cx + ',' + cy);
  group.style.opacity = 1;
  function update(now) {
    var elapsed = now - startTime;
    var currentPoints = [];
    var allFinished = true;
    targets.forEach(function(t) {
      var progress = Math.min(elapsed / (t.distance / speed), 1);
      if (progress < 1) allFinished = false; 
      var currentX = cx + (t.tx - cx) * progress;
      var currentY = cy + (t.ty - cy) * progress;
      t.el.setAttribute('cx', currentX);
      t.el.setAttribute('cy', currentY);
      currentPoints.push(currentX + ',' + currentY);
    });
    poly.setAttribute('points', currentPoints.join(' '));
    if (!allFinished) requestAnimationFrame(update);
    else textGroup.classList.add('show');
  }
  requestAnimationFrame(update);
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
    var key = keys[i4], cr3 = (r * stats[key]) / maxVal;
    var angle4 = (Math.PI * 2 / n) * i4 - Math.PI / 2;
    var lx = cx + (r + 20) * Math.cos(angle4), ly = cy + (r + 20) * Math.sin(angle4);
    var textAnchor = Math.cos(angle4) > 0.1 ? "start" : (Math.cos(angle4) < -0.1 ? "end" : "middle");
    svg += '<text x="' + lx + '" y="' + ly + '" fill="' + (isGlitchMode ? '#e8e2d6' : '#2E3A35') + '" font-size="12" font-family="Noto Serif SC" font-weight="600" text-anchor="' + textAnchor + '" dominant-baseline="middle">' + key + '</text>';
    svg += '<text x="' + lx + '" y="' + (ly + 16) + '" fill="' + (isGlitchMode ? '#6a7a73' : '#5E8C87') + '" font-size="11" font-family="Oswald" text-anchor="' + textAnchor + '" dominant-baseline="middle">' + stats[key] + ' / 6</text>';
  }
  svg += '</g>';
  
  document.getElementById('p-stats').innerHTML = svg + '</svg>';
}
