"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TOOL_ID = exports.PSEUDO_STATES = exports.EXCLUDED_PSEUDO_ELEMENTS = exports.ADDON_ID = void 0;
const ADDON_ID = exports.ADDON_ID = "storybook/pseudo-states";
const TOOL_ID = exports.TOOL_ID = `${ADDON_ID}/tool`;

// Pseudo-elements which are not allowed to have classes applied on them
// E.g. ::-webkit-scrollbar-thumb.pseudo-hover is not a valid selector
const EXCLUDED_PSEUDO_ELEMENTS = exports.EXCLUDED_PSEUDO_ELEMENTS = ["::-webkit-scrollbar-thumb"];

// Dynamic pseudo-classes
// @see https://www.w3.org/TR/2018/REC-selectors-3-20181106/#dynamic-pseudos
const PSEUDO_STATES = exports.PSEUDO_STATES = {
  hover: "hover",
  active: "active",
  focusVisible: "focus-visible",
  focusWithin: "focus-within",
  focus: "focus",
  // must come after its alternatives
  visited: "visited",
  link: "link",
  target: "target"
};