export default function (parentEl) {
  while (parentEl.firstElementChild) {
    parentEl.removeChild(parentEl.firstElementChild);
  }
}
