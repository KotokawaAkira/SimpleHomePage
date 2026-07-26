<template>
  <div class="import-container">
    <h1>导入配置</h1>
    <p class="import-tip">请粘贴 JSON 配置内容，或选择配置文件导入。</p>
    <textarea
      :value="importJsonText"
      class="import-textarea modify-scroll-bar"
      placeholder="粘贴 JSON 配置内容..."
      spellcheck="false"
      @input="$emit('update:importJsonText', ($event.target as HTMLTextAreaElement).value)"
    ></textarea>
    <div class="import-file-row">
      <label class="btn-import-file">
        选择文件
        <input type="file" accept=".json" @change="$emit('onImportFile', $event)" />
      </label>
      <span v-if="importFileName" class="import-file-name">{{
        importFileName
      }}</span>
    </div>
    <p v-if="importErrorMessage" class="import-error">
      {{ importErrorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  importJsonText: string;
  importFileName: string;
  importErrorMessage: string;
}>();

defineEmits<{
  "update:importJsonText": [value: string];
  onImportFile: [e: Event];
}>();
</script>

<style scoped lang="scss">
.import-container {
  h1 {
    font-size: clamp(2rem, 2vw, 4rem);
  }

  .import-tip {
    margin: 1rem 0;
    font-size: clamp(1.2rem, 1.2vw, 1.6rem);
    color: var(--text);
  }

  .import-textarea {
    width: 100%;
    height: 200px;
    box-sizing: border-box;
    resize: none;
    padding: 0.8rem;
    font-size: clamp(1.2rem, 1.2vw, 1.4rem);
    font-family: var(--mono);
    border-radius: 6px;
    border: 1px solid var(--text-h);
    background: var(--bg_search);
    color: var(--text);
    outline: none;
    transition: border 0.3s ease;

    &:focus {
      border-color: var(--color_mizuki);
    }
  }

  .import-file-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 1rem 0;

    .btn-import-file {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 2rem;
      padding: 6px 14px;
      border-radius: 6px;
      border: 1px solid var(--text-h);
      font-size: clamp(1.2rem, 1.2vw, 1.5rem);
      cursor: pointer;
      color: var(--text);
      transition: all 0.3s ease;

      &:hover {
        border-color: var(--color_mizuki);
        color: var(--color_mizuki);
      }

      input[type="file"] {
        display: none;
      }
    }

    .import-file-name {
      font-size: clamp(1.1rem, 1.1vw, 1.3rem);
      color: var(--color_mizuki);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .import-error {
    color: var(--color_alert);
    font-size: clamp(1.1rem, 1.1vw, 1.4rem);
    margin: 0.5rem 0 0 0;
  }
}

@media screen and (max-width: 600px) {
  .import-container {
    .import-textarea {
      height: 150px;
      font-size: 1.2rem;
    }

    .import-file-row {
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  }
}
</style>
