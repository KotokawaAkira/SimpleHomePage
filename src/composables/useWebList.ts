import { computed, reactive, ref } from "vue";
import type { FrequentWebsite, SelectedWebsite, userCustomization } from "../types/types";
import { getFromLocalStorage } from "../../tools/useCache";

export function useWebList() {
  const deleteTargetIndex = ref(-1);

  const addWebsite = reactive<FrequentWebsite>({
    url: "",
    webName: "",
    iconUrl: "",
  });
  const editWebsite = reactive<SelectedWebsite>({
    index: -1,
    url: "",
    webName: "",
    iconUrl: "",
  });

  const isAddLegal = computed(() => {
    return (
      addWebsite.url !== undefined &&
      addWebsite.webName !== undefined &&
      addWebsite.url.length > 0 &&
      addWebsite.webName.length > 0
    );
  });

  const isEditLegal = computed(() => {
    return (
      editWebsite.url !== undefined &&
      editWebsite.webName !== undefined &&
      editWebsite.url.length > 0 &&
      editWebsite.webName.length > 0
    );
  });

  function loadWebList(customization: userCustomization) {
    const browserWebList = getFromLocalStorage("webList");
    if (browserWebList) {
      const list = JSON.parse(browserWebList) as FrequentWebsite[];
      customization.webList = list;
    }
  }

  function addConfirm(customization: userCustomization) {
    customization.webList.push({
      webName: addWebsite.webName,
      url: addWebsite.url,
      iconUrl: addWebsite.iconUrl,
    });
    resetAddWebsite();
  }

  function editConfirm(customization: userCustomization) {
    customization.webList[editWebsite.index].url = editWebsite.url;
    customization.webList[editWebsite.index].iconUrl = editWebsite.iconUrl;
    customization.webList[editWebsite.index].webName = editWebsite.webName;
  }

  function openEdit(website: FrequentWebsite, index: number) {
    editWebsite.index = index;
    editWebsite.iconUrl = website.iconUrl ?? "";
    editWebsite.url = website.url;
    editWebsite.webName = website.webName;
  }

  function openDeleteConfirm(index: number) {
    deleteTargetIndex.value = index;
  }

  function deleteConfirm(customization: userCustomization) {
    customization.webList.splice(deleteTargetIndex.value, 1);
  }

  function resetAddWebsite() {
    addWebsite.url = "";
    addWebsite.iconUrl = "";
    addWebsite.webName = "";
  }

  function resetEditWebsite() {
    editWebsite.index = -1;
    editWebsite.url = "";
    editWebsite.iconUrl = "";
    editWebsite.webName = "";
  }

  return {
    addWebsite,
    editWebsite,
    isAddLegal,
    isEditLegal,
    deleteTargetIndex,
    loadWebList,
    addConfirm,
    editConfirm,
    openEdit,
    openDeleteConfirm,
    deleteConfirm,
    resetAddWebsite,
    resetEditWebsite,
  };
}
