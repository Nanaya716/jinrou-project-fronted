<template>
    <div style="margin: 10px;">
      <!-- 显示渲染后的 Markdown 内容 -->
      <div v-html="renderedMarkdown"></div>
    </div>
</template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue'
  import { marked }from 'marked'
  
  // 存储加载的 Markdown 内容
  const markdownContent = ref('')
  
  // 当组件挂载时，加载并渲染 Markdown 文件
  onMounted(async () => {
    const response = await fetch('src/markdown/knowledge.md')
    markdownContent.value = await response.text()
  })
  
  // 将 Markdown 内容转换为 HTML
  const renderedMarkdown = computed(() => marked(markdownContent.value))
  </script>
  