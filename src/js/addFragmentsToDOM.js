export default function (fragmentParts, fragmentDestination) {
  const fragment = document.createDocumentFragment();
  fragmentParts.forEach(fragmentPart => fragment.appendChild(fragmentPart));
  fragmentDestination.appendChild(fragment);
}
