<template>
  <div class="list-container">
    <h1>{{ title }}</h1>
    <div class="list-item">
      <h2>名称 *</h2>
      <input
        type="text"
        :value="modelValue.webName"
        @input="
          onFieldChange('webName', ($event.target as HTMLInputElement).value)
        "
      />
    </div>
    <div class="list-item">
      <h2>URL *</h2>
      <input
        type="text"
        :value="modelValue.url"
        @input="onFieldChange('url', ($event.target as HTMLInputElement).value)"
      />
    </div>
    <div class="list-item">
      <h2>图标URL</h2>
      <input
        type="text"
        :value="modelValue.iconUrl ?? ''"
        @input="
          onFieldChange('iconUrl', ($event.target as HTMLInputElement).value)
        "
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
  "update:modelValue": [value: FrequentWebsite];
}>();

function onFieldChange(field: keyof FrequentWebsite, value: string) {
  emit("update:modelValue", { ...props.modelValue, [field]: value });
}
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
