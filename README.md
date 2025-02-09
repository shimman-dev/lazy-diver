# Lazy Diver

Dive down a web page at your leisure 🌊🤿🪸

---

Extension in action:

![lazy-diver demo example](./docs/lazy-diver-demo.gif)

## Why?

For when you're actively doing something on multiple monitors but you're
too lazy to click on a web page and manually scroll down.

## Usage

### `Start Diving?`

`yes` or `no` toggles represent whether the extension is active. When the extension is active it will scroll down an active tab.

### `Scroll Amount (%)`

The amount of `viewport percentage` the extension will scroll down. `Viewport percentage` represents the total height of your browser window
where the active tab is located. This is not a pixel amount. 

### `Interval (seconds)`

The amount of time the extension will wait between scrolls in `seconds`. Default value is `45 seconds`

## Installation

If you'd like additional browser support please open an issue stating as much.

### Chrome

Currently available on the Chrome Web Store:

[Lazy-Diver Chrome Extension](https://chromewebstore.google.com/detail/lazy-diver/jjomapmjaabdfcmpamfmlalcoaimegjo)

#### Manual Installation

**Please note:** Manual installation requirements are the following:

- Node version `20.18.2` 
- npm version `10.8.2`

---

1. Fork or clone the repo and navigate to the code's directory.
2. After navigating to the repo, install the requirements with `npm install`.
3. When installation is complete, run the command `npm run build`.
	- the `build` command also creates a zip file for your usage as well.
4. Open your Chrome browser and navigate to `chrome://extensions/`, once here click the `Load Packed` (should be located in the upper left-side of the page).
5. You will be prompted with your operating system's file navigation modal. From here navigate to the `lazy-diver-extension` code repo, then
	 select the directory named `dist/`.
6. Click `Select Folder` (some operating systems may have a `Select` button text instead).
7. Find someone you love and tell them that you successfully installed a browser extension (I'm proud of ya' buddy).

