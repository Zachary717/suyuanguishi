/* 俗缘诡事 · 主逻辑（v2.7） */
window.onload = function () {
  var inner = document.getElementById('cards-inner');
  var scrollBox = document.getElementById('cards-scroll');
  
  if (!inner || !scrollBox) return;
  if (typeof ocDatabase === 'undefined') return;

  // 1. 生成卡片
  var html = '';
  for (var i = 0; i < ocDatabase.length; i++) {
    var oc = ocDatabase[i];
    var avatarTag = oc.avatar
      ? '<img class="item-avatar" src="' + oc.avatar + '" alt="" onerror="this.remove()">'
      : '';
    html += '<div class="list-item" data-id="' + oc.id + '" onclick="showProfile(\'' + oc.id + '\')">' +
              '<div class="item-index">No.' + String(i + 1).padStart(2, '0') + '</div>' +
              avatarTag +
              '<div class="item-name">' + oc.name + '</div>' +
              '<div class="item-title">' + oc.title + '</div>' +
            '</div>';
  }
  inner.innerHTML = html;

  // 2. 滑动与拖拽
  var isExpanded = false;
  scrollBox.addEventListener('scroll', function () {
    var sl = scrollBox.scrollLeft;
    var max = scrollBox.scrollWidth - scrollBox.clientWidth;
    var expanded = !(sl <= 2 || sl >= max - 2);
    if (expanded !== isExpanded) {
      isExpanded = expanded;
      inner.classList.toggle('is-sliding', expanded);
    }
  });

  var isDown = false, startX = 0, scrollLeft = 0;
  scrollBox.addEventListener('mousedown', function (e) {
    isDown = true; startX = e.pageX - scrollBox.offsetLeft; scrollLeft = scrollBox.scrollLeft;
  });
  window.addEventListener('mousemove', function (e) {
    if (!isDown) return;
    e.preventDefault();
    var x = e.pageX - scrollBox.offsetLeft;
    scrollBox.scrollLeft = scrollLeft - (x - startX) * 1.5;
  });
  window.addEventListener('mouseup', function () { isDown = false; });

  setupObserver();
  setupReveal();
};

function setupReveal() {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
}

var isGlitchMode = false;
var currentActiveId = "";
var observer;

function setupObserver() {
  observer = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        if (entry.target.id === 'p-stats') {
          var radarData = entry.target.querySelector('.radar-anim-group');
          var radarText = entry.target.querySelector('.radar-text');
          if (radarData && !radarData.dataset.done) {
            radarData.dataset.done = '1';
            animateRadarLines(radarData, radarText);
          }
        }
        obs.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -50px 0px', threshold: 0.1 });
}

