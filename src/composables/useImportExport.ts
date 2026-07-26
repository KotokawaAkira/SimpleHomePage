import { computed, ref, toRaw } from "vue";
import type { userCustomization } from "../types/types";
import { addToLocalStorage } from "../../tools/useCache";

export function useImportExport() {
  const importJsonText = ref("");
  const importFileName = ref("");
  const importErrorMessage = ref("");

  const importJsonValid = computed(
    () =>
      importJsonText.value.trim().length > 0 || importFileName.value.length > 0,
  );

  function exportConfig(customization: userCustomization) {
    const configData = toRaw(customization);
    const exportObj = {
      version: 1,
      exportedAt: new Date().toISOString(),
      data: configData,
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SimpleHomePage_config_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function resetImport() {
    importJsonText.value = "";
    importFileName.value = "";
    importErrorMessage.value = "";
  }

  function onImportFileSelected(e: Event) {
    const fileElement = e.target as HTMLInputElement;
    const file = fileElement.files?.[0];
    if (!file) return;
    importFileName.value = file.name;
    importErrorMessage.value = "";
    const reader = new FileReader();
    reader.onload = () => {
      importJsonText.value = reader.result as string;
    };
    reader.onerror = () => {
      importErrorMessage.value = "文件读取失败";
    };
    reader.readAsText(file);
  }

  function importConfirm(reloadCallback: () => void) {
    importErrorMessage.value = "";
    try {
      const parsed = JSON.parse(importJsonText.value);
      const data = parsed.data || parsed;
      if (!data || typeof data !== "object") {
        importErrorMessage.value = "无效的配置数据格式";
        return;
      }
      for (const [key, value] of Object.entries(data)) {
        addToLocalStorage(key, value);
      }
      reloadCallback();
    } catch {
      importErrorMessage.value = "JSON 解析失败，请检查格式";
    }
  }

  return {
    importJsonText,
    importFileName,
    importErrorMessage,
    importJsonValid,
    exportConfig,
    resetImport,
    onImportFileSelected,
    importConfirm,
  };
}
