import { ref } from "vue";
import {
  doGetImgBase64,
  doSaveImgBase64,
  removeImgStorage,
} from "../../tools/useCache";
import { readImgToBase64 } from "../../tools/useFile";
import defaultImg from "../assets/1.png";

export function useBackground() {
  const backgroundImageBase64 = ref<string | null>("");

  function loadBackground() {
    doGetImgBase64((result) => {
      backgroundImageBase64.value = defaultImg;
      if (result) backgroundImageBase64.value = result;
    });
  }

  function uploadBackground(e: Event) {
    const fileElement = e.target as HTMLInputElement;
    const file = fileElement.files?.[0];
    if (!file) return;
    readImgToBase64(file, (result) => {
      doSaveImgBase64(result);
      backgroundImageBase64.value = result;
    });
  }

  function restoreImg() {
    removeImgStorage();
    backgroundImageBase64.value = defaultImg;
  }

  return {
    backgroundImageBase64,
    loadBackground,
    uploadBackground,
    restoreImg,
  };
}
