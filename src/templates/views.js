export const pdp = (url) => {
  const u = new URL(url);
  return `
    <section class="pdp">
      <h1>Product #${u.searchParams.get('product')}</h1>
      Ima Fake PDP
      <button type="button" class="pdp__back-btn" onclick="history.back()">&lt;&lt;Go Back</button>
    </section>
  `;
};

export const LOAD_MORE_SELECTOR = 'load-more-waypoint';
export const wall = () => {
  const leftNav = require('./leftNav').default;
  const products = require('./products').default;
  
  return `
    <section class="wall">
      <section class="wall__results">
        ${leftNav({ linkCount: 10 })}
        <div class="products">
          ${products().join('')}
          <div class="${LOAD_MORE_SELECTOR}" data-next-page="2"></div>
        </div>
      </section>
    </section>
  `;
};