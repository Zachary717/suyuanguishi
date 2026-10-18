:root { --bg:#f7f6f1; --paper:#1a1a1a; --muted:#888; --red:#b84040; --green:#4a6255; --line:rgba(26,26,26,.15); }
*{margin:0;padding:0;box-sizing:border-box}
body{ background:var(--bg); color:var(--paper); font-family:"Noto Serif SC",serif; line-height:2; overflow-x:hidden; transition:0.5s; }
.view { display:none; opacity:0; transition:.5s; min-height:100vh; }
.view.active { display:block; opacity:1; }

#view-main { padding: 80px 40px; }
.main-header { text-align: center; margin-bottom: 80px; }
.home-title-img { max-width: 80vw; max-height: 150px; object-fit: contain; }
.directory-wrap { max-width: 900px; margin: 0 auto; }
.dir-header { font-family:"Oswald",sans-serif; font-size:14px; letter-spacing:.4em; color:var(--muted); margin-bottom:40px; display:flex; align-items:center; gap:20px; }
.dir-header::after { content:""; flex:1; height:1px; background:var(--line); }
.list-item { display:flex; align-items:baseline; justify-content:space-between; padding:30px 10px; border-bottom:1px solid var(--line); cursor:pointer; transition:.4s; }
.list-item:hover { padding-left:30px; background:rgba(255,255,255,.4); }
.item-left { display:flex; align-items:baseline; gap:30px; }
.item-index { font-family:"Oswald",sans-serif; font-size:16px; color:var(--muted); width:30px; }
.item-name { font-size:36px; font-weight:900; letter-spacing:.1em; white-space:nowrap; }
.item-title { font-size:13px; color:var(--green); text-align:right; }

#view-profile { padding-bottom: 100px; }
.nav-top { position:fixed; top:0; left:0; right:0; z-index:50; padding:20px 40px; display:flex; justify-content:space-between; mix-blend-mode:difference; }
.back-btn { font-family:"Oswald",sans-serif; font-size:14px; color:#fff; cursor:pointer; letter-spacing:.2em; }
.id-tag { font-family:"Oswald",sans-serif; font-size:12px; color:#fff; }

.glitch-trigger { position:fixed; top:70px; right:40px; z-index:999; width:30px; height:30px; cursor:pointer; opacity:.15; transition:.4s; display:none; }
.glitch-trigger::before, .glitch-trigger::after { content:""; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); border-radius:50%; border:1px solid var(--paper); }
.glitch-trigger::before { width:20px; height:20px; border-style:dashed; }
.glitch-trigger::after { width:10px; height:10px; background:var(--paper); }
.glitch-trigger:hover { opacity:1; transform:rotate(90deg); }

.profile-wrap { max-width:1000px; margin:0 auto; padding:120px 30px 40px; }
.hero-section { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:80px; }
.avatar-box { width:300px; aspect-ratio:3/4; box-shadow:20px 20px 0px rgba(74,98,85,.1); transition:.6s; }
.avatar-box img { width:100%; height:100%; object-fit:cover; transition:.6s; }
.empty-text { display:flex; height:100%; align-items:center; justify-content:center; color:var(--muted); border:1px solid var(--line); }
.hero-text { text-align:right; padding-bottom:20px; }
.p-name { font-size:clamp(60px,10vw,100px); font-weight:900; letter-spacing:.15em; margin-bottom:20px; }
.p-title { font-size:14px; color:var(--green); border-bottom:1px solid var(--line); padding-bottom:10px; margin-bottom:20px; }

.content-grid { display:grid; grid-template-columns:1fr 1fr; gap:80px 60px; position: relative; z-index: 20; }
.sec-title { font-family:"Oswald",sans-serif; font-size:24px; font-weight:200; margin-bottom:30px; display:flex; align-items:center; gap:15px; }
.sec-title::before { content:""; width:20px; height:1px; background:var(--red); }
.sec-title span { font-size:12px; color:var(--muted); font-family:"Noto Serif SC",serif; }

.info-list { display:flex; flex-direction:column; }
.info-item { display:flex; padding:15px 0; border-bottom:1px dashed var(--line); align-items:baseline; }
.info-item .k { width:80px; color:var(--muted); font-size:13px; flex-shrink:0; }
.info-item .v { font-size:15px; font-weight:600; }

.stats-container { padding:20px 0; display:flex; justify-content:flex-start; }
.timeline { position:relative; padding-left:20px; }
.timeline::before { content:""; position:absolute; left:0; top:10px; bottom:10px; width:1px; background:var(--line); }
.tl-item { position:relative; margin-bottom:40px; }
.tl-item::before { content:""; position:absolute; left:-24px; top:8px; width:9px; height:9px; border-radius:50%; border:1px solid var(--green); background:var(--bg); }
.tl-time { font-family:"Oswald",sans-serif; font-size:16px; color:var(--red); margin-bottom:5px; }
.tl-event { font-size:14px; color:var(--muted); line-height:1.8; }

.relations-list { display:flex; flex-direction:column; }
.rel-item { padding:20px 0; border-bottom:1px solid var(--line); display:flex; align-items:baseline; gap:20px; }
.rel-item.has-link { cursor:pointer; }
.rel-name { font-size:18px; font-weight:600; min-width:80px; }
.rel-desc { font-size:13px; color:var(--muted); flex:1; }
footer { margin-top:120px; text-align:center; font-family:"Oswald",sans-serif; font-size:12px; color:var(--muted); position: relative; z-index: 20;}

/* =========================================
   核心硬编码满屏特效，绝对能显示
   ========================================= */
.glitch-overlay { 
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; 
  background: transparent; 
  z-index: 9999;
  display: none; overflow: hidden; pointer-events: none; 
}
body.glitch-mode .glitch-overlay { display: block; }

/* 改用绝对定位铺满 */
.matrix-container { 
  width: 100%; height: 100%; position: absolute; top: 0; left: 0;
  display: flex; flex-wrap: wrap; flex-direction: row-reverse;
  justify-content: flex-start; align-items: flex-start;
}

.matrix-col { 
  writing-mode: vertical-rl; text-orientation: upright;
  font-family: "Noto Serif SC", serif; font-size: 16px; line-height: 1.2; font-weight: 900; 
  color: rgba(255, 0, 0, 0.9);
  text-shadow: 3px 0px 0px rgba(0, 255, 255, 0.8), -3px 0px 0px rgba(255, 0, 0, 0.8); 
  padding: 5px 3px; white-space: nowrap; 
  
  /* 默认直接显示开门杀，防呆设计 */
  animation: entrance 2s ease-out forwards;
}

/* 开门杀 */
@keyframes entrance {
  0% { opacity: 1; transform: scale(1.05); }
  40% { opacity: 0.5; transform: translate(-2px, 2px); }
  70% { opacity: 1; transform: scale(0.98); }
  100% { opacity: 0; transform: scale(1); }
}

/* 基础里世界配色 */
body.glitch-mode {
  --bg: #090a0c; --paper: #e8e2d6; --muted: #6a7a73; --red: #ff0000; --green: #3c7a6b; --line: rgba(232,226,214,.15);
  background-color: var(--bg);
  background-image: repeating-linear-gradient(0deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px);
}
body.glitch-mode .p-name { color: var(--paper); text-shadow: 2px 2px 0px rgba(204,51,68,0.8), -2px -1px 0px rgba(60,122,107,0.8); }
body.glitch-mode .avatar-box { box-shadow: 10px 10px 0px rgba(0,0,0,0.5); border: 1px solid var(--line); opacity: 0.8; }

@media (max-width:768px) {
  #view-main { padding:50px 20px; }
  .list-item { flex-direction:column; align-items:flex-start; gap:8px; padding: 24px 10px; }
  .item-left { width: 100%; gap: 20px; }
  .item-name { font-size:28px; }
  .item-title { font-size:12px; text-align:left; width: 100%; padding-left: 50px; margin-top: -5px;}
  .profile-wrap { padding-top:80px; }
  .hero-section { flex-direction:column; align-items:flex-start; gap:20px; margin-bottom:50px; }
  .avatar-box { width:100%; max-width:200px; }
  .hero-text { align-items:flex-start; text-align:left; padding-bottom:0; width:100%; }
  .content-grid { grid-template-columns:1fr; gap:50px; }
  .glitch-trigger { top:80px; right:20px; }
  .matrix-col { font-size: 14px; }
}
