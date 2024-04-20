import type { Directive } from "vue";

export const vInvalid: Directive<HTMLInputElement, string | boolean> = (el, binding) => {
    if (el.value == "") {
        // Do not report validity on empty elements.
        // This causes them to focus I think?
        return;
    }

    if (typeof binding.value === "boolean") {
        el.setCustomValidity(binding.value ? "Value is invalid" : "");
    } else {
        el.setCustomValidity(binding.value);
    }

    el.reportValidity();
};
