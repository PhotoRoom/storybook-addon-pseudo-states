"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PseudoStateTool = void 0;
var _react = _interopRequireWildcard(require("react"));
var _api = require("@storybook/api");
var _components = require("@storybook/components");
var _theming = require("@storybook/theming");
var _constants = require("./constants");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
const LinkTitle = _theming.styled.span(_ref => {
  let {
    active
  } = _ref;
  return {
    color: active ? _theming.color.secondary : "inherit"
  };
});
const LinkIcon = (0, _theming.styled)(_components.Icons)(_ref2 => {
  let {
    active
  } = _ref2;
  return {
    opacity: active ? 1 : 0,
    path: {
      fill: active ? _theming.color.secondary : "inherit"
    }
  };
});
const options = Object.keys(_constants.PSEUDO_STATES).sort();
const PseudoStateTool = () => {
  const [{
    pseudo
  }, updateGlobals] = (0, _api.useGlobals)();
  const isActive = (0, _react.useCallback)(option => {
    if (!pseudo) return false;
    return pseudo[option] === true;
  }, [pseudo]);
  const toggleOption = (0, _react.useCallback)(option => () => updateGlobals({
    pseudo: {
      ...pseudo,
      [option]: !isActive(option)
    }
  }), [pseudo]);
  return /*#__PURE__*/_react.default.createElement(_components.WithTooltip, {
    placement: "top",
    trigger: "click",
    tooltip: () => /*#__PURE__*/_react.default.createElement(_components.TooltipLinkList, {
      links: options.map(option => ({
        id: option,
        title: /*#__PURE__*/_react.default.createElement(LinkTitle, {
          active: isActive(option)
        }, ":", _constants.PSEUDO_STATES[option]),
        right: /*#__PURE__*/_react.default.createElement(LinkIcon, {
          icon: "check",
          width: 12,
          height: 12,
          active: isActive(option)
        }),
        onClick: toggleOption(option),
        active: isActive(option)
      }))
    })
  }, /*#__PURE__*/_react.default.createElement(_components.IconButton, {
    key: "pseudo-state",
    title: "Select CSS pseudo states",
    active: options.some(isActive)
  }, /*#__PURE__*/_react.default.createElement(_components.Icons, {
    icon: "button"
  })));
};
exports.PseudoStateTool = PseudoStateTool;