export const PRODUCTS_PER_PAGE = 24;
export const PRODUCT_SELECTOR = 'product';

const product = num => `
<a href="/?product=${num}" class="${PRODUCT_SELECTOR}" data-product-num="${num}">Product #${num}</a>
`;

const products = ({ offset = 1, productsCount = PRODUCTS_PER_PAGE } = {}) =>
  Array(productsCount)
    .fill('')
    .map((val, ndx) => product((offset - 1) * productsCount + ndx + 1));

export default products;
