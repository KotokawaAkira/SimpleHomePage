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
  return localStorage.getItem(key);
}
function addToLocalStorage<V>(key: string, value: V) {
  localStorage.setItem(key, JSON.stringify(value));
}
function setEngine(index: number) {
  localStorage.setItem("engine", String(index));
}
export {
  doGetImgBase64,
  doSaveImgBase64,
  getFromLocalStorage,
  addToLocalStorage,
  setEngine,
};
