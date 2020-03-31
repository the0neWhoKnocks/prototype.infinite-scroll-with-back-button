# Prototype: Infinite Scroll with Back Button

When dealing with Infinite Scroll, one issue that comes up a lot with users is
the annoyance of losing their place on the page if they have to refresh or click
on a link that goes to another page. This repo demonstrates one way in which
you can maintain state for an Infinite Scroll experience in a non-SPA
environment.

![infinite-scroll-with-back-button](https://user-images.githubusercontent.com/344140/78048559-bde7db00-732e-11ea-888a-c739909558ef.gif)

In the above capture, you'll see there's a boilerplate site that allows for
true infinite scroll since it just generates the pages on the fly and isn't
dependent on a service. It utilizes `window.history.state` to maintain this
simple data payload:

```js
{
  infiniteScroll: {
    pages: <Array>,
    pageHeight: <String|Number>,
    scrollTop: <Number>,
  }
}
```

| Prop | Type | Default | What They Do |
| ---- | ---- | ------- | ------------ |
| `pages` | `Array` | `[]` | As a user scrolls and new pages are requested, this Array gets updated with a resource that aids in reloading that same page's data. In this repo, it's just keeping track of the page number, but in a Production scenario it would most likely keep track of URLs that would return a data payload. When a User navigates away from the Infinite Scroll page and then back, if this Array has content it'll iterate over the Array and reload all previously loaded pages that were in view when the User navigated away. |
| `pageHeight` | `String` or `Number` | `'auto'` |  The full current scroll height of the page before the User navigated away from the page. When a User navigates back to the Infinite Scroll page, the page's height will be set to what it was so that the scroll position can be updated. |
| `scrollTop` | `Number` | `0` | The current scroll position before the User navigated away. On return to the Infinite Scroll page, after the height of the page is adjusted, the scroll position will be set back to this value. |

Things to note:
- The `Go Back` button on the PDP utilizes `history.back()` to emulate what the
Browser would do. You can click on the Browser's Back button and still get the
same results.
- There is a simulated delay during the reloading of pages. For every page that
is being loaded, an extra `100` milliseconds is added to simulate a possible
Network bottleneck that may occur in a Production scenario.
  - This simulated delay can be disabled by adding the query param `?no-delay`.
- The animated scrolling that occurs after the previous data has loaded is done
  so via this CSS rule:
  ```css
  html {
    scroll-behavior: smooth;
  }
  ```
  and was done so to eliminate the sudden pop to another part of the page. There
  may be a better solution, but this was the least jarring.
- Currently if a User scrolls and loads multiple pages, then scrolls back up to
say "page 2". When they navigate away, the non-visible pages will be removed
and not re-loaded when they go back to the Infinite Scroll page.
  - Another optimization could be to re-load just the last page's data, detect
  when the User scrolls up to the previous page, and then load that data on
  demand.
- If a User resizes their Browser while on a PDP, then navigates back to the
Infinite Scroll page, the re-positioning of the page will be effected. One
possible fix would be to keep track of the currently selected item, and ensure
you're scrolled to it, instead of the previous scroll postition.

---

## Install

```sh
yarn
# or
npm i
```

## Run

```sh
yarn start
# or
npm run start
```