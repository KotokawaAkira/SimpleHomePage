import type { SearchEngine } from "../src/types/searchConfig";

// 储存图片base64到浏览器存储
function doSaveImgBase64(imgBase64: string) {
  const isChromeExtension =
    typeof chrome !== "undefined" && !!chrome.runtime && !!chrome.runtime.id;
  if (isChromeExtension) {
    // 永久保存到本地
    chrome.storage.local.set({ backgroundImageBase64: imgBase64 });
  } else {
    window.localStorage.setItem("backgroundImageBase64", imgBase64);
  }
}
// 从浏览器存储获取图片base64
function doGetImgBase64(callback: (result: string | undefined | null) => void) {
  const isChromeExtension =
    typeof chrome !== "undefined" && !!chrome.runtime && !!chrome.runtime.id;
  if (isChromeExtension) {
    chrome.storage.local.get(["backgroundImageBase64"], (result) => {
      callback(result["backgroundImageBase64"] as string);
    });
  } else {
    const result = window.localStorage.getItem("backgroundImageBase64");
    callback(result);
  }
}
function getFromLocalStorage(key: string) {
  return window.localStorage.getItem(key);
}
function addToLocalStorage<V>(key: string, value: V) {
  window.localStorage.setItem(key, JSON.stringify(value));
}
function setEngine(engine:SearchEngine) {
  window.localStorage.setItem("engine", JSON.stringify(engine));
}
// 从浏览器存储移除图片base64
function removeImgStorage() {
  const isChromeExtension =
    typeof chrome !== "undefined" && !!chrome.runtime && !!chrome.runtime.id;
  if (isChromeExtension) {
    chrome.storage.local.remove("backgroundImageBase64");
  } else {
    window.localStorage.removeItem("backgroundImageBase64");
  }
}
export {
  doGetImgBase64,
  doSaveImgBase64,
  getFromLocalStorage,
  addToLocalStorage,
  setEngine,
  removeImgStorage,
};
