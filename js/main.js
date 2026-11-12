/* ============================================================
 * 《阙下归人》· 入口与界面装配
 * ============================================================ */

'use strict';

window.addEventListener('DOMContentLoaded', () => {
  Engine.init();

  const $ = (id) => document.getElementById(id);

  /* ---------- 标题界面 ---------- */
  $('title-bg').appendChild(buildAsset('bg-title', 'bg'));

  let mode = null;
  let gender = 'f';

  document.querySelectorAll('.mode-card').forEach((card) => {
    card.addEventListener('click', () => {
      mode = card.dataset.mode;
      document.querySelectorAll('.mode-card').forEach((c) => c.classList.toggle('active', c === card));
      $('btn-start').disabled = false;
      AudioFX.click();
      Engine.hint(mode === 'tour' ? '游览模式：关键句自动发光收录' : '探案模式：线索需从“剧情回顾”中自行寻找');
    });
  });

  document.querySelectorAll('.gender-btn').forEach((b) => {
    b.addEventListener('click', () => {
      gender = b.dataset.g;
      document.querySelectorAll('.gender-btn').forEach((x) => x.classList.toggle('active', x === b));
      AudioFX.click();
    });
  });

  $('btn-start').addEventListener('click', () => {
    if (!mode) return;
    AudioFX.unlock();
    const name = ($('player-name').value || '').trim();
    Engine.player = { name: name || '游客', gender };
    Engine.start(mode);
  });

  /* ---------- 结算界面 ---------- */
  $('ending-book').addEventListener('click', () => Engine.openBook());
  $('ending-restart').addEventListener('click', () => location.reload());

  /* ---------- 光照跟随指针 ---------- */
  window.addEventListener('pointermove', (e) => {
    Engine.pointerMove(e.clientX, e.clientY);
  });
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) Engine.pointerMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
});
