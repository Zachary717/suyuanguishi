const ocDatabase = [
  {
    id: "liangqing",
    name: "梁 青",
    avatar: "liangqing.jpg",
    title: "民俗学专业大学生 / 半吊子风水师",
    basic: [
      { k: "性别", v: "男" },
      { k: "年龄", v: "21" },
      { k: "身高", v: "178cm" },
      { k: "能力", v: "您貌似什么都不会呢" },
      { k: "生日", v: "10月3日" }
    ],
    personality: "外向健谈乐天派，校园风云人物。喜好电子游戏、篮球、漫画以及和女孩子聊天。好奇心极重，胆子出奇小。同时还是久经情场的处男一枚。",
    timeline: [
      { time: "出生", event: "父母的拍卖行蒸蒸日上，没有多余的精力能够分给他。被送往农村奶奶家抚养。" },
      { time: "6岁", event: "在村中落水高烧五日不退。被原行逸所救，拜入门下。" },
      { time: "21岁", event: "在广东就读民俗学专业。" }
    ],
    relations: [
      { name: "原行逸", id: "yuanxingyi", desc: "名义上的师父。随时可以讨要法器的哆啦x梦。" },
      { name: "婴红", id: "yinghong", desc: "前女友，现同行？" },
      { name: "梁君怡", id: "", desc: "奶奶。已离世。" }
    ],
    stats: { 力量: 3, 敏捷: 5, 体质: 3, 智力: 5, 意志: 3, 幸运: 1 }
  },
  {
    id: "yuanxingyi",
    name: "原行逸",
    avatar: "yuanxingyi.jpg",
    title: "人仙 / 还俗散人",
    basic: [
      { k: "性别", v: "男" },
      { k: "年龄", v: "106" },
      { k: "身高", v: "182cm" },
      { k: "原名", v: "许天成" }
    ],
    personality: "随心所欲，慵懒随性。与时俱进的非传统意义老古董。",
    timeline: [{ time: "无记录", event: "暂无详细生平轨迹" }],
    relations: [
      { name: "梁青", id: "liangqing", desc: "吃白饭的徒弟。因为某种原因，并不想斥责他不学无术。" },
      { name: "沈秀菊", id: "shenxiuju", desc: "红颜知己。" }
    ],
    stats: { 力量: 6, 敏捷: 6, 体质: 6, 智力: 5, 意志: 4, 幸运: 3 }
  },
  {
    id: "yeruan",
    name: "叶 阮",
    avatar: "yeruan.jpg",
    title: "山中妖道",
    basic: [
      { k: "性别", v: "男" },
      { k: "享年", v: "26" },
      { k: "身高", v: "约190cm" }
    ],
    personality: "说话之乎者也，行为习惯相当原始。是一个脱离人的视角的存在。情感反应、语言系统、认知方式都和正常人不一样。像野兽。读经但不往脑子里去，只惦念成仙。",
    timeline: [{ time: "无记录", event: "暂无详细生平轨迹" }],
    relations: [{ name: "叶瑶", id: "yeyao", desc: "家人。" }],
    stats: { 力量: 5, 敏捷: 6, 体质: 5, 智力: 2, 意志: 1, 幸运: 5 }
  },
  {
    id: "yeyao",
    name: "叶 瑶",
    avatar: "yeyao.jpg",
    title: "苗医",
    basic: [
      { k: "性别", v: "女" },
      { k: "享年", v: "17" },
      { k: "身高", v: "156cm" },
      { k: "原名", v: "李招娣" }
    ],
    personality: "无记录",
    timeline: [{ time: "无记录", event: "暂无详细生平轨迹" }],
    relations: [
      { name: "叶阮", id: "yeruan", desc: "活着的理由。" },
      { name: "原行逸", id: "yuanxingyi", desc: "敌人。" }
    ],
    stats: { 力量: 3, 敏捷: 4, 体质: 2, 智力: 5, 意志: 3, 幸运: 4 },
    
    // --- 里世界专属数据 ---
    mutated_avatar: "yeyao_mutated.jpg", 
    mutated_basic: [
      { k: "状态", v: "已逝" },
      { k: "执念", v: "我们 要一起活下去" }
    ],
    mutated_timeline: [
      { time: "死后", event: "盘踞槐吟山，掠魂夺魄。" }
    ],
    mutated_relations: [
      { name: "叶阮", desc: "我爱你。" }
    ],
    mutated_stats: { 力量: 6, 敏捷: 6, 体质: 6, 智力: 3, 意志: 0, 幸运: 0 }
  },
  {
    id: "shenxiuju",
    name: "沈秀菊",
    avatar: "",
    title: "八路军",
    basic: [{ k: "性别", v: "女" }],
    personality: "无记录",
    timeline: [{ time: "无记录", event: "暂无详细生平轨迹" }],
    relations: [{ name: "原行逸", id: "yuanxingyi", desc: "莫逆之交。" }],
    stats: { 力量: 5, 敏捷: 3, 体质: 6, 智力: 4, 意志: 6, 幸运: 3 }
  },
  {
    id: "luoan",
    name: "罗 安",
    avatar: "luoan.jpg",
    title: "彝族苏尼",
    basic: [
      { k: "性别", v: "女" },
      { k: "年龄", v: "24" },
      { k: "身高", v: "172cm" }
    ],
    personality: "无记录",
    timeline: [{ time: "无记录", event: "暂无详细生平轨迹" }],
    relations: [{ name: "？？", id: "", desc: "妹妹。她的手足、她的珍宝。" }],
    stats: { 力量: 6, 敏捷: 4, 体质: 5, 智力: 4, 意志: 6, 幸运: 3 }
  },
  {
    id: "yinghong",
    name: "婴 红",
    avatar: "yinghong.jpg",
    title: "民间法师",
    basic: [
      { k: "性别", v: "女" },
      { k: "年龄", v: "21" },
      { k: "身高", v: "168cm" }
    ],
    personality: "无记录",
    timeline: [{ time: "无记录", event: "暂无详细生平轨迹" }],
    relations: [{ name: "梁青", id: "liangqing", desc: "倒霉没用但好玩的前男友。" }],
    stats: { 力量: 5, 敏捷: 5, 体质: 4, 智力: 5, 意志: 4, 幸运: 6 }
  }
];
