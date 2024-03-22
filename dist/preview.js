"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/preview.ts
var preview_exports = {};
__export(preview_exports, {
  decorators: () => decorators,
  globals: () => globals
});
module.exports = __toCommonJS(preview_exports);

// src/constants.ts
var ADDON_ID = "storybook/pseudo-states";
var TOOL_ID = `${ADDON_ID}/tool`;
var PARAM_KEY = "pseudo";
var EXCLUDED_PSEUDO_ELEMENTS = ["::-webkit-scrollbar-thumb", "::-webkit-slider-thumb"];
var PSEUDO_STATES = {
  hover: "hover",
  active: "active",
  focusVisible: "focus-visible",
  focusWithin: "focus-within",
  focus: "focus",
  visited: "visited",
  link: "link",
  target: "target"
};

// src/preview/withPseudoState.ts
var import_core_events = require("@storybook/core-events");
var import_preview_api = require("@storybook/preview-api");

// src/preview/splitSelectors.ts
var isAtRule = (selector) => selector.indexOf("@") === 0;
var splitSelectors = (selectors) => {
  if (isAtRule(selectors))
    return [selectors];
  let result = [];
  let parentheses = 0;
  let brackets = 0;
  let selector = "";
  for (let i = 0, len = selectors.length; i < len; i++) {
    const char = selectors[i];
    if (char === "(") {
      parentheses += 1;
    } else if (char === ")") {
      parentheses -= 1;
    } else if (char === "[") {
      brackets += 1;
    } else if (char === "]") {
      brackets -= 1;
    } else if (char === ",") {
      if (!parentheses && !brackets) {
        result.push(selector.trim());
        selector = "";
        continue;
      }
    }
    selector += char;
  }
  result.push(selector.trim());
  return result;
};

// src/preview/rewriteStyleSheet.ts
var pseudoStates = Object.values(PSEUDO_STATES);
var matchOne = new RegExp(`:(${pseudoStates.join("|")})`);
var matchAll = new RegExp(`:(${pseudoStates.join("|")})`, "g");
var warnings = /* @__PURE__ */ new Set();
var warnOnce = (message) => {
  if (warnings.has(message))
    return;
  console.warn(message);
  warnings.add(message);
};
var isExcludedPseudoElement = (selector, pseudoState) => EXCLUDED_PSEUDO_ELEMENTS.some((element) => selector.endsWith(`${element}:${pseudoState}`));
var rewriteRule = ({ cssText, selectorText }, shadowRoot) => {
  return cssText.replace(
    selectorText,
    splitSelectors(selectorText).flatMap((selector) => {
      if (selector.includes(".pseudo-")) {
        return [];
      }
      if (!matchOne.test(selector)) {
        return [selector];
      }
      const states = [];
      let plainSelector = selector.replace(matchAll, (_, state) => {
        states.push(state);
        return "";
      });
      const classSelector = states.reduce((acc, state) => {
        if (isExcludedPseudoElement(selector, state))
          return "";
        return acc.replace(new RegExp(`:${state}`, "g"), `.pseudo-${state}`);
      }, selector);
      let ancestorSelector = "";
      const statesAllClassSelectors = states.map((s) => `.pseudo-${s}-all`).join("");
      if (selector.startsWith(":host(")) {
        const matches = selector.match(/^:host\(([^ ]+)\) /);
        if (matches && !matchOne.test(matches[1])) {
          ancestorSelector = `:host(${matches[1]}${statesAllClassSelectors}) ${plainSelector.replace(matches[0], "")}`;
        } else {
          ancestorSelector = states.reduce((acc, state) => {
            if (isExcludedPseudoElement(selector, state))
              return "";
            return acc.replace(new RegExp(`:${state}`, "g"), `.pseudo-${state}-all`);
          }, selector);
        }
      } else if (selector.startsWith("::slotted(") || shadowRoot) {
        if (plainSelector.startsWith("::slotted()")) {
          plainSelector = plainSelector.replace("::slotted()", "::slotted(*)");
        }
        ancestorSelector = `:host(${statesAllClassSelectors}) ${plainSelector}`;
      } else {
        ancestorSelector = `${statesAllClassSelectors} ${plainSelector}`;
      }
      return [selector, classSelector, ancestorSelector].filter(
        (selector2) => selector2 && !selector2.includes(":not()") && !selector2.includes(":has()")
      );
    }).join(", ")
  );
};
var rewriteStyleSheet = (sheet, shadowRoot) => {
  try {
    const maximumRulesToRewrite = 1e4;
    const count = rewriteRuleContainer(sheet, maximumRulesToRewrite, shadowRoot);
    if (count >= maximumRulesToRewrite) {
      warnOnce("Reached maximum of 1000 pseudo selectors per sheet, skipping the rest.");
    }
    return count > 0;
  } catch (e) {
    if (String(e).includes("cssRules")) {
      warnOnce(`Can't access cssRules, likely due to CORS restrictions: ${sheet.href}`);
    } else {
      console.error(e, sheet.href);
    }
    return false;
  }
};
var rewriteRuleContainer = (ruleContainer, rewriteLimit, shadowRoot) => {
  let count = 0;
  let index = -1;
  for (const cssRule of ruleContainer.cssRules) {
    index++;
    let numRewritten = 0;
    if (cssRule.__processed) {
      numRewritten = cssRule.__pseudoStatesRewrittenCount;
    } else {
      if ("cssRules" in cssRule && cssRule.cssRules.length) {
        numRewritten = rewriteRuleContainer(cssRule, rewriteLimit - count, shadowRoot);
      } else {
        if (!("selectorText" in cssRule))
          continue;
        const styleRule = cssRule;
        if (matchOne.test(styleRule.selectorText)) {
          const newRule = rewriteRule(styleRule, shadowRoot);
          ruleContainer.deleteRule(index);
          ruleContainer.insertRule(newRule, index);
          numRewritten = 1;
        }
      }
      cssRule.__processed = true;
      cssRule.__pseudoStatesRewrittenCount = numRewritten;
    }
    count += numRewritten;
    if (count >= rewriteLimit) {
      break;
    }
  }
  return count;
};

