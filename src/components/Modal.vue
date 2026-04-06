<template>
  <div v-if="show" class="modal-mask" @click.self="closeModal">
    <div
      class="modal-container box_bg"
      :style="{
        width: props.width,
        height: props.height,
        minWidth: props.minWidth,
        minHeight: props.minHeight,
      }"
    >
      <div class="modal-content">
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
  width: "50%",
  height: "30%",
});

const emit = defineEmits(["close"]);

const closeModal = () => {
  emit("close");
};
const confirm = () => {
  if (props.doConfirm) props.doConfirm();
  emit("close");
};
</script>

<style scoped>
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
  height: 30%;
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
}
.modal-button-list {
  display: flex;
  gap: 1rem;
  justify-content: end;
  margin: 1.5rem 0;
}
.btn {
  align-self: flex-end;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 6px;
  border: 1px solid var(--text-h);
  transition: all 0.3s ease;
  &:active {
    transform: scale(0.95);
  }
}
.confirm:hover {
  border-color: var(--color_mizuki);
  color: var(--color_mizuki);
}
.confirm:disabled {
  border-color: var(--btn_disable);
}
</style>
