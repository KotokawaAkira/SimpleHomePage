<template>
  <div v-if="show" class="modal-mask" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-content">
        <h3>设置背景</h3>
        <p>请选择你的本地图片</p>
        <slot></slot>
      </div>

      <button class="close-btn" @click="closeModal">关闭</button>
    </div>
  </div>
</template>

<script setup>
// 使用 defineProps 接收父组件的显示状态
const props = defineProps({
  show: Boolean,
});

const emit = defineEmits(["close"]);

const closeModal = () => {
  emit("close");
};
</script>

<style scoped>
/* 全屏蒙版 */
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
  background-color: white; /* 或者使用 var(--modal-bg) */
  border-radius: 6px; /* 严格 6px 圆角 */
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);

  /* 防止内容溢出圆角 */
  overflow: hidden;
}

.modal-content {
  flex: 1;
  color: #333;
}

.close-btn {
  align-self: flex-end;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: #f5f5f5;
}
</style>
