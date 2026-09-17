<template>
  <div class="list-container">
    <h1>{{ title }}</h1>
    <div class="list-item">
      <h2>名称 *</h2>
      <input
        type="text"
        data-name="webName"
        :value="modelValue.webName"
        @input="inputValueChange"
      />
    </div>
    <div class="list-item">
      <h2>URL *</h2>
      <input
        type="text"
        data-name="url"
        :value="modelValue.url"
        @input="inputValueChange"
      />
    </div>
    <div class="list-item">
      <h2>图标URL</h2>
      <input
        type="text"
        data-name="iconUrl"
        :value="modelValue.iconUrl"
        @input="inputValueChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FrequentWebsite } from "../types/types";

const props = defineProps<{
  title: string;
  modelValue: FrequentWebsite;
}>();

const emit = defineEmits<{
  "update:inputValue": [
    inputValue: { webName: string; url: string; iconUrl?: string },
  ];
}>();
const inputValueChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const name = target.getAttribute("data-name") as keyof FrequentWebsite;
  emit("update:inputValue", {
    ...props.modelValue,
    [name]: target.value.trim(),
  });
};
</script>

<style scoped lang="scss">
.list-container {
  width: 100%;
  display: flex;
  flex-direction: column;

  h1 {
    font-size: clamp(2rem, 2vw, 4rem);
  }

  input[type="text"] {
    box-sizing: border-box;
    border-radius: 3px;
    height: 3rem;
    width: 100%;
    border: 1px solid var(--text-h);
    padding: 0 0.5rem;
    flex: 8;
    background: none;
    outline: none;
    font-size: 2rem;
    color: var(--text);
    transition: all 0.3s ease;

    &:focus {
      border-color: var(--color_mizuki);
    }
  }
}

.list-item {
  h2 {
    font-size: clamp(1.5rem, 1.5vw, 2rem);
    transition: all 0.3s ease;
  }

  &:has(input[type="text"]:focus) h2 {
    color: var(--color_mizuki);
  }
}
</style>
