<template>
  <div v-if="show" class="modal-mask" @mousedown="onMaskMouseDown" @mouseup="onMaskMouseUp">
    <div
      class="modal-container box_bg"
      :style="{
        width: props.width,
        height: props.height,
        minWidth: props.minWidth,
        minHeight: props.minHeight,
      }"
    >
      <div class="modal-content" :style="{ overflowY: props.contentOverflow ? 'scroll' : 'unset' }">
        <slot></slot>
      </div>

      <div class="modal-button-list">
        <button
          class="btn confirm"
          v-if="props.confirm"
          :disabled="props.disabled"
          @click="confirm"
        >
          确定
        </button>
        <button class="btn" @click="closeModal">关闭</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ModalProps } from "../types/types";
// 使用 defineProps 接收父组件的显示状态
const props = withDefaults(defineProps<ModalProps>(), {
  confirm: false,
  disabled: false,
  contentOverflow:true,
  width: "50%",
  height: "auto",
});

const emit = defineEmits(["close"]);

let mouseDownTarget: EventTarget | null = null;

const onMaskMouseDown = (e: MouseEvent) => {
  mouseDownTarget = e.target;
};

const onMaskMouseUp = (e: MouseEvent) => {
  if (mouseDownTarget === e.target && e.target === e.currentTarget) {
    closeModal();
  }
  mouseDownTarget = null;
};

const closeModal = () => {
  emit("close");
};
const confirm = () => {
  if (props.doConfirm) props.doConfirm();
  emit("close");
};
</script>

<style scoped lang="scss">
/* 全屏蒙版 */
.box_bg {
  border-radius: 2rem;
  background: (var(--bg_mainbox));
  backdrop-filter: blur(6px);
}
.modal-mask {
  position: fixed;
  inset: 0; /* top/bottom/left/right: 0 */
  background-color: rgba(0, 0, 0, 0.5); /* 黑色半透明 */

  /* 使用 Flex 布局让子元素垂直水平居中 */
  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 1000; /* 确保在最顶层 */
}

/* 弹窗容器 */
.modal-container {
  width: 50%;
  height: auto;
  max-height: 45vh;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  /* 防止内容溢出圆角 */
  overflow: hidden;

  color: var(--text);
  background-color: var(--bg_modal);
  backdrop-filter: unset;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding:0 0.7rem 0 0;
  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--bg_search);
    border-radius: 2rem;
  }
}
.modal-button-list {
  display: flex;
  gap: 1rem;
  justify-content: end;
  margin: 1.5rem 0 0 0;
}
.btn {
  align-self: flex-end;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 6px;
  border: 1px solid var(--text-h);
  transition: all 0.3s ease;
  &:not(:disabled):active {
    transform: scale(0.95);
  }
  &:not(:disabled):hover {
    background-color: var(--btn_hover);
  }
}
.confirm:not(:disabled):hover {
  border-color: var(--color_mizuki);
  color: var(--color_mizuki);
}
.confirm:disabled {
  border-color: var(--btn_disable);
  cursor: not-allowed;
}
</style>
