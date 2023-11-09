import { rewriteStyleSheet } from "./rewriteStyleSheet";
class Sheet {
  constructor() {
    this.__pseudoStatesRewritten = false;
    for (var _len = arguments.length, rules = new Array(_len), _key = 0; _key < _len; _key++) {
      rules[_key] = arguments[_key];
    }
    this.cssRules = rules.map(cssText => ({
      cssText,
      selectorText: cssText.slice(0, cssText.indexOf(" {"))
    }));
  }
  deleteRule(index) {
    this.cssRules.splice(index, 1);
  }
  insertRule(cssText, index) {
    this.cssRules.splice(index, 0, cssText);
  }
}
describe("rewriteStyleSheet", () => {
  it("adds alternative selector targeting the element directly", () => {
    const sheet = new Sheet("a:hover { color: red }");
    rewriteStyleSheet(sheet);
    expect(sheet.cssRules[0]).toContain("a.pseudo-hover");
  });
  it("adds alternative selector targeting an ancestor", () => {
    const sheet = new Sheet("a:hover { color: red }");
    rewriteStyleSheet(sheet);
    expect(sheet.cssRules[0]).toContain(".pseudo-hover a");
  });
  it("does not add .pseudo-<class> to pseudo-class, which does not support classes", () => {
    const sheet = new Sheet("::-webkit-scrollbar-thumb:hover { border-color: transparent; }");
    rewriteStyleSheet(sheet);
    console.log(sheet.cssRules[0]);
    expect(sheet.cssRules[0]).not.toContain("::-webkit-scrollbar-thumb.pseudo-hover");
  });
  it("adds alternative selector for each pseudo selector", () => {
    const sheet = new Sheet("a:hover, a:focus { color: red }");
    rewriteStyleSheet(sheet);
    expect(sheet.cssRules[0]).toContain("a.pseudo-hover");
    expect(sheet.cssRules[0]).toContain("a.pseudo-focus");
    expect(sheet.cssRules[0]).toContain(".pseudo-hover a");
    expect(sheet.cssRules[0]).toContain(".pseudo-focus a");
  });
  it("keeps non-pseudo selectors as-is", () => {
    const sheet = new Sheet("a.class, a:hover, a:focus, a#id { color: red }");
    rewriteStyleSheet(sheet);
    expect(sheet.cssRules[0]).toContain("a.class");
    expect(sheet.cssRules[0]).toContain("a#id");
  });
  it("supports combined pseudo selectors", () => {
    const sheet = new Sheet("a:hover:focus { color: red }");
    rewriteStyleSheet(sheet);
    expect(sheet.cssRules[0]).toContain("a.pseudo-hover.pseudo-focus");
    expect(sheet.cssRules[0]).toContain(".pseudo-hover.pseudo-focus a");
  });
  it('supports ":host"', () => {
    const sheet = new Sheet(":host(:hover) { color: red }");
    rewriteStyleSheet(sheet);
    expect(sheet.cssRules[0]).toEqual(":host(:hover), :host(.pseudo-hover) { color: red }");
  });
  it('supports ":not"', () => {
    const sheet = new Sheet(":not(:hover) { color: red }");
    rewriteStyleSheet(sheet);
    expect(sheet.cssRules[0]).toEqual(":not(:hover), :not(.pseudo-hover) { color: red }");
  });
});