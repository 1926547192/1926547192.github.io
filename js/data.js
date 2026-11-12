/* ============================================================
 * 《阙下归人》· 剧情数据（序幕·昏沉梦 → 第一幕·射天狼）
 * ------------------------------------------------------------
 * 依据《阙下归人》.docx 文字脚本整理。
 * 括号待定项的取舍（已在脚本中落定）：
 *   · 「在下（我）」            → 取「在下」
 *   · 「到底是破绽还是陷阱？」  → 取「陷阱」
 *   · 转场画面                 → 取「电视雪花」（程序实现）
 *   · 战争场面                 → 取「直接跳转」，最终定格庆功宴饮
 * 注：原文「若君能替我们重识」按上下文微调为「替我重识」。
 * ============================================================ */

/* ---------- 证据定义 ----------
 * 每个证据对应证据册的某一页。line 上的 evidence 字段指向这里的 id。
 * historyNote 为史料小注（不剧透身份）。 */
const EVIDENCE_DEFS = {
  'act1-exp': {
    page: '经历',
    title: '随班固征讨匈奴',
    text: '墓主曾随班固征讨匈奴，献火攻烧粮、声东击西之策大破敌军。班固赞道：“这次获胜可多亏了你的谋略！”并愿班师回朝后为其请旨封官。',
    source: '第一幕·射天狼',
    historyNote: '史实小注：墓主随班固征讨匈奴、以谋略立功，于史有载；本幕的具体谋划与冲突为虚构。',
  },
  'act1-char': {
    page: '品格',
    title: '刚直不屈',
    text: '班固劝墓主：“官场阴翳，不似战场……脱身是需要圆滑的身段。”墓主却答：“冯某甘愿因棱角遭残，情愿为正道殉身。”——性情刚直，宁折不弯。',
    source: '第一幕·射天狼',
  },
};

/* ---------- 出场角色 ---------- */
const CHAR_DEFS = {
  tourist:  { name: '游客',    color: '#9fd0ff' },
  oldlady:  { name: '老婆婆',  color: '#d9b38c' },
  stranger: { name: '失忆男子', color: '#e8dfc8' },
  bangu:    { name: '班固',    color: '#d8b070' },
};

/* ---------- 主流程脚本 ----------
 * 节点类型：
 *  intertitle 幕间字幕 | scene 对白场景 | interact 交互卡 | minigame 小游戏
 *  observe 观察教学 | scare 惊吓 | item 获得道具 | book 证据册教学
 *  listen 聆听声波 | transition 转场 | artifact 文物原型卡 | warpanel 定格占位
 *  review 剧情回顾（探案模式专用） | ending 结局结算
 * ============================================================ */

