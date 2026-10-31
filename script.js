window.onload = function() {
  var list = document.getElementById('dir-list');
  
  if (!list) {
    alert("找不到列表容器，请检查 index.html");
    return;
  }

  if (typeof ocDatabase === 'undefined') {
    list.innerHTML = '❌ data.js 读取失败，请检查文件是否存在';
    return;
  }

  var html = '';
  for (var i = 0; i < ocDatabase.length; i++) {
    var oc = ocDatabase[i];
    // 最简单的数字补零
    var num = (i + 1) < 10 ? '0' + (i + 1) : (i + 1);
    
    // 只用最基础的单引号拼接
    html += '<div class="list-item" onclick="showProfile(\'' + oc.id + '\')">' +
              '<div class="item-index">' + num + '</div>' +
              '<div class="item-name">' + oc.name + '</div>' +
              '<div class="item-title">' + oc.title + '</div>' +
            '</div>';
  }
  
  list.innerHTML = html;
};

// 提供一个空函数防止点击报错
function showProfile(id) {
  alert("点击了角色: " + id + "\n(说明基础渲染成功！)");
}
