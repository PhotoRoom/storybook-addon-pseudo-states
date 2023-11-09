import { addons, types } from "@storybook/addons";
import { ADDON_ID, TOOL_ID } from "../constants";
import { PseudoStateTool } from "../PseudoStateTool";
addons.register(ADDON_ID, () => {
  addons.add(TOOL_ID, {
    type: types.TOOL,
    title: "CSS pseudo states",
    match: _ref => {
      let {
        viewMode
      } = _ref;
      return viewMode === "story";
    },
    render: PseudoStateTool
  });
});