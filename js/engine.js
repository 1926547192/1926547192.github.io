/* ============================================================
 * 《阙下归人》· 游戏引擎
 * 场景切换 / 对白 / 打字机 / 光照 / 证据册 / 心神 / 转场 / 提示
 * ============================================================ */

'use strict';

const PLACE_LABEL = {
  'bg-title': '标题背景（汉阙）', 'bg-street': '背景·清晨街角', 'bg-bus': '背景·大巴车内',
  'bg-tomb': '背景·昏暗墓室', 'bg-stone': '画像石·石刻特写', 'bg-camp': '背景·夜晚军营',
  'bg-tent': '背景·主营帐内', 'bg-feast': '背景·庆功宴饮',
  'char-oldlady': '立绘·老婆婆', 'char-shadow': '立绘·失忆男子（黑影）',
  'char-fenghuan': '立绘·失忆男子（渐清晰）', 'char-bangu': '立绘·班固',
  'item-match': '道具·火柴', 'item-torch': '道具·火把',
  'fx-lunge': '特效·黑影扑屏', 'fx-war': '定格·战争场面', 'ui-book-bg': '证据册纹样',
};

const Engine = {
  mode: null,           // 'tour' | 'detective'
  fast: false,
  hp: SETTINGS.hpMax,
  items: new Set(),
  collected: new Set(),
  logs: {},
  player: { name: '游客', gender: 'f' },
  advanceFn: null,
  els: {},

  /* ---------------- 初始化 ---------------- */
  init() {
    const $ = (id) => document.getElementById(id);
    this.els = {
      stage: $('stage'), bg: $('bg-layer'), chars: $('char-layer'),
      light: $('light-layer'), flame: $('flame'), fx: $('fx-layer'),
      vignette: $('vignette'), hint: $('hint'),
      hpbar: $('hp-bar'), hpsegs: $('hp-segs'), mute: $('mute-btn'),
      fire: $('hud-fire'), bookBtn: $('hud-book'), bookBadge: $('book-badge'),
      dlg: $('dlg'), dlgName: $('dlg-name'), dlgText: $('dlg-text'),
      dlgFast: $('dlg-fast'), dlgKey: $('dlg-key'),
      card: $('interact-card'), cardTitle: $('card-title'), cardAsset: $('card-asset'),
      cardDesc: $('card-desc'), cardBtn: $('card-btn'),
      intertitle: $('intertitle'), itTitle: $('it-title'), itSub: $('it-sub'),
      artifact: $('artifact-card'), artTag: $('art-tag'), artName: $('art-name'), artAsset: $('art-asset'),
      panel: $('fx-panel'), panelText: $('panel-text'), panelAsset: $('panel-asset'),
      toasts: $('toasts'), overlay: $('overlay'), ovCanvas: $('ov-canvas'), ovText: $('ov-text'),
      death: $('death'), deathMsg: $('death-msg'),
      book: $('evidence-book'), bookTabs: $('book-tabs'), bookContent: $('book-content'),
      bookCount: $('book-count'), bookClose: $('book-close'),
      review: $('review-modal'), reviewList: $('review-list'), reviewProgress: $('review-progress'),
      reviewDone: $('review-done'), reviewHint: $('review-hint'),
      title: $('title-screen'), ending: $('ending'),
      warn: $('warn-flash'),
    };

    // 心神（血条）分段
    this.els.hpsegs.innerHTML = '';
    for (let i = 0; i < SETTINGS.hpMax; i++) {
      const s = document.createElement('span');
      s.className = 'hp-seg';
      this.els.hpsegs.appendChild(s);
    }

    // 证据册页签
    EVIDENCE_PAGES.forEach((p) => {
      const b = document.createElement('button');
      b.className = 'book-tab';
      b.textContent = p;
      b.dataset.page = p;
      b.addEventListener('click', () => this.switchBookTab(p));
      this.els.bookTabs.appendChild(b);
    });

    // 证据册开关
    this.els.bookBtn.addEventListener('click', () => { AudioFX.click(); this.openBook(); });
    this.els.bookClose.addEventListener('click', () => { AudioFX.click(); this.closeBook(); });
    this.els.book.addEventListener('click', (e) => { if (e.target === this.els.book) this.closeBook(); });

    // 快进
    this.els.dlgFast.addEventListener('click', (e) => {
      e.stopPropagation();
      this.fast = !this.fast;
      this.els.dlgFast.classList.toggle('on', this.fast);
      AudioFX.click();
    });

    // 静音
    this.els.mute.addEventListener('click', () => {
      const m = AudioFX.toggleMute();
      this.els.mute.textContent = m ? '🔇' : '🔊';
    });
    this.els.mute.textContent = AudioFX.isMuted() ? '🔇' : '🔊';

    // 全局：点击推进对话
    this.els.stage.addEventListener('pointerdown', () => {
      AudioFX.unlock();
      if (this.advanceFn) { this.advanceFn(); }
    });

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (this.advanceFn) { this.advanceFn(); }
      }
      if (e.code === 'Escape') {
        if (this.els.book.classList.contains('show')) this.closeBook();
      }
    });

    this.updateHp();
    this.setLight(null);
  },

  /* ---------------- 流程控制 ---------------- */
  start(mode) {
    this.mode = mode;
    this.fast = false;
    this.hp = SETTINGS.hpMax;
    this.items = new Set();
    this.collected = new Set();
    this.logs = {};
    this.els.dlgFast.classList.toggle('on', false);
    this.els.hpbar.classList.toggle('hidden', mode !== 'detective');
    this.els.title.classList.remove('show');
    this.els.ending.classList.remove('show');
    this.hideDlg();
    this.updateHp();
    this.updateHud();
    this.run(SCRIPT, 0);
  },

  async run(script, from) {
    this._cancelled = false;
    for (let i = from; i < script.length; i++) {
      if (this._cancelled) return;
      const node = script[i];
      await this.runNode(node, i);
    }
  },

  async runNode(node) {
    switch (node.type) {
      case 'intertitle': await this.nodeIntertitle(node); break;
      case 'scene':      await this.nodeScene(node); break;
      case 'interact':   await this.nodeCard(node, '交互'); break;
      case 'item':       await this.nodeCard(node, '获得'); break;
      case 'book':       await this.nodeBook(node); break;
      case 'transition': await this.nodeTransition(node); break;
      case 'artifact':   await this.nodeArtifact(node); break;
      case 'minigame':
      case 'observe':
      case 'scare':
      case 'listen':
      case 'review':     await Minigames.run(node); break;
      case 'ending':     await this.nodeEnding(); break;
      default: break;
    }
  },

  /* ---------------- 节点实现 ---------------- */
  nodeIntertitle(node) {
    return new Promise((resolve) => {
      this.hint(node.hint);
      this.hideDlg();
      this.els.itTitle.textContent = node.title;
      this.els.itSub.textContent = node.sub || '';
      this.els.intertitle.classList.add('show');
      AudioFX.gong();
      let settled = false;
      const done = () => {
        if (settled) return; settled = true;
        document.removeEventListener('pointerdown', done);
        this.els.intertitle.classList.remove('show');
        resolve();
      };
      document.addEventListener('pointerdown', done);
      setTimeout(done, 2400);
    });
  },

  nodeScene(node) {
    this.setBg(node.bg || null);
    this.setChars(node.chars || []);
    this.setLight(node.light || (node.dark ? 'match' : null));
    this.hint(node.hint);
    const ctx = { log: node.log || null, chars: node.chars || [] };
    return this.showLines(node.lines, ctx).then(() => {
      this.setChars([]);
      if (!node.light) this.setLight(null);
    });
  },

  nodeCard(node, kind) {
    return new Promise((resolve) => {
      this.hint(node.hint);
      this.hideDlg();
      this.els.cardTitle.textContent = (kind === '获得' ? '获得 · ' : '') + node.title;
      this.els.cardDesc.textContent = node.desc;
      this.els.cardBtn.textContent = node.button;
      this.els.cardAsset.innerHTML = '';
      this.els.cardAsset.appendChild(buildAsset(node.asset || null, 'item'));
      this.els.card.classList.add('show');
      AudioFX.whoosh();
      const handler = () => {
        this.els.cardBtn.removeEventListener('click', handler);
        this.els.card.classList.remove('show');
        AudioFX.collect();
        (node.items || []).forEach((it) => this.addItem(it));
        if (node.toast) this.toast(node.toast, 'good');
        if (node.asset === 'item-torch') { AudioFX.torch(); this.setLight('torch'); }
        if (node.asset === 'item-match') { AudioFX.flame(); }
        resolve();
      };
      this.els.cardBtn.addEventListener('click', handler);
    });
  },

  nodeBook(node) {
    return this.showLines(node.lines, { log: null, chars: [] }).then(() => new Promise((resolve) => {
      this.hint('点击右下角「证据册」查看（或按 Esc 关闭）');
      this.els.bookBtn.classList.add('pulse');
      AudioFX.whoosh();
      const t = setTimeout(() => { this.els.bookBtn.classList.remove('pulse'); this.openBook(); }, 1300);
      this._onBookCloseOnce = () => { clearTimeout(t); this.els.bookBtn.classList.remove('pulse'); resolve(); };
    }));
  },

  nodeTransition(node) {
    const isFlash = node.effect === 'flash';
    const dur = node.effect === 'static' ? SETTINGS.staticDur
      : (isFlash ? 3400 : SETTINGS.transitionDur);
    return new Promise((resolve) => {
      this.hideDlg();
      this.setChars([]);
      this.els.overlay.classList.add('show');
      this.els.ovText.textContent = node.text || '';
      this.els.ovText.classList.toggle('show', !!node.text);

      if (node.effect === 'static') {
        // 电视雪花：canvas 噪点
        this.els.overlay.style.background = 'transparent';
        this.els.ovCanvas.classList.add('show');
        this._staticOn = true;
        AudioFX.whoosh();
        const draw = () => {
          if (!this._staticOn) return;
          const c = this.els.ovCanvas, g = c.getContext('2d');
          const w = c.width = c.clientWidth || window.innerWidth;
          const h = c.height = c.clientHeight || window.innerHeight;
          const img = g.createImageData(w, h);
          const d = img.data;
          for (let i = 0; i < d.length; i += 4) {
            const v = (Math.random() * 255) | 0;
            d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
          }
          g.putImageData(img, 0, 0);
          if (this._staticOn) requestAnimationFrame(draw);
        };
        draw();
      } else if (isFlash) {
        // 白闪 → 战争场面定格占位（脚本取舍：直接跳转，最终定格庆功宴饮）
        this.els.overlay.style.background = '#efe9da';
        AudioFX.success();
        setTimeout(() => {
          this.els.overlay.style.background = 'rgba(5,7,10,0.55)';
          this.showPanel('fx-war', node.text || '');
        }, 500);
      } else {
        this.els.overlay.style.background = '#05070a';
      }

      let settled = false;
      const finish = () => {
        if (settled) return; settled = true;
        this._staticOn = false;
        this.els.ovCanvas.classList.remove('show');
        this.els.ovText.classList.remove('show');
        this.els.overlay.style.background = '#05070a';
        this.els.overlay.classList.remove('show');
        this.hidePanel();
        document.removeEventListener('pointerdown', finish);
        resolve();
      };
      // 点击可跳过（有最短时长）
      document.addEventListener('pointerdown', finish);
      setTimeout(finish, dur);
    });
  },

  showPanel(assetKey, text) {
    this.els.panelText.textContent = text;
    this.els.panelAsset.innerHTML = '';
    this.els.panelAsset.appendChild(buildAsset(assetKey, 'panel'));
    this.els.panel.classList.add('show');
  },

  hidePanel() {
    this.els.panel.classList.remove('show');
  },

  nodeArtifact(node) {
    return new Promise((resolve) => {
      this.hideDlg();
      this.els.artTag.textContent = node.title;
      this.els.artName.textContent = node.name;
      this.els.artAsset.innerHTML = '';
      this.els.artAsset.appendChild(buildAsset(node.asset, 'panel'));
      this.els.artifact.classList.add('show');
      AudioFX.gong();
      let settled = false;
      const done = () => {
        if (settled) return; settled = true;
        document.removeEventListener('pointerdown', done);
        this.els.artifact.classList.remove('show');
        resolve();
      };
      document.addEventListener('pointerdown', done);
      setTimeout(done, 2600);
    });
  },

  nodeEnding() {
    return new Promise((resolve) => {
      this.hideDlg();
      this.setChars([]);
      this.setLight(null);
      this.els.ending.classList.add('show');
      AudioFX.gong();
      const r = this.buildEnding();
      resolve(r);
    });
  },

  buildEnding() {
    const el = this.els.ending;
    const list = el.querySelector('#ending-evidence');
    const remain = el.querySelector('#ending-remain');
    const phBox = el.querySelector('#ending-ph');
    list.innerHTML = '';
    remain.innerHTML = '';
    const collectedDefs = Object.entries(EVIDENCE_DEFS).filter(([id]) => this.collected.has(id));
    if (collectedDefs.length) {
      collectedDefs.forEach(([id, d]) => {
        const li = document.createElement('li');
        li.innerHTML = `<b>${d.page}</b> · ${d.title}<span class="src">${d.source}</span>`;
        list.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.className = 'none';
      li.textContent = '本段尚未收录证据。';
      list.appendChild(li);
    }
    const missing = EVIDENCE_PAGES.filter((p) => !Object.values(EVIDENCE_DEFS).some((d) => d.page === p && this.collected.has(d.id)));
    missing.forEach((p) => {
      const li = document.createElement('li');
      li.className = 'none';
      li.textContent = `${p} —— ${EVIDENCE_EMPTY[p]}`;
      remain.appendChild(li);
    });
    phBox.innerHTML = '';
    phBox.appendChild(buildAsset('char-fenghuan', 'char'));
    const note = el.querySelector('#ending-ph-note');
    note.textContent = '随着证据收录，他的面容正逐渐清晰（灯下无影）——此处将替换为清晰立绘。';
    return el;
  },

  /* ---------------- 对白 ---------------- */
  showLines(lines, ctx) {
    const self = this;
    return (async () => {
      this.els.dlg.classList.add('show');
      for (const ln of lines) {
        await this.renderLine(ln, ctx);
      }
      this.hideDlg();
    })();
  },

  hideDlg() { this.els.dlg.classList.remove('show'); this.advanceFn = null; },

  renderLine(ln, ctx, autoMs) {
    const self = this;
    return new Promise((resolve) => {
      const dlg = this.els.dlg;
      dlg.classList.add('show');
      dlg.classList.remove('key-glow');

      // 说话人
      let nameText = '';
      let cls = '';
      if (ln.cls === 'narration') { nameText = ln.name || '旁白'; cls = 'narration'; this.els.dlgName.style.color = '#9a938a'; }
      else if (ln.cls === 'thought') { nameText = ln.name || '内心想法'; cls = 'thought'; this.els.dlgName.style.color = '#8fa0bf'; }
      else if (ln.cls === 'action') { nameText = ln.name || '『』'; cls = 'action'; this.els.dlgName.style.color = '#8c8372'; }
      else {
        nameText = ln.speaker === 'tourist' ? (this.player.name || '游客') : (CHAR_DEFS[ln.speaker] ? CHAR_DEFS[ln.speaker].name : ln.speaker);
        this.els.dlgName.style.color = CHAR_DEFS[ln.speaker] ? CHAR_DEFS[ln.speaker].color : '#e8dfc8';
      }
      this.els.dlgName.textContent = nameText;
      dlg.dataset.cls = cls;

      // 老婆婆称呼按性别替换
      let text = ln.text;
      if (ln.speaker === 'oldlady') {
        text = text.replace('小姑娘/小伙子', this.player.gender === 'f' ? '小姑娘' : '小伙子');
      }

      // 说话人立绘高亮 / 姿态
      const chars = ctx.chars || [];
      chars.forEach((c) => {
        const el = document.getElementById('char-' + c.id);
        if (el) {
          el.classList.toggle('speaking', c.id === ln.speaker);
          el.classList.remove('pose-angry', 'pose-think');
          if (c.id === ln.speaker && ln.pose) el.classList.add('pose-' + ln.pose);
        }
      });

      // 关键证据发光（仅游览模式）
      const isKey = !!(ln.evidence && ln.evidence.length);
      const showGlow = isKey && this.mode === 'tour' && !ln.evidence.every((id) => this.collected.has(id));
      this.els.dlgKey.classList.toggle('show', showGlow);
      dlg.classList.toggle('key-glow', showGlow);

      // 记录对白日志（探案模式剧情回顾用）
      if (ctx.log && (ln.speaker || ln.cls === 'action')) {
        (this.logs[ctx.log] = this.logs[ctx.log] || []).push({
          speaker: ln.speaker || null,
          name: ln.name || null,
          cls: ln.cls || null,
          text: text,
          evidence: ln.evidence || null,
        });
      }

      // 打字机
      let settled = false;
      let finished = false;
      let timer = null;
      const textEl = this.els.dlgText;
      const typer = typewriter(textEl, text, this.fast ? 0 : SETTINGS.typeSpeed, () => {});

      const finishTyping = () => { if (!finished) { finished = true; typer.finish(); } };
      const next = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        clearTimeout(autoTimer);
        finishTyping();
        this.advanceFn = null;
        // 游览模式：离开关键句时自动收录
        if (showGlow) {
          ln.evidence.forEach((id) => this.collectEvidence(id));
        }
        resolve();
      };

      this.advanceFn = () => {
        AudioFX.unlock();
        if (!finished) { finishTyping(); if (this.fast) schedule(); }
        else next();
      };

      const schedule = () => {
        clearTimeout(timer);
        if (this.fast && !settled) timer = setTimeout(next, SETTINGS.fastDelay);
      };
      if (this.fast) { finishTyping(); schedule(); }

      // 自动消散（观察教学等场景使用）
      let autoTimer = null;
      if (autoMs) autoTimer = setTimeout(() => { if (!settled) next(); }, autoMs);
    });
  },

  /* ---------------- 证据 ---------------- */
  collectEvidence(id) {
    if (this.collected.has(id)) return false;
    const def = EVIDENCE_DEFS[id];
    if (!def) return false;
    this.collected.add(id);
    this.toast(`证据已收录：${def.page} · ${def.title}`, 'evidence');
    AudioFX.collect();
    this.els.bookBadge.textContent = this.collected.size;
    this.els.bookBadge.classList.add('bump');
    setTimeout(() => this.els.bookBadge.classList.remove('bump'), 600);
    this.els.bookBtn.classList.add('glow');
    setTimeout(() => this.els.bookBtn.classList.remove('glow'), 1600);
    return true;
  },

  hasEvidence(id) { return this.collected.has(id); },

  /* ---------------- 证据册 ---------------- */
  openBook() {
    this.els.book.classList.add('show');
    this.switchBookTab('籍贯');
    this.els.bookCount.textContent = `已收录证据：${this.collected.size} 条`;
    AudioFX.click();
  },
  closeBook() {
    this.els.book.classList.remove('show');
    if (this._onBookCloseOnce) { const f = this._onBookCloseOnce; this._onBookCloseOnce = null; f(); }
  },
  switchBookTab(page) {
    this.els.bookTabs.querySelectorAll('.book-tab').forEach((b) => {
      b.classList.toggle('active', b.dataset.page === page);
    });
    const box = this.els.bookContent;
    box.innerHTML = '';
    const entries = Object.entries(EVIDENCE_DEFS).filter(([id, d]) => d.page === page && this.collected.has(id));
    if (!entries.length) {
      const p = document.createElement('p');
      p.className = 'book-empty';
      p.textContent = EVIDENCE_EMPTY[page] || '尚未收录证据。';
      box.appendChild(p);
      return;
    }
    entries.forEach(([id, d]) => {
      const card = document.createElement('div');
      card.className = 'book-entry';
      card.innerHTML = `<h3>${d.title}</h3><p>${d.text}</p><span class="src">${d.source}</span>` +
        (d.historyNote ? `<p class="note">${d.historyNote}</p>` : '');
      box.appendChild(card);
    });
  },

  /* ---------------- 道具 / HUD ---------------- */
  addItem(name) {
    this.items.add(name);
    this.updateHud();
  },
  updateHud() {
    const has = (n) => this.items.has(n);
    this.els.fire.innerHTML = '';
    if (has('火把')) {
      const s = document.createElement('div');
      s.className = 'fire-slot torch';
      s.innerHTML = '<span class="fire-icon">🔥</span><span>火把</span>';
      this.els.fire.appendChild(s);
    } else if (has('火柴')) {
      const s = document.createElement('div');
      s.className = 'fire-slot match';
      s.innerHTML = '<span class="fire-icon">🕯️</span><span>火柴</span>';
      this.els.fire.appendChild(s);
    } else {
      const s = document.createElement('div');
      s.className = 'fire-slot empty';
      s.innerHTML = '<span class="fire-icon">⬛</span><span>无光源</span>';
      this.els.fire.appendChild(s);
    }
  },

  /* ---------------- 提示 / 弹窗 ---------------- */
  hint(text) {
    this.els.hint.textContent = text || '';
    this.els.hint.classList.toggle('show', !!text);
  },

  toast(text, kind) {
    const t = document.createElement('div');
    t.className = 'toast' + (kind ? ' toast-' + kind : '');
    t.textContent = text;
    this.els.toasts.appendChild(t);
    while (this.els.toasts.children.length > 3) this.els.toasts.removeChild(this.els.toasts.firstChild);
    setTimeout(() => t.classList.add('out'), 2100);
    setTimeout(() => t.remove(), 2600);
  },

  /* ---------------- 心神（探案模式） ---------------- */
  damage(msg) {
    if (this.mode !== 'detective') return;
    this.hp = Math.max(0, this.hp - 1);
    this.updateHp();
    AudioFX.hurt();
    this.els.warn.classList.add('show');
    setTimeout(() => this.els.warn.classList.remove('show'), 450);
    this.shakeStage();
    if (this.hp <= 0) {
      this.toast(msg || '心神耗尽……', 'bad');
    }
  },

  updateHp() {
    const segs = this.els.hpsegs.children;
    for (let i = 0; i < segs.length; i++) {
      segs[i].classList.toggle('on', i < this.hp);
    }
  },

  restoreHp() { this.hp = SETTINGS.hpMax; this.updateHp(); },

  /* 心神耗尽：覆盖层 → 自动重来（重试逻辑由调用方给出） */
  die(msg, retry) {
    this.els.deathMsg.textContent = msg || '心神耗尽……';
    this.els.death.classList.add('show');
    AudioFX.hurt();
    setTimeout(() => {
      this.els.death.classList.remove('show');
      if (retry) retry();
    }, 2400);
  },

  shakeStage() {
    const s = this.els.stage;
    s.classList.remove('shake');
    void s.offsetWidth;
    s.classList.add('shake');
    setTimeout(() => s.classList.remove('shake'), 500);
  },

  /* ---------------- 场景呈现 ---------------- */
  setBg(key) {
    this.els.bg.innerHTML = '';
    this.hidePanel();
    if (!key) return;
    this.els.bg.appendChild(buildAsset(key, 'bg'));
  },

  setChars(chars) {
    this.els.chars.innerHTML = '';
    (chars || []).forEach((c) => {
      const wrap = document.createElement('div');
      wrap.className = 'char char-' + c.slot;
      wrap.id = 'char-' + c.id;
      const fig = buildAsset(c.asset || null, 'char');
      wrap.appendChild(fig);
      const name = document.createElement('div');
      name.className = 'char-name';
      name.textContent = c.id === 'tourist' ? (this.player.name || '游客') : (CHAR_DEFS[c.id] ? CHAR_DEFS[c.id].name : c.id);
      wrap.appendChild(name);
      this.els.chars.appendChild(wrap);
    });
  },

  setLight(level) {
    this._lightLevel = level;
    const L = this.els.light;
    if (!level) {
      cancelAnimationFrame(this._lightRaf);
      this._lightRaf = null;
      L.classList.remove('show');
      this.els.flame.classList.remove('show');
      return;
    }
    L.classList.add('show');
    this.els.flame.classList.add('show');
    this.els.flame.classList.toggle('torch', level === 'torch');
    const r = level === 'torch' ? SETTINGS.torchRadius : SETTINGS.matchRadius;
    this._lightRadius = r;
    this._lx = window.innerWidth / 2;
    this._ly = window.innerHeight / 2;
    L.style.setProperty('--lr', r + 'px');
    cancelAnimationFrame(this._lightRaf);
    this._lightLoop();
  },

  _lightLoop() {
    if (!this._lightLevel) return;
    const t = { x: this._tx != null ? this._tx : window.innerWidth / 2, y: this._ty != null ? this._ty : window.innerHeight / 2 };
    this._lx += (t.x - this._lx) * 0.14;
    this._ly += (t.y - this._ly) * 0.14;
    this.els.light.style.setProperty('--lx', this._lx + 'px');
    this.els.light.style.setProperty('--ly', this._ly + 'px');
    this.els.flame.style.left = this._lx + 'px';
    this.els.flame.style.top = (this._ly - 10) + 'px';
    this._lightRaf = requestAnimationFrame(() => this._lightLoop());
  },

  pointerMove(x, y) { this._tx = x; this._ty = y; },

  /* ---------------- 工具 ---------------- */
  setStageShake(on) {
    this.els.stage.classList.toggle('shake-hold', on);
  },
};

