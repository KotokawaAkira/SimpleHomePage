<template>
  <div class="grid-item" @click.prevent="$emit('click', element.url)">
    <div
      class="icon delete_ico"
      title="删除"
      @click.stop.prevent="$emit('delete', index)"
    >
      <delete_ico />
    </div>
    <div
      class="icon edit_ico"
      title="编辑"
      @click.stop.prevent="$emit('edit', element, index)"
    >
      <menu_ico />
    </div>
    <template v-if="element.url && !imgLoadFailed && getFaviconUrl()">
      <img
        :src="getFaviconUrl()"
        :alt="element.webName"
        class="avatar-img"
        @error="onImgError"
      />
    </template>
    <template v-else>
      <div class="avatar-text">
        {{ getInitial(element.webName) }}
      </div>
    </template>
    <div class="name-label" :title="element.webName">
      {{ element.webName }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import delete_ico from "../assets/delete.svg";
import menu_ico from "../assets/menu.svg";
import type { FrequentWebsite } from "../types/types";

const props = defineProps<{
  element: FrequentWebsite;
  index: number;
}>();

defineEmits<{
  click: [url: string];
  delete: [index: number];
  edit: [website: FrequentWebsite, index: number];
}>();

const imgLoadFailed = ref(false);

function getFaviconUrl(): string {
  if (props.element.iconUrl && props.element.iconUrl.length > 0) {
    return props.element.iconUrl;
  }
  if (!props.element.url) return "";
  try {
    const domain = new URL(props.element.url).hostname;
    return `https://favicon.im/${domain}?larger=true`;
  } catch {
    return "";
  }
}

function onImgError() {
  imgLoadFailed.value = true;
}

function getInitial(name: string) {
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
}
</script>

<style scoped lang="scss">
.grid-item {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  overflow: hidden;
  gap: 0.5rem;

  &:active {
    cursor: grabbing;
  }

  &:hover .icon {
    opacity: 1;
  }

  .delete_ico {
    opacity: 0;
    top: 5%;
    right: 5%;
  }

  .edit_ico {
    opacity: 0;
    top: 5%;
    left: 5%;
  }

  .icon {
    height: 18%;
    width: 18%;
    position: absolute;
    border-radius: 0.5rem;
    padding: 0.5rem;
    box-sizing: border-box;
    transition: all 0.3s ease;

    &:hover {
      background-color: var(--bg_modal);
    }

    svg {
      fill: var(--search_logo);
    }
  }

  .avatar-img {
    width: 60%;
    height: 60%;
    object-fit: contain;
  }

  .avatar-text {
    width: 60%;
    height: 60%;
    background-color: var(--color_mizuki);
    color: var(--code-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    font-weight: bold;
    border-radius: 50%;
  }

  .name-label {
    font-size: 1.5rem;
    width: 90%;
    text-align: center;
    box-sizing: border-box;
    padding: 1rem 0.5rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

@media screen and (max-width: 600px) {
  .grid-item {
    border-radius: 1.2rem;

    .icon {
      height: 25%;
      width: 25%;
    }

    .avatar-img {
      width: 55%;
      height: 55%;
    }

    .avatar-text {
      width: 55%;
      height: 55%;
      font-size: 1.3rem;
    }

    .name-label {
      font-size: 1.2rem;
      padding: 0.4rem 0.2rem;
    }
  }
}
</style>
