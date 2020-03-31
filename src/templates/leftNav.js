const leftNav = ({ linkCount = 1 }) => {
  const links = Array(linkCount)
    .fill('')
    .map((str, ndx) => {
      return `<a href="#" class="left-nav__link">Link ${ndx + 1}</a>`;
    });
  return `<nav class="left-nav">${links.join('')}</nav>`;
};

export default leftNav;
