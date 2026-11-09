/*
  作者：赵予萌
  建立时间：2026-11-04 13:42:42
  使用大模型：GLM-5.3-Flash
  功能名称：新闻选项卡（可复用组件）
*/

// 功能：初始化一组选项卡，为选项卡容器绑定点击监听事件；可对页面中任意 .zym_tabs 容器复用
function zym_initTabs(zym_tabBar) {
  var zym_tabs = zym_tabBar.querySelectorAll('.zym_tab');

  // 监听事件：事件委托，点击任意选项卡按钮时触发切换
  zym_tabBar.addEventListener('click', function (zym_event) {
    var zym_target = zym_event.target.closest('.zym_tab');
    if (!zym_target) { return; }
    zym_switchTab(zym_tabs, zym_target);
  });
}

// 功能：先清除所有选项卡（及对应面板）的选中状态，然后再设置当前元素的选中状态
function zym_switchTab(zym_tabs, zym_current) {
  // 第一步：清除所有选项卡的选中状态
  zym_tabs.forEach(function (zym_tab) {
    zym_tab.classList.remove('zym_active');
  });

  // 第二步：清除所有内容面板的选中状态
  document.querySelectorAll('.zym_panel').forEach(function (zym_panel) {
    zym_panel.classList.remove('zym_active');
  });

  // 第三步：设置当前元素的选中状态，并显示对应面板
  zym_current.classList.add('zym_active');
  var zym_panelId = zym_current.getAttribute('data-zym-tab');
  var zym_panel = document.getElementById(zym_panelId);
  if (zym_panel) { zym_panel.classList.add('zym_active'); }
}

// 功能：页面加载后，初始化页面上所有选项卡容器（可复用入口）
document.querySelectorAll('.zym_tabs').forEach(function (zym_tabBar) {
  zym_initTabs(zym_tabBar);
});
