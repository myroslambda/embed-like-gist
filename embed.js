embed();

function embed() {
  const params = (new URL(document.currentScript.src)).searchParams;
  const className = params.toString();
  const target = new URL(params.get("target"));
  const style = params.get("style");
  const trickyDarkStyle = ["an-old-hope", "androidstudio", "arta", "codepen-embed", "darcula", "dracula", "far", "gml", "hopscotch", "hybrid", "monokai", "monokai-sublime", "nord", "obsidian", "ocean", "railscasts", "rainbow", "shades-of-purple", "sunburst", "vs2015", "xt256", "zenburn"]; // dark styles without 'dark', 'black' or 'night' in its name
  const isDarkStyle = style.includes("dark") || style.includes("black") || style.includes("night") || trickyDarkStyle.includes(style);
  const showBorder = params.get("showBorder") === "on";
  const showLineNumbers = params.get("showLineNumbers") === "on";
  const showFileMeta = params.get("showFileMeta") === "on";
  const firstLine = params.get("firstLine");
  const numLines = params.get("numLines");
  const pathSplit = target.pathname.split("/");
  const user = pathSplit[1];
  const repository = pathSplit[2];
  const branch = pathSplit[4];
  const file = pathSplit.slice(5, pathSplit.length).join("/");
  const fileExtension = file.split('.')[file.split('.').length - 1];
  const rawFileURL = `https://raw.githubusercontent.com/${user}/${repository}/${branch}/${file}`;

  // Reserving space for code area should be done in early time
  // or the div may not be found later
  document.write(`
<style>.lds-ring{margin:1rem auto;position:relative;width:60px;height:60px}.lds-ring div{box-sizing:border-box;display:block;position:absolute;width:48px;height:48px;margin:6px;border:6px solid #fff;border-radius:50%;animation:lds-ring 1.2s cubic-bezier(0.5,0,0.5,1) infinite;border-color:#888 transparent transparent transparent}.lds-ring div:nth-child(1){animation-delay:-.45s}.lds-ring div:nth-child(2){animation-delay:-.3s}.lds-ring div:nth-child(3){animation-delay:-.15s}@keyframes lds-ring{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}</style>
<div class="${className}"><div class="lds-ring"><div></div><div></div><div></div><div></div></div></div>
<style>.hljs-ln-numbers{-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;text-align:right;color:#ccc;vertical-align:top}.hljs-ln td.hljs-ln-numbers{padding-right:1.25rem}</style>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.17.1/build/styles/${style}.min.css">
<style>
.file-meta {
  padding: 0.75rem;
  border-radius: 0 0 0.3rem 0.3rem;
  font: 0.8rem -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial,
  sans-serif, Apple Color Emoji, Segoe UI Emoji;
}

.file-meta-light {
  color: #586069;
  background-color: #f7f7f7;
}

.file-meta-dark {
  color: #f7f7f7;
  background-color: #586069;
}

.file-meta a {
  font-weight: 600;
  text-decoration: none;
  border: 0;
}

.file-meta-light a {
  color: #666;
}

.file-meta-dark a {
  color: #fff;
}

/* hide content for small device */
@media (max-width: 575.98px) {
  .hide-in-phone {
    display: none;
  }
}
</style>
`);

  const HLJSURL = "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@9.17.1/build/highlight.min.js";
  const HLJSNumURL = "https://cdn.jsdelivr.net/npm/highlightjs-line-numbers.js@2.7.0/dist/highlightjs-line-numbers.min.js";
  const loadHLJS = (typeof hljs != "undefined" && typeof hljs.highlightBlock != "undefined") ?
    Promise.resolve() : loadScript(HLJSURL);
  let loadHLJSNum;
  if (showLineNumbers) {
    // hljs-num should be loaded only after hljs is loaded
    loadHLJSNum = loadHLJS.then(() =>
      (typeof hljs != "undefined" && typeof hljs.lineNumbersBlock != "undefined") ?
        Promise.resolve() : loadScript(HLJSNumURL)
    )
  }

  const fetchFile = fetch(rawFileURL).then((response) => {
    if (response.ok) {
      return response.text();
    } else {
      return Promise.reject(`${response.status} ${response.statusText}`);
    }
  });

  Promise.all(showLineNumbers ? [fetchFile, loadHLJS, loadHLJSNum] : [fetchFile, loadHLJS]).then((result) => {
    const allDiv = document.getElementsByClassName(className);
    for (let i = 0; i < allDiv.length; i++) {
      if (allDiv[i].getElementsByClassName("lds-ring").length) {
        embedCodeToTarget(allDiv[i], result[0], firstLine, numLines, showBorder, showLineNumbers, showFileMeta, isDarkStyle, target.href, rawFileURL, fileExtension);
      }
    }
  }).catch((error) => {
    const errorMsg = `Failed to process ${rawFileURL}
${error}`;
    const allDiv = document.getElementsByClassName(className);
    for (let i = 0; i < allDiv.length; i++) {
      if (allDiv[i].getElementsByClassName("lds-ring").length) {
        embedCodeToTarget(allDiv[i], errorMsg, showBorder, showLineNumbers, showFileMeta, isDarkStyle, target.href, rawFileURL, 'plaintext');
      }
    }
  });
}

