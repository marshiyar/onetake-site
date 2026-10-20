# onetake-site

The website for [oneTake](https://github.com/marshiyar/oneTake), a native video editor for macOS, Windows and Linux.

Next.js, exported as a static site and served by GitHub Pages. The download buttons read the latest release of
`marshiyar/oneTake` from the GitHub API in the browser, so a new release shows up without a site deploy.

```sh
npm install
npm run dev        # http://localhost:3000/onetake-site
npm test           # release parsing and OS detection
npm run build      # static site in out/
```

`BASE_PATH` sets the path the site is served under (`/onetake-site` on github.io, empty on a custom domain).
