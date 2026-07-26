import { ref } from "vue";
import type { userCustomization, RedirectMode, ColorSchemeMode } from "../types/types";
import { getFromLocalStorage, addToLocalStorage } from "../../tools/useCache";
import { default_font } from "../config/fontConfig";

export function useSettings() {
  const systemFonts = ref<string[]>([]);
  const fontDropdownOpen = ref(false);

  function loadSettings(customization: userCustomization) {
    const mode = getFromLocalStorage("redirectMode");
    if (mode) customization.redirectMode = JSON.parse(mode) as RedirectMode;

    const colorScheme = getFromLocalStorage("colorScheme");
    if (colorScheme)
      customization.colorScheme = JSON.parse(colorScheme) as ColorSchemeMode;
    applyColorScheme(customization);

    const blur = getFromLocalStorage("blurValue");
    if (blur !== null) customization.blurValue = JSON.parse(blur) as number;
    applyBlur(customization);

    const opacity = getFromLocalStorage("bgOpacity");
    if (opacity !== null) customization.bgOpacity = JSON.parse(opacity) as number;
    applyBgOpacity(customization);

    const font = getFromLocalStorage("fontFamily");
    if (font) {
      const family = JSON.parse(font) as string;
      if (family !== "system-ui" && !isFontAvailable(family)) {
        customization.fontFamily = "system-ui";
        addToLocalStorage("fontFamily", "system-ui");
      } else {
        customization.fontFamily = family;
      }
    }
    applyFont(customization);
  }

  function selectFont(font: string, customization: userCustomization) {
    customization.fontFamily = font;
    fontDropdownOpen.value = false;
    changeFont(customization);
  }

  function changeFont(customization: userCustomization) {
    applyFont(customization);
    addToLocalStorage<string>("fontFamily", customization.fontFamily);
  }

  function changeRedirectMode(mode: RedirectMode, customization: userCustomization) {
    customization.redirectMode = mode;
    addToLocalStorage<RedirectMode>("redirectMode", mode);
  }

  function applyColorScheme(customization: userCustomization) {
    const html = document.documentElement;
    switch (customization.colorScheme.value) {
      case 1:
        html.setAttribute("data-theme", "light");
        break;
      case 2:
        html.setAttribute("data-theme", "dark");
        break;
      default:
        html.removeAttribute("data-theme");
        break;
    }
  }

  function changeColorScheme(mode: ColorSchemeMode, customization: userCustomization) {
    customization.colorScheme = mode;
    addToLocalStorage<ColorSchemeMode>("colorScheme", mode);
    applyColorScheme(customization);
  }

  function applyBlur(customization: userCustomization) {
    document.documentElement.style.setProperty(
      "--val_blur",
      `${customization.blurValue}px`,
    );
  }

  function changeBlur(customization: userCustomization) {
    applyBlur(customization);
    addToLocalStorage<number>("blurValue", customization.blurValue);
  }

  function applyBgOpacity(customization: userCustomization) {
    document.documentElement.style.setProperty(
      "--bg_mainbox_alpha",
      `${customization.bgOpacity}`,
    );
  }

  function changeBgOpacity(customization: userCustomization) {
    applyBgOpacity(customization);
    addToLocalStorage<number>("bgOpacity", customization.bgOpacity);
  }

  function applyFont(customization: userCustomization) {
    const family =
      customization.fontFamily === "system-ui"
        ? "system-ui, 'Segoe UI', Roboto, sans-serif"
        : customization.fontFamily + ", sans-serif";
    document.documentElement.style.setProperty("--sans", family);
    document.body.style.fontFamily = family;
  }

  function isFontAvailable(family: string): boolean {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;
    ctx.font = "72px '" + family + "'";
    return ctx.font.includes(family);
  }

  async function loadSystemFonts() {
    try {
      if ("queryLocalFonts" in window) {
        const fonts = await (window as any).queryLocalFonts();
        const families = [
          ...new Set<string>(fonts.map((f: { family: string }) => f.family)),
        ].sort((a, b) => a.localeCompare(b));
        systemFonts.value = families;
      }
    } catch {
      systemFonts.value = [];
    }
    if (systemFonts.value.length === 0) {
      systemFonts.value = default_font.filter((f) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return false;
        ctx.font = "72px '" + f + "'";
        return ctx.font.includes(f);
      });
    }
  }

  return {
    systemFonts,
    fontDropdownOpen,
    loadSettings,
    selectFont,
    changeFont,
    changeRedirectMode,
    changeColorScheme,
    changeBlur,
    changeBgOpacity,
    loadSystemFonts,
  };
}
