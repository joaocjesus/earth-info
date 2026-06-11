/**
 * Svelte action: keep Tab focus inside `node` while mounted, focus it on
 * mount, and restore focus to the previously focused element on destroy.
 */
const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function trapFocus(node) {
  const previous = document.activeElement;
  node.focus();

  function onKeydown(e) {
    if (e.key !== 'Tab') return;
    const focusables = node.querySelectorAll(FOCUSABLE);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === node)) {
      last.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === last) {
      first.focus();
      e.preventDefault();
    }
  }

  node.addEventListener('keydown', onKeydown);
  return {
    destroy() {
      node.removeEventListener('keydown', onKeydown);
      previous?.focus?.();
    }
  };
}