const SCRIPT = [
  /* ================= 序幕 · 昏沉梦 ================= */
  { type: 'intertitle', title: '序幕', sub: '昏沉梦', hint: '' },

  /* --- 街角 · 买火柴 --- */
  {
    type: 'scene', id: 'street', bg: 'bg-street',
    chars: [{ id: 'oldlady', slot: 'left', asset: 'char-oldlady' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { cls: 'narration', name: '旁白', text: '清晨，你刚醒出门，被叫住了。' },
      { speaker: 'oldlady', pose: null, text: '小姑娘/小伙子，买上点火柴吧，阴天可以驱寒呐。' },
      { cls: 'thought', name: '内心想法', text: '什么年代了还用火柴？算了，老人家年纪大了，买些算积德了。' },
    ],
  },
  {
    type: 'interact', id: 'buy-match',
    title: '购买火柴', asset: 'item-match',
    desc: '老婆婆颤巍巍地递来一盒火柴。',
    button: '买下火柴', items: ['火柴'],
    toast: '获得道具：火柴 ×1',
    hint: '点击按钮完成交互',
  },

  /* --- 大巴 · 入梦 --- */
  {
    type: 'scene', id: 'bus', bg: 'bg-bus',
    hint: '点击画面或按空格推进对话',
    lines: [
      { cls: 'narration', name: '旁白', text: '你脸贴着车窗。昨夜熬得太狠，早上为了搭上这趟去看汉阙的车又起得早，非常困倦，不知不觉就睡了过去……' },
      { cls: 'narration', name: '旁白', text: '于是你见证了一场免于遗忘的梦。' },
    ],
  },
  { type: 'transition', effect: 'fade', text: '' },

  /* --- 墓室 · 点火教学 --- */
  {
    type: 'scene', id: 'tomb-dark', bg: 'bg-tomb', dark: true,
    hint: '……太暗了。点亮光源。',
    lines: [
      { cls: 'narration', name: '旁白', text: '再次睁眼，你已到了一处很昏暗的墓室。四周漆黑，什么也看不清。' },
      { cls: 'narration', name: '旁白', text: '（左上角浮现提示：点亮光源。）' },
    ],
  },
  { type: 'minigame', id: 'strike-match', hint: '按住火柴，沿砂皮向右滑动，擦燃点亮' },
  {
    type: 'scene', id: 'tomb-lit', bg: 'bg-tomb', dark: true, light: 'match',
    hint: '移动鼠标（手指），用火光照亮四周，观察可疑之处',
    lines: [
      { cls: 'narration', name: '旁白', text: '微弱的火光在指尖摇曳，勉强照亮了周身一圈。' },
      { cls: 'narration', name: '旁白', text: '趁火柴未熄，四处看看吧——墓室里似乎有几处值得留意的地方。' },
    ],
  },
  {
    type: 'observe', id: 'tomb-observe', light: 'match',
    hint: '点击发亮的光点进行观察（共 3 处）',
    points: [
      { x: 22, y: 34, label: '墓壁铭文', text: '斑驳的石壁上刻着模糊的汉隶。火光一晃，字迹又隐入黑暗。' },
      { x: 70, y: 60, label: '陶罐', text: '角落倒着几只陶罐，蒙着厚厚的尘土——大约千余年无人动过了。' },
      { x: 46, y: 76, label: '棺椁轮廓', text: '远处一具棺椁的轮廓若隐若现……你还是别凑太近了。' },
    ],
  },
  { type: 'scare', hint: '' },

  /* --- 墓室 · 冯焕现身对话 --- */
  {
    type: 'scene', id: 'meet', bg: 'bg-tomb', dark: true, light: 'match',
    chars: [{ id: 'stranger', slot: 'right', asset: 'char-shadow' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { speaker: 'tourist', text: '这里…像是汉代的墓室？' },
      { cls: 'action', name: '黑影', text: '（一团黑影突然逼近）……！！' },
      { speaker: 'tourist', pose: null, text: '这是什么东西？！' },
      { speaker: 'stranger', pose: null, text: '别怕，别怕，在下只是太激动了。如今，是什么年头啦？' },
      { speaker: 'tourist', text: '是 2026 年。你到底是什么东西？' },
      { speaker: 'stranger', text: '2026？这是谁的年号？我是谁……我也不知道我是谁，曾经应当是可以和你一般站在天地之间的。可我已经忘了许多。哦对了，大汉可还兴盛？' },
      { speaker: 'tourist', text: '你是汉朝人？汉朝，已经覆灭千年之余了。那这…...不会是你的墓室吧？无意打扰无意打扰，我真不是盗墓的，我就睡了个觉就过来了！您知道我该怎么离开吗？' },
      { speaker: 'stranger', text: '覆灭千年……（叹息）罢了，不去想它啦。后世的君子，你好啊。我困于此地许久，曾有梦里仙人诺了我一愿——有缘人来使我忆起我是何人，我便可以归去。大抵便是你吧。我离开了，这里便留不住人了。' },
      { speaker: 'tourist', text: '我？！我既不是道士也不会出马，能看见你估计都是当牛马当久了——困得不行流了牛眼泪才成功的。我该怎么帮你？' },
      { speaker: 'stranger', text: '不必，不必做那些。你我二人有缘，也许便能读懂它们整日嚷嚷的我的过往——它们认得我，我却不认得它们了。若君能替我重识，大抵便可脱离此地了。' },
      { speaker: 'tourist', text: '这位……大人，您这墓里百宝奇珍如此多？难道我要都检查一遍？那得到什么时候？' },
      { speaker: 'stranger', text: '不必，不必。你且仔细听听此处哪里有声响，就去哪个方向。近来仍然嚷嚷的器物，也就四五件了吧。哦对了，别拿你那根小木棒照明啦，拿上这个。' },
    ],
  },

  /* --- 获得火把 --- */
  {
    type: 'item', id: 'torch', asset: 'item-torch',
    title: '获得 · 大号火把',
    desc: '失忆男子递来一根大号木棍，示意你用它照明。',
    button: '接过火把并点燃', items: ['火把'], toast: '获得道具：火把（光照范围更大）',
    hint: '点击按钮完成交互',
  },

  /* --- 证据册教学 --- */
  {
    type: 'book', hint: '身份证据册已解锁：共六页——籍贯、官职、品格、亲缘、经历、结局',
    lines: [
      { cls: 'narration', name: '旁白', text: '你翻开随身的证据册——它分为六页：籍贯、官职、品格、亲缘、经历、结局。' },
      { cls: 'narration', name: '旁白', text: '想要知道他是谁，就得从器物的记忆里，把这些页一页页填满。' },
    ],
  },

  /* --- 聆听声波 --- */
  { type: 'listen', count: 5, hint: '仔细聆听——点击声波最强烈之处' },

  /* ================= 第一幕 · 射天狼 ================= */
  { type: 'intertitle', title: '第一幕', sub: '射天狼', hint: '' },

  { type: 'artifact', title: '文物原型', name: '胡汉交兵画像石', asset: 'bg-stone', hint: '' },

  {
    type: 'scene', id: 'stone', bg: 'bg-stone', dark: true, light: 'torch',
    hint: '点击画面或按空格推进对话',
    lines: [
      { cls: 'narration', name: '旁白', text: '你举着火把向前摸索，来到声响处，把火把凑近墙壁——发现是一处石刻。' },
      { speaker: 'tourist', text: '这是......？' },
    ],
  },

  { type: 'transition', effect: 'static', text: '画面：电视雪花' },

  {
    type: 'scene', id: 'camp', bg: 'bg-camp',
    hint: '点击画面或按空格推进对话',
    lines: [
      { cls: 'narration', name: '旁白', text: '雪花散去，你置身于一片军营驻扎之处。其余营帐灯都已熄灭，只有主营帐没有熄灯。' },
      { speaker: 'tourist', text: '我变透明了？...在这个地方倒也正常。' },
      { speaker: 'tourist', text: '这大概便是那个鬼说的器物的记忆了吧。到前面亮着的地方去看看。' },
    ],
  },

  /* --- 主营帐 · 谋划 --- */
  {
    type: 'scene', id: 'tent', bg: 'bg-tent', log: 'act1',
    chars: [{ id: 'bangu', slot: 'left', asset: 'char-bangu' }, { id: 'stranger', slot: 'right', asset: 'char-fenghuan' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { cls: 'narration', name: '旁白', text: '主营帐内，二人相谈，神色严肃。你隐约认出其中一人，正是刚刚墓穴的主人。' },
      { speaker: 'bangu', text: '冯先生，我有意待到后日五更，全军饱食，擂鼓振士，从南面冲锋。你意下何如？' },
      { speaker: 'stranger', text: '班护军，您也不是未见那夷人今日折我兵三百的骄横之态。若真是这么去了，怕不是给人个筑京观的好机会。' },
      { speaker: 'bangu', pose: 'angry', text: '你这说的是什么话？！岂能咒我三军！' },
      { speaker: 'stranger', text: '班护军，稍安勿躁啊。您如今用剑可斩我一人头颅，却于我大汉疆土无用呐。今日我军从南面攻其地，双方损失相当，对于匈奴而言并非难以补上的口子。而他们迟迟未动，您想想，这到底是恢复不了，还是陷阱？' },
      { speaker: 'bangu', text: '那你说，后日该怎样打？' },
      { speaker: 'stranger', text: '敌粮草屯在西北坡，营栅连林，明夜有东南风。将军可令小将军率三百轻骑，多带火种，二更出营，绕后烧粮。全军同时偃旗息鼓，把鼓角集中到东面，佯作主力要往东突围。敌见火起，必回救粮；敌阵一动，将军率主力从两营接头的西北角结合部突阵——此役，必胜。若有误，我愿自刎以慰我大汉将士在天之灵。' },
      { speaker: 'bangu', pose: 'think', text: '那便依你之见。' },
    ],
  },

  { type: 'transition', effect: 'flash', text: '画面：直接跳转，最终定格为庆功宴饮' },

  /* --- 庆功宴 · 品格宣言（含关键证据） --- */
  {
    type: 'scene', id: 'feast', bg: 'bg-feast', log: 'act1',
    chars: [{ id: 'bangu', slot: 'left', asset: 'char-bangu' }, { id: 'stranger', slot: 'right', asset: 'char-fenghuan' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { cls: 'narration', name: '旁白', text: '战事已定，庆功宴上，班固举杯相敬。' },
      { speaker: 'bangu', text: '冯先生，这次获胜可多亏了你的谋略！待班师回朝，我便为你请旨封官！', evidence: ['act1-exp'] },
      { speaker: 'stranger', text: '谢护军赞赏。' },
      { speaker: 'bangu', text: '只是……官场阴翳，不似战场。若陷进什么困局，有时候脱身是需要圆滑的身段。' },
      { speaker: 'stranger', text: '谢护军提点。只是冯某甘愿因棱角遭残，情愿为正道殉身。', evidence: ['act1-char'] },
      { speaker: 'tourist', text: '原来他曾随班固出征过......现在说话的语气，倒是与千年前截然不同了。' },
    ],
  },

  /* --- 剧情回顾（探案模式） / 游览模式自动完成 --- */
  { type: 'review', logId: 'act1', hint: '对白里藏着关键证据……打开“剧情回顾”，找出它们' },

  /* --- 结算 --- */
  { type: 'ending' },
];
