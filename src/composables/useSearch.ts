import { computed, ref } from "vue";
import type { SearchEngine } from "../config/searchConfig";
import { EnginConfig } from "../config/searchConfig";
import type { userCustomization } from "../types/types";
import {
  getFromLocalStorage,
  addToLocalStorage,
  setEngine,
} from "../../tools/useCache";

const historyMaxCount = 10;

export function useSearch() {
  const inputText = ref("");
  const searchHistory = ref<string[]>([]);
  const showHistory = ref(false);
  const isOpen = ref(false);

  const filteredHistory = computed(() => {
    if (!inputText.value.trim()) return searchHistory.value;
    return searchHistory.value.filter((item) =>
      item.toLowerCase().includes(inputText.value.toLowerCase()),
    );
  });

  function loadSearchHistory() {
    const history = getFromLocalStorage("searchHistory");
    if (history) searchHistory.value = JSON.parse(history) as string[];
  }

  function loadSearchEngine(customization: userCustomization) {
    const searchEngineCache = getFromLocalStorage("engine");
    if (searchEngineCache)
      customization.engine = JSON.parse(searchEngineCache) as SearchEngine;
    else {
      customization.engine = EnginConfig[0];
      setEngine(customization.engine);
    }
  }

  function selectOption(engine: SearchEngine, customization: userCustomization) {
    customization.engine = engine;
    isOpen.value = false;
  }

  function doSearch(customization: userCustomization) {
    const query = inputText.value.trim();
    if (query) saveSearchHistory(query);
    const url = customization.engine.url + inputText.value;
    switch (customization.redirectMode.value) {
      case 0:
        window.location.href = url;
        break;
      case 1:
        window.open(url);
        break;
    }
  }

  function onEnterPress(e: KeyboardEvent, customization: userCustomization) {
    if (e.key === "Enter") {
      doSearch(customization);
      e.preventDefault();
    }
  }

  function saveSearchHistory(query: string) {
    const trimmed = query.trim();
    if (!trimmed) return;
    const filtered = searchHistory.value.filter((item) => item !== trimmed);
    filtered.unshift(trimmed);
    searchHistory.value = filtered.slice(0, historyMaxCount);
    addToLocalStorage<string[]>("searchHistory", searchHistory.value);
  }

  function selectHistoryItem(item: string, customization: userCustomization) {
    inputText.value = item;
    showHistory.value = false;
    doSearch(customization);
  }

  function deleteHistoryItem(index: number) {
    searchHistory.value.splice(index, 1);
    addToLocalStorage<string[]>("searchHistory", searchHistory.value);
  }

  function hideHistoryDelayed() {
    showHistory.value = false;
  }

  return {
    inputText,
    searchHistory,
    showHistory,
    isOpen,
    filteredHistory,
    loadSearchHistory,
    loadSearchEngine,
    selectOption,
    doSearch,
    onEnterPress,
    selectHistoryItem,
    deleteHistoryItem,
    hideHistoryDelayed,
  };
}
