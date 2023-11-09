import React, { useCallback, useMemo } from "react";
import { useGlobals } from "@storybook/api";
import { Icons, IconButton, WithTooltip, TooltipLinkList } from "@storybook/components";
import { styled, color } from "@storybook/theming";
import { PSEUDO_STATES } from "./constants";
const LinkTitle = styled.span(_ref => {
  let {
    active
  } = _ref;
  return {
    color: active ? color.secondary : "inherit"
  };
});
const LinkIcon = styled(Icons)(_ref2 => {
  let {
    active
  } = _ref2;
  return {
    opacity: active ? 1 : 0,
    path: {
      fill: active ? color.secondary : "inherit"
    }
  };
});
const options = Object.keys(PSEUDO_STATES).sort();
export const PseudoStateTool = () => {
  const [{
    pseudo
  }, updateGlobals] = useGlobals();
  const isActive = useCallback(option => {
    if (!pseudo) return false;
    return pseudo[option] === true;
  }, [pseudo]);
  const toggleOption = useCallback(option => () => updateGlobals({
    pseudo: {
      ...pseudo,
      [option]: !isActive(option)
    }
  }), [pseudo]);
  return /*#__PURE__*/React.createElement(WithTooltip, {
    placement: "top",
    trigger: "click",
    tooltip: () => /*#__PURE__*/React.createElement(TooltipLinkList, {
      links: options.map(option => ({
        id: option,
        title: /*#__PURE__*/React.createElement(LinkTitle, {
          active: isActive(option)
        }, ":", PSEUDO_STATES[option]),
        right: /*#__PURE__*/React.createElement(LinkIcon, {
          icon: "check",
          width: 12,
          height: 12,
          active: isActive(option)
        }),
        onClick: toggleOption(option),
        active: isActive(option)
      }))
    })
  }, /*#__PURE__*/React.createElement(IconButton, {
    key: "pseudo-state",
    title: "Select CSS pseudo states",
    active: options.some(isActive)
  }, /*#__PURE__*/React.createElement(Icons, {
    icon: "button"
  })));
};