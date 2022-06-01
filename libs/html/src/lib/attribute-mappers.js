import { registerMapper, StyleMapper, FragmentMapper } from "./attribute-mapper";


export function registerAllMappers() {
  [
    StyleMapper("bold", "fontStyle", "bold"),
    StyleMapper("italic", "fontStyle", "italic"),
    StyleMapper("underline", "textDecoration", "underline"),
    StyleMapper("strike through", "textDecoration", "line-through"),
    StyleMapper("capitalization", "textTransform"),
    StyleMapper("text align", "textAlign"),
    FragmentMapper("paragraph", "p"),
    FragmentMapper("title", "h1")
  ].forEach(registerMapper);
}