// 【核心修复】去掉了所有 overflow: hidden，用最温和的方式归零
function switchView(viewId) {
  document.querySelectorAll('.view').forEach(function (v) {
    v.classList.remove('active'); 
    v.style.display = 'none';
  });
  
  var target = document.getElementById(viewId);
  if (target) { 
    target.classList.add('active'); 
    target.style.display = 'block'; 
  }
  
  // 平滑回到顶部
  window.scrollTo({ top: 0, behavior: 'instant' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  if (viewId === 'view-main') exitGlitch();
}

function exitGlitch() {
  document.body.classList.remove('glitch-mode');
  isGlitchMode = false;
  var matrix = document.getElementById('glitch-matrix');
  if (matrix) matrix.innerHTML = '';
}

function toggleGlitch() {
  isGlitchMode = !isGlitchMode;
  document.body.classList.toggle('glitch-mode', isGlitchMode);
  var matrix = document.getElementById('glitch-matrix');
  if (matrix) matrix.innerHTML = '';
  
  if (isGlitchMode && matrix) {
    var poem = "此恨何时已。滴空阶、寒更雨歇，葬花天气。三载悠悠魂梦杳，是梦久应醒矣。料也觉、人间无味。不及夜台尘土隔，清冷冷、一片埋愁地。钗钿约，竟抛弃。<br><br>重泉若有双鱼寄。好知他、年来苦乐，与谁相倚。我自中宵成转侧，忍听湘弦重理。待结个、他生知己。还怕两人俱薄命，再缘悭、剩月零风里。清泪尽，纸灰起。";
    var flatPoem = poem.replace(/<br>/g, ' ');
    
    matrix.innerHTML = '<div class="glitch-text-box" data-text="' + flatPoem + '">' + poem + '</div>';
    setTimeout(function () { matrix.innerHTML = ''; }, 1500);
  }
  showProfile(currentActiveId, true);
}

function showProfile(id, isToggle) {
  if (isToggle !== true) { currentActiveId = id; exitGlitch(); }

  var oc = ocDatabase.find(function (o) { return o.id === id; });
  if (!oc) return;

  var btn = document.getElementById('glitch-btn');
  if (btn) btn.style.display = (id === 'yeyao') ? 'block' : 'none';

  var avatarBox = document.getElementById('p-avatar-box');
  var currentAvatar = (isGlitchMode && oc.mutated_avatar) ? oc.mutated_avatar : oc.avatar;
  var firstChar = (oc.name || '?').replace(/\s/g, '').charAt(0);

  if (currentAvatar) {
    avatarBox.innerHTML = '<img src="' + currentAvatar + '" alt="' + oc.name + '" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';">' +
                          '<div class="placeholder" style="display:none;">' + firstChar + '</div>';
  } else {
    avatarBox.innerHTML = '<div class="placeholder">' + firstChar + '</div>';
  }

  var isMutated = (id === 'yeyao' && isGlitchMode);
  var statsToRender = isMutated && oc.mutated_stats ? oc.mutated_stats : oc.stats;
  var basicData = isMutated ? oc.mutated_basic : oc.basic;
  var timelineData = isMutated ? oc.mutated_timeline : oc.timeline;
  var relationsData = isMutated ? oc.mutated_relations : oc.relations;

  document.getElementById('p-name').textContent = isMutated ? '叶 瑶 ？' : oc.name;
  document.getElementById('p-title').textContent = isMutated ? '是我做错了吗?' : oc.title;

  var bHtml = '';
  (basicData || []).forEach(function (b, i) {
    bHtml += '<div class="info-item delay-item" style="transition-delay:' + (i * 0.1) + 's">' +
             '<div class="k">' + b.k + '</div><div class="v">' + b.v + '</div></div>';
  });
  document.getElementById('p-info-list').innerHTML = bHtml;

  var tHtml = '';
  (timelineData || []).forEach(function (t, i) {
    var color = isMutated ? 'style="color:#ff2a2a;"' : '';
    tHtml += '<div class="tl-item delay-item" style="transition-delay:' + (i * 0.1) + 's">' +
             '<div class="tl-time" ' + color + '>' + t.time + '</div>' +
             '<div class="tl-event">' + t.event + '</div></div>';
  });
  document.getElementById('p-timeline').innerHTML = tHtml;

  var rHtml = '';
  if (relationsData && relationsData.length) {
    relationsData.forEach(function (rel, i) {
      var hasLink = !isMutated && ocDatabase.some(function (o) { return o.id === rel.id && rel.id; });
      var clickStr = hasLink ? 'onclick="showProfile(\'' + rel.id + '\')"' : '';
      var descStyle = isMutated ? 'style="color:#ff2a2a;"' : '';
      rHtml += '<div class="rel-item delay-item ' + (hasLink ? 'has-link' : '') + '" style="transition-delay:' + (i * 0.1) + 's" ' + clickStr + '>' +
               '<div class="rel-name">' + rel.name + '</div>' +
               '<div class="rel-desc" ' + descStyle + '>' + rel.desc + '</div></div>';
    });
  } else {
    rHtml = '<div style="color:var(--muted);font-size:14px;">暂无羁绊记录</div>';
  }
  document.getElementById('p-relations').innerHTML = rHtml;

  document.getElementById('p-top-id').textContent = isGlitchMode ? 'ERROR' : 'ID: ' + oc.id.toUpperCase();
  renderRadarChart(statsToRender || {});

  if (isToggle !== true) switchView('view-profile');
  else window.scrollTo({ top: 0, behavior: 'instant' });

  var radarContainer = document.getElementById('p-stats');
  radarContainer.classList.remove('active');
  var delayItems = document.querySelectorAll('.delay-item');
  delayItems.forEach(function (el) { el.classList.remove('active'); });
  
  var radarGroup = radarContainer.querySelector('.radar-anim-group');
  var textGroup = radarContainer.querySelector('.radar-text');
  if (textGroup) textGroup.classList.remove('show');
  
  if (radarGroup) {
    radarGroup.style.opacity = 0;
    delete radarGroup.dataset.done; 
  }
  void radarContainer.offsetWidth;

  setTimeout(function () {
    if (observer) {
      delayItems.forEach(function (el) { observer.observe(el); });
      observer.observe(radarContainer);
    }
  }, 250);
}

function animateRadarLines(group, textGroup) {
  var circles = group.querySelectorAll('circle');
  var poly = group.querySelector('polygon');
  var cx = 150, cy = 140;
  var targets = [];
  
  group.style.opacity = 1;
  group.style.transition = 'none';

  circles.forEach(function (c) {
    var tx = parseFloat(c.getAttribute('data-tx'));
    var ty = parseFloat(c.getAttribute('data-ty'));
    targets.push({ el: c, tx: tx, ty: ty, distance: Math.hypot(tx - cx, ty - cy) });
  });
  var speed = 90 / 800;
  var startTime = performance.now();

  circles.forEach(function (c) { c.setAttribute('cx', cx); c.setAttribute('cy', cy); });
  poly.setAttribute('points', Array(circles.length + 1).join(cx + ',' + cy + ' ').trim());

  function update(now) {
    var elapsed = now - startTime;
    var currentPoints = [], allFinished = true;
    targets.forEach(function (t) {
      var progress = Math.min(elapsed / (t.distance / speed), 1);
      if (progress < 1) allFinished = false;
      var x = cx + (t.tx - cx) * progress;
      var y = cy + (t.ty - cy) * progress;
      t.el.setAttribute('cx', x); t.el.setAttribute('cy', y);
      currentPoints.push(x + ',' + y);
    });
    poly.setAttribute('points', currentPoints.join(' '));
    if (!allFinished) {
      requestAnimationFrame(update);
    } else {
      if (textGroup) textGroup.classList.add('show');
    }
  }
  requestAnimationFrame(update);
}

function renderRadarChart(stats) {
  var cx = 150, cy = 140, r = 90, maxVal = 6;
  var keys = Object.keys(stats), n = keys.length;
  if (!n) { document.getElementById('p-stats').innerHTML = ''; return; }

  var dark = isGlitchMode;
  var stroke = dark ? '#ff2a2a' : '#B56A58';
  var dotFill = dark ? '#090a0c' : '#F1F0E8';
  var labelFill = dark ? '#e8e2d6' : '#2E3A35';
  var valFill = dark ? '#6a7a73' : '#5E8C87';

  var svg = '<svg viewBox="0 0 300 280" style="width:100%;max-width:300px;overflow:visible;">';

  for (var level = 1; level <= maxVal; level++) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var a = (Math.PI * 2 / n) * i - Math.PI / 2;
      var cr = (r * level) / maxVal;
      pts.push((cx + cr * Math.cos(a)) + ',' + (cy + cr * Math.sin(a)));
    }
    svg += '<polygon points="' + pts.join(' ') + '" fill="none" stroke="' +
           (level === maxVal ? 'rgba(94,140,135,0.3)' : 'rgba(94,140,135,0.1)') +
           '" stroke-width="1" stroke-dasharray="' + (level === maxVal ? '0' : '2 2') + '"/>';
  }
  for (var j = 0; j < n; j++) {
    var a2 = (Math.PI * 2 / n) * j - Math.PI / 2;
    svg += '<line x1="' + cx + '" y1="' + cy + '" x2="' + (cx + r * Math.cos(a2)) +
           '" y2="' + (cy + r * Math.sin(a2)) + '" stroke="rgba(94,140,135,0.1)"/>';
  }

  var dataPoints = [], circles = '';
  for (var k = 0; k < n; k++) {
    var cr2 = (r * stats[keys[k]]) / maxVal;
    var a3 = (Math.PI * 2 / n) * k - Math.PI / 2;
    var x = cx + cr2 * Math.cos(a3), y = cy + cr2 * Math.sin(a3);
    dataPoints.push(x + ',' + y);
    circles += '<circle data-tx="' + x + '" data-ty="' + y + '" cx="' + x + '" cy="' + y +
               '" r="2.5" fill="' + dotFill + '" stroke="' + stroke + '" stroke-width="1.5"/>';
  }
  
  svg += '<g class="radar-anim-group" style="opacity:0;">' +
         '<polygon points="' + dataPoints.join(' ') + '" fill="' + (dark ? 'rgba(255,42,42,0.15)' : 'rgba(181,106,88,0.1)') +
         '" stroke="' + stroke + '" stroke-width="1.5" stroke-linejoin="round"/>' + circles + '</g>';

  svg += '<g class="radar-text">';
  for (var m = 0; m < n; m++) {
    var a4 = (Math.PI * 2 / n) * m - Math.PI / 2;
    var lx = cx + (r + 20) * Math.cos(a4), ly = cy + (r + 20) * Math.sin(a4);
    var anchor = Math.cos(a4) > 0.1 ? 'start' : (Math.cos(a4) < -0.1 ? 'end' : 'middle');
    svg += '<text x="' + lx + '" y="' + ly + '" fill="' + labelFill + '" font-size="12" font-family="Noto Serif SC" font-weight="600" text-anchor="' + anchor + '" dominant-baseline="middle">' + keys[m] + '</text>';
    svg += '<text x="' + lx + '" y="' + (ly + 16) + '" fill="' + valFill + '" font-size="11" font-family="Oswald" text-anchor="' + anchor + '" dominant-baseline="middle">' + stats[keys[m]] + ' / 6</text>';
  }
  svg += '</g></svg>';

  document.getElementById('p-stats').innerHTML = svg;
}
