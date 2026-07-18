<template>
  <div ref="rootRef" class="dropdown" :class="{ 'dropdown--static': !positionRelative }">
    <div
      class="dropdown-trigger"
      :class="{ 'dropdown-trigger--clickable': clickToggle }"
      @click.stop="clickToggle ? toggle() : undefined"
    >
      <slot name="trigger" />
    </div>
    <Transition name="fade">
      <slot v-if="isShown" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    clickToggle?: boolean;
    closeOnClickOutside?: boolean;
    positionRelative?: boolean;
  }>(),
  {
    clickToggle: true,
    closeOnClickOutside: true,
    positionRelative: true,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const internalOpen = ref(false);
const rootRef = ref<HTMLElement | null>(null);

const isShown = computed(() =>
  props.modelValue !== undefined ? props.modelValue : internalOpen.value,
);

function setState(value: boolean) {
  if (props.modelValue !== undefined) {
    emit("update:modelValue", value);
  } else {
    internalOpen.value = value;
  }
}

function open() {
  setState(true);
}
function close() {
  setState(false);
}
function toggle() {
  setState(!isShown.value);
}

function onDocClick(e: MouseEvent) {
  if (!isShown.value || !props.closeOnClickOutside) return;
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
    close();
  }
}

onMounted(() => {
  document.addEventListener("click", onDocClick, true);
});
onUnmounted(() => {
  document.removeEventListener("click", onDocClick, true);
});

defineExpose({ toggle, open, close, isShown });
</script>

<style lang="scss">
.dropdown {
  position: relative;
  &--static {
    position: static;
  }
}
.dropdown-trigger {
  width: 100%;
  &--clickable {
    cursor: pointer;
  }
}
</style>
