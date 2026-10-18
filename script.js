alert("测试：JS文件已成功加载！");

window.onload = function() {
  const list = document.getElementById('dir-list');
  if (typeof ocDatabase === 'undefined') {
    list.innerHTML = '<div style="color:red; font-size:20px; padding:20px; border:2px solid red;">❌ data.js 读取失败！请检查 data.js 的格式。</div>';
    return;
  }

  let html = '';
  for(let i=0; i<ocDatabase.length; i++) {
    let oc = ocDatabase[i];
    html += '<div class="list-item" onclick="showProfile(\'' + oc.id + '\')"><div class="item-left"><span class="item-index">0' + (i+1) + '</span><span class="item-name">' + oc.name + '</span></div><div class="item-title">' + oc.title + '</div></div>';
  }
  list.innerHTML = html;
}
