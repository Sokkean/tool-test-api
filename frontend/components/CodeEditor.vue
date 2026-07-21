<template>
  <div class="relative w-full h-full font-mono text-sm overflow-hidden bg-transparent group">
    <!-- Highlighted Output -->
    <pre 
      class="absolute inset-0 pointer-events-none p-4 m-0 whitespace-pre-wrap break-all overflow-hidden text-slate-300 custom-scrollbar"
      aria-hidden="true"
      v-html="highlightedHtml"
    ></pre>
    
    <!-- Transparent Textarea -->
    <textarea 
      ref="textareaRef"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @keydown="handleKeydown"
      @scroll="syncScroll"
      class="absolute inset-0 w-full h-full p-4 m-0 resize-none outline-none whitespace-pre-wrap break-all bg-transparent text-transparent caret-white custom-scrollbar focus:ring-0 focus:outline-none"
      spellcheck="false"
      :placeholder="placeholder"
    ></textarea>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { syntaxHighlight } from '../utils/syntax'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])
const textareaRef = ref(null)

const handleKeydown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === '/') {
    e.preventDefault()
    toggleComment()
  }
}

const toggleComment = () => {
  const el = textareaRef.value
  if (!el) return
  
  const start = el.selectionStart
  const end = el.selectionEnd
  const value = props.modelValue || ''
  
  let lineStart = value.lastIndexOf('\n', start - 1) + 1
  let lineEnd = value.indexOf('\n', end)
  if (lineEnd === -1) lineEnd = value.length
  
  const selectedLinesStr = value.substring(lineStart, lineEnd)
  const lines = selectedLinesStr.split('\n')
  
  const allCommented = lines.every(line => line.trim() === '' || line.trim().startsWith('//'))
  
  let newLinesStr = ''
  if (allCommented) {
    // Uncomment
    newLinesStr = lines.map(line => line.replace(/^(\s*)\/\/\s?/, '$1')).join('\n')
  } else {
    // Comment
    newLinesStr = lines.map(line => {
      const match = line.match(/^(\s*)/)
      const indent = match ? match[1] : ''
      return indent + '// ' + line.substring(indent.length)
    }).join('\n')
  }
  
  const newValue = value.substring(0, lineStart) + newLinesStr + value.substring(lineEnd)
  emit('update:modelValue', newValue)
  
  setTimeout(() => {
    el.selectionStart = start + (allCommented ? -3 : 3)
    el.selectionEnd = end + (allCommented ? -3 : 3)
  }, 0)
}

const highlightedHtml = computed(() => {
  // If empty, show nothing (placeholder will show in textarea)
  if (!props.modelValue && props.placeholder) return ''
  
  // To handle trailing newlines gracefully so the caret can move down
  let text = props.modelValue || ''
  if (text.endsWith('\n')) {
    text += ' '
  }
  return syntaxHighlight(text)
})

const syncScroll = (e) => {
  // Since the pre is pointer-events-none, scrolling happens on textarea.
  // We need the pre to visually scroll with it.
  const pre = e.target.previousElementSibling
  if (pre) {
    pre.scrollTop = e.target.scrollTop
    pre.scrollLeft = e.target.scrollLeft
  }
}
</script>

<style scoped>
/* Ensure the pre block and textarea perfectly overlap text metrics */
textarea, pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  line-height: 1.5;
  tab-size: 2;
}

/* Hide text color in textarea but keep selection visible */
textarea {
  color: transparent !important;
  caret-color: white;
}
textarea::selection {
  background-color: rgba(59, 130, 246, 0.4);
  color: transparent;
}
</style>
