/* ============================================================
 * 《阙下归人》· 小游戏/交互节点
 * 火柴点火 · 观察教学 · 黑影惊吓 · 聆听声波 · 剧情回顾
 * ============================================================ */

'use strict';

const Minigames = {
  async run(node) {
    switch (node.type) {
      case 'minigame':
        if (node.id === 'strike-match') return this.strikeMatch(node);
        break;
      case 'observe': return this.observe(node);
      case 'scare':   return this.scare(node);
      case 'listen':  return this.listen(node);
      case 'review':  return this.review(node);
      case 'blood':   return this.blood(node);
      case 'document': return this.document(node);
    }
  },

  /* ---------------- 火柴点火 ---------------- */
  strikeMatch(node) {
    return new Promise((resolve) => {
      Engine.hint(node.hint);
      Engine.hideDlg();
      const layer = document.getElementById('minigame-layer');
      layer.innerHTML = '';
      layer.classList.add('show');

      const game = document.createElement('div');
      game.className = 'match-game';
      game.innerHTML =
        '<div class="mg-title">点亮光源 · 擦燃火柴</div>' +
        '<div class="match-area">' +
          '<div class="match" id="mg-match"><div class="stick"></div><div class="head"></div><div class="match-flame"></div></div>' +
          '<div class="striker"><div class="striker-fill"></div><div class="spark-holder"></div><span class="striker-label">按住火柴向右滑动</span></div>' +
        '</div>';
      layer.appendChild(game);

      const match = game.querySelector('#mg-match');
      const fill = game.querySelector('.striker-fill');
      const striker = game.querySelector('.striker');
      const flame = match.querySelector('.match-flame');
      let dragging = false, dx = 0, lit = false;
      const max = SETTINGS.matchDrag;

      const update = () => {
        match.style.transform = `translateX(${dx}px)`;
        fill.style.width = Math.min(100, (dx / max) * 100) + '%';
      };
      update();

      const spark = () => {
        if (Math.random() < 0.55) {
          const s = document.createElement('i');
          s.className = 'spark';
          s.style.left = (dx + 26) + 'px';
          const holder = striker.querySelector('.spark-holder');
          if (holder) holder.appendChild(s);
          setTimeout(() => s.remove(), 380);
        }
      };

      const down = (e) => {
        if (lit) return;
        dragging = true;
        match.setPointerCapture && match.setPointerCapture(e.pointerId);
        AudioFX.strike();
      };
      const move = (e) => {
        if (!dragging || lit) return;
        dx = Math.max(0, Math.min(max * 1.6, dx + e.movementX));
        update();
        if (dx > 24) spark();
        if (dx >= max) ignite();
      };
      const up = () => {
        if (!dragging) return;
        dragging = false;
        if (!lit) {
          match.style.transition = 'transform .45s cubic-bezier(.2,.8,.3,1)';
          dx = 0; update();
          setTimeout(() => { match.style.transition = ''; }, 480);
        }
      };

      const ignite = () => {
        if (lit) return;
        lit = true; dragging = false;
        flame.classList.add('on');
        AudioFX.flame();
        match.classList.add('lit');
        Engine.toast('火种已燃——周围亮了起来', 'good');
        setTimeout(() => {
          Engine.setLight('match');
          layer.classList.remove('show');
          layer.innerHTML = '';
          resolve();
        }, 1000);
      };

      match.addEventListener('pointerdown', down);
      match.addEventListener('pointermove', move);
      match.addEventListener('pointerup', up);
      match.addEventListener('pointercancel', up);
      // 兼容旧浏览器无 movementX
      let lastX = null;
      match.addEventListener('pointerdown', (e) => { lastX = e.clientX; });
      match.addEventListener('pointermove', (e) => {
        if (e.movementX === undefined && dragging && !lit) {
          if (lastX != null) dx = Math.max(0, Math.min(max * 1.6, dx + (e.clientX - lastX)));
          lastX = e.clientX;
          update();
          if (dx > 24) spark();
          if (dx >= max) ignite();
        }
      });
    });
  },

  /* ---------------- 观察教学 ---------------- */
  observe(node) {
    return new Promise((resolve) => {
      Engine.hint(node.hint);
      Engine.hideDlg();
      Engine.setLight(node.light || 'match');
      const layer = document.getElementById('minigame-layer');
      layer.innerHTML = '';
      layer.classList.add('show');

      let obsBusy = false; // 串行化观察播报，避免文本互相覆盖
      let remaining = node.points.length;
      node.points.forEach((pt) => {
        const d = document.createElement('button');
        d.className = 'ob-dot';
        d.style.left = pt.x + '%';
        d.style.top = pt.y + '%';
        d.innerHTML = `<span class="ob-pulse"></span><span class="ob-label">${pt.label}</span>`;
        d.addEventListener('pointerdown', (e) => e.stopPropagation()); // 避免误触发对话推进
        d.addEventListener('click', () => {
          if (d.classList.contains('done') || obsBusy) return;
          d.classList.add('done');
          obsBusy = true;
          AudioFX.click();
          remaining--;
          Engine.renderLine({ cls: 'narration', name: '观察', text: pt.text }, { log: null, chars: [] }, 3000).then(() => {
            obsBusy = false;
            if (remaining <= 0) {
              Engine.toast('观察完成——你正想松一口气……', 'good');
              setTimeout(() => {
                layer.classList.remove('show');
                layer.innerHTML = '';
                resolve();
              }, 700);
            }
          });
        });
        layer.appendChild(d);
      });
    });
  },

  /* ---------------- 黑影惊吓 ---------------- */
  scare(node) {
    return new Promise((resolve) => {
      Engine.hint(node.hint);
      Engine.hideDlg();
      const fx = Engine.els.fx;
      const lunge = document.createElement('div');
      lunge.className = 'lunge';
      lunge.innerHTML =
        '<div class="lunge-figure"></div>' +
        '<span class="ph-tag">素材占位</span><span class="lunge-note">特效·黑影扑屏（程序模拟，可替换贴图）</span>';
      fx.appendChild(lunge);

      const seq = [
        () => { Engine.els.stage.classList.add('flicker'); AudioFX.whoosh(); },
        () => { Engine.els.stage.classList.remove('flicker'); },
        () => { Engine.els.stage.classList.add('flicker'); },
        () => { Engine.els.stage.classList.remove('flicker'); },
        () => { lunge.classList.add('go'); AudioFX.scare(); Engine.shakeStage(); Engine.els.vignette.classList.add('red'); },
      ];
      let i = 0;
      const step = () => {
        if (i < seq.length) { seq[i](); i++; setTimeout(step, i < 4 ? 260 : 0); }
        else {
          setTimeout(() => {
            lunge.classList.add('out');
            Engine.els.vignette.classList.remove('red');
            setTimeout(() => { lunge.remove(); resolve(); }, 600);
          }, SETTINGS.scareDur);
        }
      };
      setTimeout(step, 500);
    });
  },

  /* ---------------- 聆听声波 ---------------- */
  listen(node) {
    const count = node.count || SETTINGS.waveCount;
    return new Promise((resolve) => {
      Engine.hint(node.hint);
      Engine.hideDlg();
      Engine.setLight(Engine.items.has('火把') ? 'torch' : 'match');

      const layer = document.getElementById('minigame-layer');
      const build = (again) => {
        layer.innerHTML = '';
        layer.classList.add('show');
        const btn = document.createElement('button');
        btn.className = 'listen-btn';
        btn.textContent = again ? '再听一次' : '仔细聆听';
        layer.appendChild(btn);

        btn.addEventListener('click', () => {
          AudioFX.click();
          btn.remove();
          spawn();
        });
      };

      const spawn = () => {
        AudioFX.droneStart();
        Engine.toast('墓室深处传来阵阵声响……', 'info');
        const slots = [[18, 28], [50, 14], [82, 30], [26, 68], [68, 66]];
        const order = shuffle(slots.slice(0, count));
        const strongest = Math.floor(Math.random() * count);
        const wrap = document.createElement('div');
        wrap.className = 'waves';
        layer.appendChild(wrap);

        order.forEach((pos, idx) => {
          const w = document.createElement('button');
          w.className = 'wave';
          const rings = idx === strongest ? 4 : 2 + (idx % 2);
          let html = '<span class="wave-core"></span>';
          for (let r = 0; r < rings; r++) html += '<i></i>';
          w.innerHTML = html;
          w.style.left = pos[0] + '%';
          w.style.top = pos[1] + '%';
          if (idx === strongest) w.classList.add('hot');
          w.addEventListener('click', () => {
            if (wrap.classList.contains('solved')) return;
            if (idx === strongest) {
              wrap.classList.add('solved');
              w.classList.add('hit');
              AudioFX.success();
              Engine.toast('就是这里！声响最强烈……', 'good');
              Engine.hint('声波选定——场景切换');
              setTimeout(() => {
                layer.classList.remove('show');
                layer.innerHTML = '';
                resolve();
              }, 1300);
            } else {
              w.classList.add('miss');
              setTimeout(() => w.classList.remove('miss'), 500);
              if (Engine.mode === 'tour') {
                Engine.toast('似乎我们还不了解前面的，请点击声波最强烈之处', 'warn');
                AudioFX.wrong();
              } else {
                Engine.toast('听错了方向……心神 -1', 'bad');
                Engine.damage('心神损耗……');
                if (Engine.hp <= 0) {
                  wrap.classList.add('solved');
                  Engine.die('心神耗尽——你被黑暗吞没了……', () => {
                    Engine.restoreHp();
                    build(true);
                  });
                }
              }
            }
          });
          wrap.appendChild(w);
        });
      };

      build(false);
    });
  },

  /* ---------------- 血泪喷溅转场（第二幕·凤鸟泣血） ---------------- */
  blood(node) {
    return new Promise((resolve) => {
      Engine.hint(node.hint);
      Engine.hideDlg();
      const fx = Engine.els.fx;
      const wrap = document.createElement('div');
      wrap.className = 'blood';
      wrap.innerHTML =
        '<div class="blood-flash"></div>' +
        '<span class="ph-tag">素材占位</span><span class="blood-note">特效·血泪喷溅动图（程序模拟血滴，可替换动图）</span>';
      for (let i = 0; i < 7; i++) {
        const d = document.createElement('i');
        d.className = 'drip';
        d.style.left = (6 + Math.random() * 88) + '%';
        d.style.animationDelay = (Math.random() * 0.9) + 's';
        d.style.animationDuration = (1.1 + Math.random() * 0.9) + 's';
        wrap.appendChild(d);
      }
      fx.appendChild(wrap);
      Engine.els.vignette.classList.add('red');
      AudioFX.scare();
      Engine.shakeStage();
      setTimeout(() => { wrap.classList.add('out'); Engine.els.vignette.classList.remove('red'); }, 1900);
      setTimeout(() => { wrap.remove(); resolve(); }, 2600);
    });
  },

  /* ---------------- 文档交互（第二幕·名帖） ---------------- */
  document(node) {
    return new Promise((resolve) => {
      if (node.bg) Engine.setBg(node.bg);
      if (node.chars) Engine.setChars(node.chars);
      Engine.setLight(node.light || null);
      Engine.hint(node.hint || '');
      Engine.hideDlg();

      // 写入剧情回顾（探案模式可在回顾中找出）
      const logId = node.log;
      if (logId) {
        Engine.logs[logId] = Engine.logs[logId] || [];
        (node.lines || []).forEach((t) => {
          Engine.logs[logId].push({ doc: true, name: node.docName || '名帖', text: t, evidence: node.evidence || null });
        });
      }

      const layer = document.getElementById('minigame-layer');
      layer.innerHTML = '';
      layer.classList.add('show');
      const card = document.createElement('button');
      card.className = 'doc-card';
      card.innerHTML = '<span class="ob-pulse"></span><span class="doc-card-icon">📜</span><span class="doc-card-label">名帖</span>';
      card.addEventListener('pointerdown', (e) => e.stopPropagation());
      card.addEventListener('click', () => {
        if (card.classList.contains('done')) return;
        card.classList.add('done');
        AudioFX.click();
        Engine.openDocument(node.docTitle || '', node.lines || []).then(() => {
          // 游览模式：读完名帖自动收录
          if (Engine.mode === 'tour') {
            (node.evidence || []).forEach((id) => Engine.collectEvidence(id));
          }
          layer.classList.remove('show');
          layer.innerHTML = '';
          resolve();
        });
      });
      layer.appendChild(card);
    });
  },

  /* ---------------- 剧情回顾（探案模式核心） ---------------- */
  review(node) {
    if (Engine.mode !== 'detective') return Promise.resolve(); // 游览模式：关键句已自动发光收录
    const log = Engine.logs[node.logId] || [];
    const keyIds = [];
    log.forEach((l) => { if (l.evidence) l.evidence.forEach((id) => { if (!keyIds.includes(id)) keyIds.push(id); }); });

    return new Promise((resolve) => {
      const open = () => {
        const list = Engine.els.reviewList;
        list.innerHTML = '';
        Engine.els.reviewHint.textContent =
          '关键句不会发光——请从这段对白中，找出能证明墓主身份的关键证据。找错会损耗心神（-1），心神耗尽将重来。';
        Engine.els.reviewDone.classList.remove('show');

        const rows = [];
        const updateProgress = () => {
          const got = keyIds.filter((id) => Engine.hasEvidence(id)).length;
          Engine.els.reviewProgress.textContent = `已找到关键证据 ${got} / ${keyIds.length}`;
        };

        log.forEach((l) => {
          if (!l.speaker && !l.doc) return; // 仅对白句与文档可点击
          const row = document.createElement('button');
          row.className = 'rev-line';
          let who, color;
          if (l.doc) { who = '【' + (l.name || '名帖') + '】'; color = '#c9a86a'; }
          else {
            who = l.speaker === 'tourist' ? (Engine.player.name || '游客') : (CHAR_DEFS[l.speaker] ? CHAR_DEFS[l.speaker].name : l.speaker);
            color = CHAR_DEFS[l.speaker] ? CHAR_DEFS[l.speaker].color : '#ccc';
          }
          row.innerHTML = `<span class="rev-who" style="color:${color}">${who}</span><span class="rev-text">${l.text}</span><span class="rev-mark"></span>`;
          const markGot = (r) => { r.classList.add('got'); r.querySelector('.rev-mark').textContent = '✓ 已收录'; };
          row.addEventListener('click', () => {
            if (row.classList.contains('got') || row.classList.contains('wrong')) return;
            const ids = l.evidence || [];
            if (ids.length) {
              // 证据已收录过的来源句：直接标记，不扣心神
              if (ids.every((id) => Engine.hasEvidence(id))) { markGot(row); return; }
              ids.forEach((id) => Engine.collectEvidence(id));
              // 同一证据的其他来源句一并标记
              rows.forEach(({ row: r2, l: l2 }) => {
                if (l2.evidence && l2.evidence.length && l2.evidence.every((id) => Engine.hasEvidence(id))) markGot(r2);
              });
              updateProgress();
              if (keyIds.every((id) => Engine.hasEvidence(id))) {
                Engine.toast('关键证据已全部收录！', 'good');
                Engine.els.reviewDone.classList.add('show');
              }
            } else {
              row.classList.add('wrong');
              row.querySelector('.rev-mark').textContent = '无关';
              Engine.toast('无关紧要的句子……心神 -1', 'bad');
              Engine.damage('无关紧要的句子……');
              if (Engine.hp <= 0) {
                Engine.die('心神耗尽——线索湮灭，重新来过……', () => {
                  Engine.restoreHp();
                  open();
                });
              }
            }
          });
          list.appendChild(row);
          rows.push({ row, l });
        });
        updateProgress();

        Engine.els.reviewDone.onclick = () => {
          AudioFX.click();
          Engine.els.review.classList.remove('show');
          resolve();
        };
        Engine.els.review.classList.add('show');
      };
      open();
    });
  },
};

/* ---------- 工具 ---------- */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
