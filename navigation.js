// Керована прокрутка з м'яким початком і завершенням та можливістю перервати рух.
export function initSmoothNavigation() {
  const header = document.querySelector('.header');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = null;
  const stop = () => { if (frame !== null) cancelAnimationFrame(frame); frame = null; };
  const ease = progress => progress < .5 ? 16 * progress ** 5 : 1 - (-2 * progress + 2) ** 5 / 2;
  header.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    event.preventDefault(); stop();
    const start = window.scrollY;
    const destination = Math.max(0, Math.min(target.getBoundingClientRect().top + start - header.offsetHeight - 16, document.documentElement.scrollHeight - window.innerHeight));
    const distance = destination - start;
    const focusTarget = () => {
      if (event.detail !== 0) return;
      const heading = target.querySelector('h1,h2') || target;
      heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true });
    };
    if (location.hash !== link.hash) history.pushState(null, '', link.hash);
    if (reducedMotion.matches || Math.abs(distance) < 2) {
      window.scrollTo({ top: destination, behavior: 'instant' }); focusTarget(); return;
    }
    const duration = Math.min(1400, Math.max(850, 750 + Math.abs(distance) * .12));
    const begin = performance.now();
    const tick = now => {
      const progress = Math.min(1, (now - begin) / duration);
      window.scrollTo({ top: start + distance * ease(progress), behavior: 'instant' });
      if (progress < 1) frame = requestAnimationFrame(tick);
      else { frame = null; focusTarget(); }
    };
    frame = requestAnimationFrame(tick);
  });
  window.addEventListener('wheel', stop, { passive: true });
  window.addEventListener('touchstart', stop, { passive: true });
  window.addEventListener('keydown', event => {
    if (['ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown', 'Escape', ' '].includes(event.key)) stop();
  });
  reducedMotion.addEventListener('change', stop);
}