/* ---------- 打字机 ---------- */
function typewriter(el, text, ms, onTick) {
  let i = 0, stopped = false;
  el.textContent = '';
  const PUNCT = '，。！？…—、；：';
  function step() {
    if (stopped) { el.textContent = text; return; }
    if (i >= text.length) return;
    const ch = text[i++];
    el.textContent += ch;
    if (i % 4 === 0) AudioFX.typeTick();
    const delay = PUNCT.includes(ch) ? 140 : (ms || 30);
    setTimeout(step, delay);
  }
  step();
  return { finish() { stopped = true; el.textContent = text; } };
}

/* ---------- 素材/占位构建 ---------- */
function buildAsset(key, kind) {
  const box = document.createElement('div');
  box.className = 'asset asset-' + kind;
  const def = key ? (ASSETS[key] || { src: '', note: '' }) : { src: '', note: '' };
  const label = key ? (PLACE_LABEL[key] || key) : '素材';
  function showPh() {
    box.innerHTML = '';
    const ph = document.createElement('div');
    ph.className = 'ph ph-' + kind;
    ph.innerHTML =
      '<span class="ph-tag">素材占位</span>' +
      '<span class="ph-label">' + label + '</span>' +
      (def.note ? '<span class="ph-note">' + def.note + '</span>' : '');
    box.appendChild(ph);
  }
  showPh();
  if (def.src) {
    const img = new Image();
    img.className = 'asset-img';
    img.alt = label;
    img.onload = () => { box.innerHTML = ''; box.appendChild(img); };
    img.onerror = showPh;
    img.src = def.src;
  }
  return box;
}
