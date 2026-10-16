/** Continuous native scrolling with inaccessible copies for a seamless loop. */
export const createPartnerCarousel = root => {
  const section = root.querySelector('[data-qn-partner-section]');
  const track = section.querySelector('[data-qn-partners]');
  const previous = section.querySelector('[data-qn-partner-direction="-1"]');
  const next = section.querySelector('[data-qn-partner-direction="1"]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let period = 0;
  let step = 0;
  let focused = false;
  let dragging = false;
  let visible = false;
  let frame = 0;
  let previousTime = 0;
  let position = 0;
  let manualUntil = 0;
  let resumeTimer;
  let settleTimer;
  let resizeFrame;

  const stop = () => {
    cancelAnimationFrame(frame);
    clearTimeout(resumeTimer);
    frame = 0;
    previousTime = 0;
  };
  const canRun = () => period && visible && !focused && !dragging && !document.hidden;
  const tick = time => {
    if (!canRun()) { stop(); return; }
    if (previousTime) {
      position += Math.min(time - previousTime, 64) * 0.044;
      position = period + ((position - period) % period + period) % period;
      track.scrollTo({ left: position, behavior: 'instant' });
    }
    previousTime = time;
    frame = requestAnimationFrame(tick);
  };
  const schedule = () => {
    stop();
    if (!canRun()) return;
    const delay = manualUntil - performance.now();
    if (delay > 0) { resumeTimer = setTimeout(schedule, delay); return; }
    position = track.scrollLeft;
    frame = requestAnimationFrame(tick);
  };
  const rebase = () => {
    if (!period) return;
    const position = track.scrollLeft;
    if (position >= period - 1 && position < 2 * period - 1) return;
    const offset = ((position - period) % period + period) % period;
    const target = Math.abs(position - 2 * period) < 1 ? period : period + offset;
    if (Math.abs(target - position) > 1) track.scrollTo({ left: target, behavior: 'instant' });
  };
  const move = direction => {
    if (!period) return;
    stop();
    clearTimeout(settleTimer);
    manualUntil = performance.now() + 1000;
    rebase();
    track.scrollBy({ left: direction * step, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    schedule();
  };
  const clone = element => {
    const copy = element.cloneNode(true);
    copy.setAttribute('data-qn-partner-clone', '');
    copy.setAttribute('aria-hidden', 'true');
    copy.setAttribute('inert', '');
    copy.removeAttribute('id');
    copy.querySelectorAll('[id]').forEach(child => child.removeAttribute('id'));
    copy.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach(child => child.setAttribute('tabindex', '-1'));
    if (copy.matches('a, button, [tabindex]')) copy.setAttribute('tabindex', '-1');
    copy.querySelectorAll('img').forEach(img => { img.alt = ''; });
    return copy;
  };
  const refresh = () => {
    stop();
    clearTimeout(settleTimer);
    focused = track.contains(document.activeElement);
    manualUntil = 0;
    track.querySelectorAll('[data-qn-partner-clone]').forEach(element => element.remove());
    period = 0;
    track.scrollTo({ left: 0, behavior: 'instant' });
    const slides = [...track.children];
    const overflow = slides.length > 1 && track.scrollWidth > track.clientWidth + 1;
    previous.disabled = next.disabled = !overflow;
    if (!overflow) return;
    const leading = document.createDocumentFragment();
    const trailing = document.createDocumentFragment();
    slides.forEach(slide => { leading.append(clone(slide)); trailing.append(clone(slide)); });
    track.prepend(leading);
    track.append(trailing);
    const first = slides[0].getBoundingClientRect();
    period = first.left - track.firstElementChild.getBoundingClientRect().left;
    step = slides[1].getBoundingClientRect().left - first.left;
    track.scrollTo({ left: period, behavior: 'instant' });
    schedule();
  };

  track.addEventListener('scroll', () => {
    if (frame || dragging) return;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => { rebase(); schedule(); }, 160);
  }, { passive: true });
  track.addEventListener('keydown', event => {
    if (!period || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    move(event.key === 'ArrowLeft' ? -1 : 1);
  });
  section.addEventListener('focusin', () => {
    focused = track.contains(document.activeElement);
    schedule();
  });
  section.addEventListener('focusout', event => {
    focused = track.contains(event.relatedTarget);
    schedule();
  });
  track.addEventListener('pointerdown', () => { dragging = true; stop(); }, { passive: true });
  const release = () => {
    if (dragging) { dragging = false; manualUntil = performance.now() + 1000; schedule(); }
  };
  window.addEventListener('pointerup', release, { passive: true });
  window.addEventListener('pointercancel', release, { passive: true });
  track.addEventListener('wheel', () => { manualUntil = performance.now() + 1000; schedule(); }, { passive: true });
  document.addEventListener('visibilitychange', schedule);
  if (typeof IntersectionObserver !== 'undefined') {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }).observe(section);
  } else visible = true;
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(refresh);
    }).observe(track);
  } else window.addEventListener('resize', refresh);
  window.addEventListener('pagehide', () => { stop(); clearTimeout(settleTimer); });
  window.addEventListener('pageshow', schedule);
  return { refresh, move };
};