// src/preview/withPseudoState.ts
var channel = import_preview_api.addons.getChannel();
var shadowHosts = /* @__PURE__ */ new Set();
var applyClasses = (element, classnames) => {
  Object.values(PSEUDO_STATES).forEach((state) => {
    element.classList.remove(`pseudo-${state}`);
    element.classList.remove(`pseudo-${state}-all`);
  });
  classnames.forEach((classname) => element.classList.add(classname));
};
function querySelectorPiercingShadowDOM(root, selector) {
  const results = [];
  root.querySelectorAll("*").forEach((el) => {
    if (el.shadowRoot) {
      results.push(...querySelectorPiercingShadowDOM(el.shadowRoot, selector));
    }
  });
  results.push(...root.querySelectorAll(selector).values());
  return results;
}
var applyParameter = (rootElement, parameter = {}) => {
  const map = /* @__PURE__ */ new Map([[rootElement, /* @__PURE__ */ new Set()]]);
  const add = (target, state) => map.set(target, /* @__PURE__ */ new Set([...map.get(target) || [], state]));
  Object.entries(parameter || {}).forEach(([state, value]) => {
    if (typeof value === "boolean") {
      if (value)
        add(rootElement, `${state}-all`);
    } else if (typeof value === "string") {
      querySelectorPiercingShadowDOM(rootElement, value).forEach((el) => add(el, state));
    } else if (Array.isArray(value)) {
      value.forEach((sel) => querySelectorPiercingShadowDOM(rootElement, sel).forEach((el) => add(el, state)));
    }
  });
  map.forEach((states, target) => {
    const classnames = /* @__PURE__ */ new Set();
    states.forEach((key) => {
      const keyWithoutAll = key.replace("-all", "");
      if (PSEUDO_STATES[key]) {
        classnames.add(`pseudo-${PSEUDO_STATES[key]}`);
      } else if (PSEUDO_STATES[keyWithoutAll]) {
        classnames.add(`pseudo-${PSEUDO_STATES[keyWithoutAll]}-all`);
      }
    });
    applyClasses(target, classnames);
  });
};
var updateShadowHost = (shadowHost) => {
  const classnames = /* @__PURE__ */ new Set();
  shadowHost.className.split(" ").filter((classname) => classname.startsWith("pseudo-")).forEach((classname) => classnames.add(classname));
  for (let node = shadowHost.parentNode; node; ) {
    if (node instanceof ShadowRoot) {
      node = node.host;
      continue;
    }
    if (node instanceof Element) {
      const element = node;
      if (element.className) {
        element.className.split(" ").filter((classname) => classname.match(/^pseudo-.+-all$/) !== null).forEach((classname) => classnames.add(classname));
      }
    }
    node = node.parentNode;
  }
  applyClasses(shadowHost, classnames);
};
var pseudoConfig = (parameter) => {
  const { rootSelector, ...pseudoStateConfig } = parameter || {};
  return pseudoStateConfig;
};
var equals = (a = {}, b = {}) => a !== null && b !== null && Object.keys(a).length === Object.keys(b).length && Object.keys(a).every(
  (key) => JSON.stringify(a[key]) === JSON.stringify(b[key])
);
var withPseudoState = (StoryFn, { viewMode, parameters, id, globals: globalsArgs }) => {
  const { pseudo: parameter } = parameters;
  const { pseudo: globals2 } = globalsArgs;
  const { rootSelector } = parameter || {};
  const rootElement = (0, import_preview_api.useMemo)(() => {
    if (rootSelector) {
      return document.querySelector(rootSelector);
    }
    if (viewMode === "docs") {
      return document.getElementById(`story--${id}`);
    }
    return document.getElementById("storybook-root") || document.getElementById("root");
  }, [rootSelector, viewMode, id]);
  (0, import_preview_api.useEffect)(() => {
    const config = pseudoConfig(parameter);
    if (viewMode === "story" && !equals(config, globals2)) {
      channel.emit(import_core_events.UPDATE_GLOBALS, {
        globals: { pseudo: config }
      });
    }
  }, [parameter, viewMode]);
  (0, import_preview_api.useEffect)(() => {
    if (!rootElement)
      return;
    const timeout = setTimeout(() => {
      applyParameter(rootElement, globals2 || pseudoConfig(parameter));
      shadowHosts.forEach(updateShadowHost);
    }, 0);
    return () => clearTimeout(timeout);
  }, [rootElement, globals2, parameter]);
  return StoryFn();
};
var rewriteStyleSheets = (shadowRoot) => {
  let styleSheets = Array.from(shadowRoot ? shadowRoot.styleSheets : document.styleSheets);
  if (shadowRoot?.adoptedStyleSheets?.length)
    styleSheets = shadowRoot.adoptedStyleSheets;
  const rewroteStyles = styleSheets.map((sheet) => rewriteStyleSheet(sheet, shadowRoot)).some(Boolean);
  if (rewroteStyles && shadowRoot && shadowHosts)
    shadowHosts.add(shadowRoot.host);
};
channel.on(import_core_events.STORY_CHANGED, () => shadowHosts.clear());
channel.on(import_core_events.STORY_RENDERED, () => rewriteStyleSheets());
channel.on(import_core_events.GLOBALS_UPDATED, () => rewriteStyleSheets());
channel.on(import_core_events.FORCE_RE_RENDER, () => rewriteStyleSheets());
channel.on(import_core_events.FORCE_REMOUNT, () => rewriteStyleSheets());
channel.on(import_core_events.DOCS_RENDERED, () => rewriteStyleSheets());
if (Element.prototype.attachShadow) {
  Element.prototype._attachShadow = Element.prototype.attachShadow;
  Element.prototype.attachShadow = function attachShadow(init) {
    const shadowRoot = this._attachShadow({ ...init, mode: "open" });
    requestAnimationFrame(() => {
      rewriteStyleSheets(shadowRoot);
      if (shadowHosts.has(shadowRoot.host))
        updateShadowHost(shadowRoot.host);
    });
    return shadowRoot;
  };
}

// src/preview.ts
var decorators = [withPseudoState];
var globals = { [PARAM_KEY]: false };
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  decorators,
  globals
});