/**
 * Crop text by keeping only numLines starting from firstLine.
 *
 * @text The text to crop lines from.
 * @firstLine The first line to keep (null means 0).
 * @numLines The number of lines to keep (null means all lines till the end).
 */
function cropText(text,firstLine,numLines) {
  if (firstLine == null && numLines == null) {
    return text;
  } else {
    const fl = firstLine ? firstLine : 0;
    const nl = numLines ? numLines : lines.length;
    return text.toString().split('\n').slice(fl,fl+nl).join('\n');
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function embedCodeToTarget(targetDiv, codeText, firstLine, numLines, showBorder, showLineNumbers, showFileMeta, isDarkStyle, fileURL, rawFileURL, lang) {
  const fileContainer = document.createElement("div");
  fileContainer.style.margin = "1em 0";

  const code = document.createElement("code");
  code.style.padding = "1rem";

  if (showFileMeta) {
    code.style.borderRadius = "0.3rem 0.3rem 0 0";
  } else {
    code.style.borderRadius = "0.3rem";
  }
  if (showBorder) {
    if (!isDarkStyle) {
      code.style.border = "1px solid #ddd";
    } else {
      code.style.border = "1px solid #555";
    }
  }
  code.classList.add(lang);
  code.textContent = cropText(codeText, firstLine, numLines);
  if (typeof hljs != "undefined" && typeof hljs.highlightBlock != "undefined") {
    hljs.highlightBlock(code);
  }
  if (typeof hljs != "undefined" && typeof hljs.lineNumbersBlock != "undefined" && showLineNumbers) {
    hljs.lineNumbersBlock(code);
  }

  // Not use a real `pre` to avoid style being overwritten
  // Simulate a real one by using its default style
  const customPre = document.createElement("div");
  customPre.style.whiteSpace = "pre"
  customPre.appendChild(code);
  fileContainer.appendChild(customPre);

  if (showFileMeta) {
    const meta = document.createElement("div");
    const fileURLSplit = fileURL.split("/");
    meta.innerHTML = `<a target="_blank" href="${rawFileURL}" style="float:right">view raw</a>
<a target="_blank" href="${fileURL}">${fileURLSplit[fileURLSplit.length - 1]}</a>
delivered <span class="hide-in-phone">with ❤ </span>by <a target="_blank" href="https://emgithub.com">EmGithub</a>`;
    meta.classList.add("file-meta");
    if (!isDarkStyle) {
      meta.classList.add("file-meta-light");
      if (showBorder) {
        meta.style.border = "1px solid #ddd";
        meta.style.borderTop = "0";
      }
    } else {
      meta.classList.add("file-meta-dark");
      if (showBorder) {
        meta.style.border = "1px solid #555";
        meta.style.borderTop = "0";
      }
    }
    fileContainer.appendChild(meta);
  }
  targetDiv.innerHTML = "";
  targetDiv.appendChild(fileContainer);
}
