import { team } from './team-data.mjs';
import { renderTeam } from './team-cards.mjs';
const grid = document.querySelector('#team-grid');
grid.innerHTML = renderTeam(team);

// ── Video modal ───────────────────────────────────────────────────────────────
const modal = document.createElement('dialog');
modal.className = 'team-video-modal';
modal.innerHTML = `<button class="team-modal-close" aria-label="Close video">×</button><div class="team-modal-inner"><video controls playsinline preload="none"></video></div>`;
document.body.append(modal);
const modalVideo = modal.querySelector('video');
const closeModal = () => { modalVideo.pause(); modalVideo.src = ''; modal.close(); };
modal.querySelector('.team-modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
modal.addEventListener('cancel', () => { try { modalVideo.pause(); } catch(e) {} modalVideo.removeAttribute('src'); });
document.addEventListener('click', e => {
  const btn = e.target.closest('.team-play-btn');
  if (!btn) return;
  modalVideo.poster = btn.dataset.poster || '';
  modalVideo.src = btn.dataset.src;
  modal.showModal();
  modalVideo.play().catch(() => {});
});
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const saveData = navigator.connection?.saveData;
document.querySelectorAll('[data-team-video]').forEach(video => {
  let visible = false;
  let userPaused = false;
  let automaticPause = false;
  video.muted = true;
  const play = () => {
    if (!visible || document.hidden || reducedMotion.matches || saveData || userPaused) return;
    video.play().catch(() => {});
  };
  const pause = () => {
    if (!video.paused) { automaticPause = true; video.pause(); }
  };
  video.addEventListener('pause', () => {
    if (!automaticPause && visible && !document.hidden) userPaused = true;
    automaticPause = false;
  });
  video.addEventListener('play', () => { userPaused = false; });
  video.addEventListener('error', () => {
    const panel = video.closest('.video-panel');
    if (panel.querySelector('.video-unavailable')) return;
    const message = document.createElement('p');
    message.className = 'video-unavailable';
    message.textContent = 'Video unavailable. Please try again later.';
    panel.append(message);
  });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) {
      if (video.preload === 'none') { video.preload = 'metadata'; video.load(); }
      play();
    } else pause();
  }, { threshold: .2 }).observe(video);
  document.addEventListener('visibilitychange', () => document.hidden ? pause() : play());
  reducedMotion.addEventListener('change', () => reducedMotion.matches ? pause() : play());
});
