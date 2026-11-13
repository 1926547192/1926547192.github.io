/* ============================================================
 * 《阙下归人》· 剧情数据
 *   序幕·昏沉梦 → 第一幕·射天狼 → 第二幕·香祛浊恶 → 第三幕·人间愿
 * ------------------------------------------------------------
 * 依据《阙下归人》.docx／《第二幕（铜熏炉)》.docx／《第三幕　人间愿》.docx
 * 文字脚本整理。对白均逐字保留原文（含标点）；括号内的开发备注
 * （如【收录证据…】、（很遗憾姚光的字历史上是无解的））不显示在台词中。
 * 第三幕按脚本要求以句号（含问号、感叹号）为限拆分对话框。
 * 姚安／姚光按用户要求保留原文不一致，不统一。
 * 历史取舍（第一幕）：「在下」「陷阱」、电视雪花、直接跳转+定格庆功宴。
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
  'act2-office': {
    page: '官职',
    title: '河南京令',
    text: '名帖抬头「“某顿首再拜河南京令明廷足下：」——墓主时任河南京令，主理洛阳京畿。此帖为说情而来：某家顽孙率众欺路人致死，其家托人多番求留余地。',
    source: '第二幕·香祛浊恶',
  },
  'act2-char': {
    page: '品格',
    title: '法不阿贵',
    text: '属吏劝道「您不妨先将其下狱……对外宣称犯人已死」，墓主厉色连问：「天下苍生究竟能有几个轮回，能忍得了一世的含冤而死？」终使属吏叹服：「您向来秉信法不阿贵，怎肯为这一人破例。」',
    source: '第二幕·香祛浊恶',
  },
  'act3-office': {
    page: '官职',
    title: '字平侯 · 豫州幽州刺史',
    text: '墓主字平侯。曾在豫州任刺史，行令严明；如今移镇幽州，政声卓著，百姓道「比过去的好了不知千百倍」。',
    source: '第三幕·人间愿',
  },
  'act3-exp': {
    page: '经历',
    title: '征句骊',
    text: '公元121年春，句骊王久有谋反之心，圣上有意让墓主年后即刻启程，携玄菟太守姚光一道共赴边关，以镇其邪心。',
    source: '第三幕·人间愿',
  },
};

/* ---------- 出场角色 ---------- */
const CHAR_DEFS = {
  tourist:   { name: '游客',      color: '#9fd0ff' },
  oldlady:   { name: '老婆婆',    color: '#d9b38c' },
  stranger:  { name: '失忆男子',  color: '#e8dfc8' },
  bangu:     { name: '班固',      color: '#d8b070' },
  shuli:     { name: '属吏',      color: '#b8a07a' },
  ajin:      { name: '阿瑾',      color: '#e3b7c8' },
  ajie:      { name: '阿瑾的姐姐', color: '#d8c3a5' },
  ajie0:     { name: '...（一个女子）', color: '#d8c3a5' },
  yaoguang:  { name: '姚光',      color: '#a8c8a0' },
  yaoan:     { name: '姚安',      color: '#a8c8a0' },
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
      { speaker: 'tourist', text: '这位……大人，您这墓里百宝奇珍如此多，难道我要都检查一遍？那得到什么时候？' },
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

  /* ================= 第二幕 · 香祛浊恶 ================= */
  { type: 'intertitle', title: '第二幕', sub: '香祛浊恶', hint: '' },

  { type: 'artifact', title: '文物原型', name: '五凤铜熏炉', asset: 'bg-censer', hint: '' },

  /* --- 墓室 · 凤鸟泣血 --- */
  {
    type: 'scene', id: 'act2-tomb', bg: 'bg-tomb', dark: true, light: 'torch', log: 'act2',
    chars: [{ id: 'stranger', slot: 'right', asset: 'char-fenghuan' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { speaker: 'tourist', label: '游客（手中火光照亮文物，看见冠子）', text: '嘶......这是鸡吗？' },
      { speaker: 'stranger', label: '失忆男子（突然出现）', text: '阁下真会说笑。这是凤鸟，是盛世昌明才会临世的祥瑞。' },
      { speaker: 'tourist', text: '原来是凤鸟啊。' },
      { cls: 'narration', name: '旁白', text: '（大的铜凤鸟迅速扭过头来正对屏幕，眼里流出血泪，张开嘴想要鸣叫却只发出了嘶哑的声音。喉咙喷出血、溅到屏幕上，制作鲜血流淌的动图，正好场景切换。' },
    ],
  },

  { type: 'blood', hint: '' },

  /* --- 河南京令 · 名帖 --- */
  {
    type: 'scene', id: 'act2-study', bg: 'bg-censer', log: 'act2',
    chars: [{ id: 'shuli', slot: 'left', asset: 'char-shuli' }, { id: 'stranger', slot: 'right', asset: 'char-fenghuan' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { cls: 'narration', name: '旁白', text: '切换后即为冯焕任河南京令的时刻，画面为铜熏炉飘着熏香，时令为冬日。一名属吏把名帖放到案边，冯焕未动。）' },
      { speaker: 'shuli', text: '此人已托过多次关系，您多少留些余地。' },
      { cls: 'narration', name: '旁白', text: '（交互：点击有发光点的名帖，查看具体内容）' },
    ],
  },

  {
    type: 'document', id: 'act2-mingtie', bg: 'bg-censer', log: 'act2',
    chars: [{ id: 'shuli', slot: 'left', asset: 'char-shuli' }, { id: 'stranger', slot: 'right', asset: 'char-fenghuan' }],
    docTitle: '【具体内容如下：', docName: '名帖', evidence: ['act2-office'],
    hint: '点击发光的名帖，查看具体内容',
    lines: [
      '“某顿首再拜河南京令明廷足下：',
      '某顽劣之孙，不率教令，群欺路人，致其身死。某闻之，惊怛愧痛，不知所云。其罪至重，某不敢一言称冤，亦愧于故河南尹之名。',
      '然某衰暮之年，其父辈兄亲常居朝堂之上而少能伴者，唯此孙朝夕在侧。某固知其为国法所不容，而私情所不能已。若有一线可矜，使某得见其孙终某一世，则明廷之赐，某虽死不朽。',
      '某诚惶诚恐，顿首顿首，死罪死罪。】',
    ],
  },

  /* --- 拒情 · 法不阿贵 --- */
  {
    type: 'scene', id: 'act2-study2', bg: 'bg-censer', log: 'act2',
    chars: [{ id: 'shuli', slot: 'left', asset: 'char-shuli' }, { id: 'stranger', slot: 'right', asset: 'char-fenghuan' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { speaker: 'stranger', text: '哼，余地？那你倒是说说，如何给这伤人性命的人留余地？' },
      { speaker: 'shuli', text: '其罪难逃。但犯人世代累官高位，您不妨先将其下狱，至于后事如何，且与其家人商议再定。毕竟，死者非家世显赫之辈，您对外宣称犯人已死，他们还能怀疑不成？' },
      { speaker: 'stranger', text: '昌文，你可还记得，你曾与我说过，你幼时目睹邻人遭难？' },
      { speaker: 'stranger', text: '你可还记得，你与我说至惨烈之处，都忍不住潸然泪下？' },
      { speaker: 'stranger', text: '你难道希望这死者的父母兄亲乃至他的邻人，不仅仅活在悲痛、还要活在欺瞒之中？！' },
      { speaker: 'stranger', text: '天下苍生究竟能有几个轮回，能忍得了一世的含冤而死？' },
      { speaker: 'stranger', text: '汉土苍阔，岂容奸黠晦污？' },
      { speaker: 'shuli', text: '......（叹息）属下该死。是我偏颇了，您向来秉信法不阿贵，怎肯为这一人破例。', evidence: ['act2-char'] },
      { speaker: 'stranger', text: '既知道，便不必再说了。' },
      { speaker: 'stranger', text: '你将熏香燃得再旺些就先出去吧，这案卷藏恶，熏上些香气，许能使我不甚厌烦。' },
    ],
  },

  /* --- 凤鸟炉 · 喃喃 --- */
  {
    type: 'scene', id: 'act2-close', bg: 'bg-fenghuan', log: 'act2',
    hint: '点击画面或按空格推进对话',
    lines: [
      { cls: 'narration', name: '旁白', text: '（画面变化，转至冯焕正对凤鸟炉，出现的只有他握着笔的手和飘烟的炉子）' },
      { speaker: 'stranger', label: '失忆男子（喃喃自语）', text: '凤鸟啊凤鸟，你何时肯降临这世上呢？' },
      { cls: 'narration', name: '旁白', text: '（画面向凤鸟炉出移近镜头，此时凤鸟炉由金色逐渐褪色为青铜色，并流出血泪。待完全回归墓室场景，让大凤鸟头部直接断裂）' },
    ],
  },

  /* --- 回归墓室 · 断首凤鸟 --- */
  {
    type: 'scene', id: 'act2-tomb2', bg: 'bg-tomb', dark: true, light: 'torch', log: 'act2',
    hint: '点击画面或按空格推进对话',
    lines: [
      { speaker: 'tourist', text: '这鸟的头怎么断了？那位大人呢？应当不会让我赔付吧。姓冯的历史人物我还真不知道多少，这样刚正的更是对不上号......他究竟是谁呢？' },
      { speaker: 'tourist', text: '不过既然大人生前如此令人钦佩，万万不能像先前那样不尊重了。且先接着看看吧。' },
    ],
  },

  { type: 'review', logId: 'act2', hint: '对白与名帖里藏着关键证据……打开“剧情回顾”，找出它们' },

  { type: 'hint', text: '与下一处文物交流' },

  /* ================= 第三幕 · 人间愿 ================= */
  { type: 'intertitle', title: '第三幕', sub: '人间愿', hint: '' },

  { type: 'artifact', title: '文物原型', name: '乐舞杂技画像石', asset: 'bg-yuewu', hint: '' },

  /* --- 石壁 · 画像活化 --- */
  {
    type: 'scene', id: 'act3-stone', bg: 'bg-yuewu', dark: true, light: 'torch', log: 'act3',
    chars: [{ id: 'stranger', slot: 'right', asset: 'char-fenghuan' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { cls: 'narration', name: '旁白', text: '（玩家继续探索，来到下一处文物处，火光照亮石壁）' },
      { speaker: 'tourist', text: '千年了，这石壁上的画竟仍是栩栩如生啊。' },
      { speaker: 'tourist', text: '许多颜色都还没褪……太不可思议了。' },
      { speaker: 'stranger', label: '失忆男子（突然冒出）', text: '是啊。' },
      { speaker: 'stranger', text: '这么多年过去，我这儿原有的许多坚硬的东西也尽数湮灭了。' },
      { speaker: 'stranger', text: '而这被涂抹上去的薄薄的一层乐舞，却在此徘徊吟唱了千年。' },
      { speaker: 'stranger', text: '你说……我生前会是个喜欢戏乐杂戏的人么？' },
      { speaker: 'stranger', text: '我总觉着，看到这幅画像，纵使周身无火也甚是温暖。' },
      { speaker: 'tourist', text: '......您下次出现前打个招呼，让我准备一下。' },
      { speaker: 'tourist', text: '真是吓死了。' },
      { speaker: 'tourist', text: '既然死后都要画下来相伴，说不定真是您生前酷爱呢。' },
      { speaker: 'tourist', text: '我且去看看究竟如何。' },
      { cls: 'narration', name: '旁白', text: '（画面：手放在画像上，画像上的人物先是动起来，最后化成实体）' },
    ],
  },

  { type: 'transition', effect: 'flash', asset: 'fx-painting', text: '' },

  /* --- 庙会 · 姊妹观舞 --- */
  {
    type: 'scene', id: 'act3-fair', bg: 'bg-fair', log: 'act3',
    chars: [{ id: 'ajie0', slot: 'left', asset: 'char-ajie' }, { id: 'ajin', slot: 'right', asset: 'char-ajin' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { cls: 'narration', name: '旁白', text: '（耳边传来声音，随即画面转动到周围的人群中）' },
      { speaker: 'tourist', text: '这难道算是汉代的庙会？' },
      { speaker: 'tourist', text: '好热闹啊。' },
      { speaker: 'ajie0', text: '阿瑾，快些来呀！' },
      { speaker: 'ajie0', text: '你再那么慢悠悠的，可就看不到你爱看的杂戏了！' },
      { speaker: 'ajin', text: '哎哟阿姐你慢点！' },
      { speaker: 'ajin', text: '我都快跟不上你了。' },
      { speaker: 'ajin', text: '就算今天赶不上，明后两天也都能看到的。' },
      { speaker: 'ajie', text: '明后日？' },
      { speaker: 'ajie', text: '你莫不是终日读书读傻了？' },
      { speaker: 'ajie', text: '这舞乐队，历来分明只有今日才会出演。' },
      { speaker: 'ajin', text: '阿姐，这分明是你的消息不够灵通了。' },
      { speaker: 'ajin', text: '夫子和我们说过，那句骊王有谋反之心久矣，圣上有意让冯大人年后即刻启程，携玄菟太守姚光一道共赴边关以镇其邪心。', evidence: ['act3-exp'] },
      { speaker: 'ajin', text: '这戏乐班子里不知有谁听了这事情，就决定连演三日扛鼎弄剑为刺史大人送行。' },
      { speaker: 'ajie', text: '竟是这样，还是我们阿瑾有见识呐。' },
      { speaker: 'ajie', text: '那我们今儿就不去挤了，先到河畔放河灯，好不好？' },
      { speaker: 'ajin', text: '好啊好啊！' },
      { speaker: 'ajin', text: '阿姐，我们快去吧！' },
      { speaker: 'ajie', text: '阿瑾可是最近有了什么心事？' },
      { speaker: 'ajie', text: '怎么到了放灯许愿，走得这样急切？' },
      { speaker: 'ajin', text: '是有。' },
      { speaker: 'ajin', text: '阿姐你瞧，舞乐之人尚且知晓感激冯刺史的恩惠，我们这得了豪强还田的小民，怎么能不感激呢？' },
      { speaker: 'ajin', text: '他从洛阳来时，那些大族还不信他能把在豫州做刺史的行令方式直接搬过来。', evidence: ['act3-office'] },
      { speaker: 'ajin', text: '都认为他在洛阳积累的声威是因为天子脚下诸侯不敢造次。' },
      { speaker: 'ajin', text: '而你看看这如今的幽州，比过去的好了不知千百倍。', evidence: ['act3-office'] },
      { speaker: 'ajin', text: '如此明官在上，我如何能不为他祈福，愿大军凯旋、愿我大汉长安呢？' },
      { cls: 'narration', name: '旁白', text: '（画面改变：二人已走到河边）' },
    ],
  },

  /* --- 河畔 · 放河灯 --- */
  {
    type: 'scene', id: 'act3-river', bg: 'bg-river', log: 'act3',
    chars: [{ id: 'ajie', slot: 'left', asset: 'char-ajie' }, { id: 'ajin', slot: 'right', asset: 'char-ajin' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { speaker: 'ajie', text: '好呀，我们阿瑾有报恩之心，也有壮志之情。' },
      { speaker: 'ajie', text: '日后，也会像冯大人那般做官为民、造福一方的。' },
      { cls: 'narration', name: '旁白', text: '（放河灯，画面推远，展示亮着许多灯的河流，一直到楼阁之上：姚安、冯焕两人的背影，手里拿着酒杯；旁边有一张桌子，上面有酒壶，二人中间是那条河流的远景。）' },
    ],
  },

  /* --- 楼阁 · 人间愿 --- */
  {
    type: 'scene', id: 'act3-tower', bg: 'bg-tower', log: 'act3',
    chars: [{ id: 'yaoguang', slot: 'left', asset: 'char-yaoguang' }, { id: 'stranger', slot: 'right', asset: 'char-fenghuan' }],
    hint: '点击画面或按空格推进对话',
    lines: [
      { speaker: 'stranger', text: '姚光，你说，河边的人都在许什么愿呢？' },
      { speaker: 'yaoguang', text: '嗯......许是像国泰民安、家人康健、五谷丰登一类的？' },
      { speaker: 'yaoguang', text: '这么多人呢，列举是举不完的。' },
      { speaker: 'yaoguang', text: '不过你别说，大家都在许愿，像是都在给生活许下盼头。' },
      { speaker: 'yaoguang', text: '再去想你我开春时的开拔，盼望得胜的心似乎更甚昨日。' },
      { speaker: 'stranger', text: '我何尝不是呢。' },
      { speaker: 'stranger', text: '不过我却希望这世上的愿望能少一点、再少一点。' },
      { speaker: 'yaoan', text: '平侯，有愿望是好事啊。你这话说得我可不懂了。', evidence: ['act3-office'] },
      { speaker: 'stranger', text: '若已经取胜，就无需盼望；若年年丰收，便不必祈求；若金吾不禁，或安忧国之心。' },
      { speaker: 'yaoan', text: '好啊，也对也对。' },
      { speaker: 'yaoan', text: '平侯兄，若你我此去能重展燕然之姿，那离你的希望便更近了。' },
      { speaker: 'yaoan', text: '但今日是个好时节啊，我这杯里所剩无几，你那却还是满满的，是不是——' },
      { speaker: 'stranger', text: '哈哈哈，我还不了解你么？' },
      { speaker: 'stranger', text: '我自当浮一大白！' },
      { cls: 'narration', name: '旁白', text: '（交互：点击取桌上酒壶，使冯焕直饮。）' },
    ],
  },

  /* --- 取酒壶 --- */
  {
    type: 'interact', id: 'act3-winepot',
    title: '交互', asset: 'item-winepot',
    desc: '桌上放着一只酒壶，为这最后一杯斟满吧。',
    button: '取酒壶', toast: '冯焕举壶直饮——浮一大白！',
    hint: '点击按钮完成交互',
  },

  { type: 'review', logId: 'act3', hint: '对白里藏着关键证据……打开“剧情回顾”，找出它们' },

  /* --- 结算 --- */
  { type: 'ending' },
];
