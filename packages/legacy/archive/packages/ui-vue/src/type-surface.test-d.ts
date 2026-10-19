import type {
  VfDialogEmits,
  VfTextInputProps,
  VfToggleButtonProps,
} from "./index";

const text: VfTextInputProps["modelValue"] = "typed";
const pressed: VfToggleButtonProps["pressed"] = true;
void text;
void pressed;

// @ts-expect-error Text input model values are strings.
const invalidText: VfTextInputProps["modelValue"] = 42;
void invalidText;

declare const emitDialog: VfDialogEmits;
emitDialog("update:open", true);
// @ts-expect-error Dialog open updates are boolean.
emitDialog("update:open", "yes");
