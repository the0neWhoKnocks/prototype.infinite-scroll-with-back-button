function insert(markup) {
  const div = document.createElement('div');
  const frag = document.createDocumentFragment();
  
  div.innerHTML = markup.trim();
  [...div.children].forEach(child => frag.appendChild(child));
  
  return {
    before: el => el.parentNode.insertBefore(frag, el),
  };
}

export default insert;
