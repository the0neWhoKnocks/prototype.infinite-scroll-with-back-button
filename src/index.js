import merge from 'extend';
import 'waypoints/lib/noframework.waypoints.min.js';
import headerNav from './templates/headerNav';
import products, {
  PRODUCT_SELECTOR,
  PRODUCTS_PER_PAGE,
} from './templates/products';
import {
  LOAD_MORE_SELECTOR,
  pdp,
  wall,
} from './templates/views';
import insert from './utils/insert';
import './styles.css';


const appEl = document.getElementById('app');
let pageMarkup = '';

// ROUTE = PDP
if (window.location.search.includes('product')) {
  pageMarkup = pdp(window.location.href);
} 
// ROUTE = Wall
else {
  const DELAY_ENABLED = !window.location.search.includes('no-delay');
  const DEFAULT_STATE = {
    infiniteScroll: {
      pages: [],
      pageHeight: 'auto',
      scrollTop: 0,
    }
  };
  let loadMoreWaypoint;
  
  function updateHistoryState(newData = {}) {
    window.history.replaceState(
      merge(true, {}, DEFAULT_STATE, newData),
      document.title,
      window.location.href
    );
  }
  
  function handleLoadMoreWaypoint(direction) {
    if (direction === 'down') {
      const el = loadMoreWaypoint.element;
      const nextPage = +el.dataset.nextPage;
      const productsMarkup = products({ offset: nextPage });
      const pages = (window.history.state && window.history.state.infiniteScroll)
        ? [...window.history.state.infiniteScroll.pages]
        : [];
      let waypointWasEnabled = false;
      
      // ensure random updates don't get triggered
      if (loadMoreWaypoint.enabled) {
        waypointWasEnabled = true;
        loadMoreWaypoint.disable();
      }
      
      insert(productsMarkup.join('')).before(el);
      
      pages.push(nextPage);
      // reason for using Set https://blog.usejournal.com/performance-of-javascript-array-ops-2690aed47a50
      updateHistoryState({ infiniteScroll: { pages: [...new Set(pages)] } });
      
      if (waypointWasEnabled) loadMoreWaypoint.enable();

      el.dataset.nextPage = nextPage + 1;
      
      if (loadMoreWaypoint.enabled) {
        window.requestAnimationFrame(() => {
          loadMoreWaypoint.context.refresh();
        });
      }
    }
  }
  
  // NOTE - Since I wanted to keep this example as simple as possible, there's 
  // no Server handling routes, so the initial load of the page handles the
  // "routing" on the Client via query params, and the below handler gets
  // triggered once the initial fake SSR occurs.
  function emulatePostDOMLoad() {
    loadMoreWaypoint = new window.Waypoint({
      element: document.querySelector(`.${LOAD_MORE_SELECTOR}`),
      handler: handleLoadMoreWaypoint,
      offset: 'bottom-in-view',
    });
    
    if (
      window.history.state
      && window.history.state.infiniteScroll
    ) {
      const { pages, pageHeight, scrollTop } = window.history.state.infiniteScroll;
      
      loadMoreWaypoint.disable();
      
      // NOTE - Change the body height so that we can scroll down to the
      // previous area where the user was, load all the products, and then
      // reset the height to an automatic value.
      const adjustHeight = !!pages.length;
      // If there were no extra pages previously loaded on the Client, no need
      // to adjust the height, since the Server would have already redndered
      // the items for the first page.
      const origBodyHeight = document.body.style.height;
      if (adjustHeight) {
        document.body.style.height = `${pageHeight}px`;
      }
      
      let spinnerDelay
      if (DELAY_ENABLED) {
        spinnerDelay = setTimeout(() => {
          document.body.classList.add('loading');
        }, 300);
      }
      
      // NOTE - The below is emulating a possible lag while loading all pages.
      Promise.all(pages.map(() => {
        return Promise.resolve().then(() => new Promise((resolvePageLoad) => {
          if (DELAY_ENABLED) {
            setTimeout(() => {
              handleLoadMoreWaypoint('down');
              resolvePageLoad();
            }, 100 * pages.length);
          }
          else {
            handleLoadMoreWaypoint('down');
            resolvePageLoad();
          }
        }));
      }))
      .then(() => {
        window.scrollTo(0, scrollTop);
        
        if (spinnerDelay !== undefined) clearTimeout(spinnerDelay);
        document.body.classList.remove('loading');
        
        if (adjustHeight) document.body.style.height = origBodyHeight;
        
        loadMoreWaypoint.enable();
      });
    }
    else {
      updateHistoryState();
    }

    window.addEventListener('beforeunload', ev => {
      const historyPages = window.history.state.infiniteScroll.pages;
      let trimmedPages = [];
      
      if (historyPages.length) {
        // NOTE - Based on PRODUCTS_PER_PAGE and pages, iterate over
        // PRODUCT_SELECTOR until it's found in the viewport. Anything below
        // a multiple of PRODUCTS_PER_PAGE, can be removed (and not loaded on
        // reload or Back navigation.) Can't use Waypoint for this logic
        // because it's buggy when it comes to certain CSS layouts, especially
        // Grid layouts.
        const products = [...document.querySelectorAll(`.${PRODUCT_SELECTOR}`)];
        const viewportH = window.innerHeight || document.documentElement.clientHeight;
        let productNum;
        
        for(let i = products.length-1; i >= 0; i -= 1) {
          const product = products[i];
          const { bottom, top } = product.getBoundingClientRect();
          
          // If the top or bottom of a product are in view, stop the check
          if (
            (top >= 0 && top <= viewportH)
            || (bottom >= 0 && bottom <= viewportH)
          ) {
            productNum = +product.dataset.productNum;
            console.log(`Product #${productNum} is in the viewport`);
            break;
          }
        }
        
        const maxPages = Math.ceil(productNum / PRODUCTS_PER_PAGE);
        console.log(`Pages should stop loading after: ${maxPages}`);
        // NOTE - Rather than basing the check on an index, keeping it generic
        // in case `pages` values are URLs or something else.
        trimmedPages = historyPages.slice(0, historyPages.indexOf(maxPages) + 1);
      }
      
      updateHistoryState({
        infiniteScroll: {
          pageHeight: document.documentElement.scrollHeight,
          pages: trimmedPages,
          scrollTop: window.scrollY,
        }
      });
      
      window.history.scrollRestoration = 'manual';
    });
  }

  appEl.addEventListener('DOMSubtreeModified', emulatePostDOMLoad, { once: true });

  pageMarkup = wall();
  (DELAY_ENABLED)
    ? document.documentElement.classList.remove('disable--smooth-scroll')
    : document.documentElement.classList.add('disable--smooth-scroll')
}

appEl.innerHTML = `
  ${headerNav({ linkCount: 5 })}
  ${pageMarkup}
`;
