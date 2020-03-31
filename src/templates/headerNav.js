const headerNav = ({ linkCount = 1 }) => {
  const links = Array(linkCount)
    .fill('')
    .map((str, ndx) => {
      return `<a href="#" class="top-nav__link">Link ${ndx + 1}</a>`;
    });
  return `<nav class="top-nav">${links.join('')}</nav>`;
};

export default headerNav;
