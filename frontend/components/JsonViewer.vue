<template>
  <div class="font-mono text-[13px] leading-[1.6] w-full text-slate-300 py-4 min-h-full custom-scrollbar">
    <template v-if="parsedData !== undefined">
      <div 
        v-for="(lineObj, i) in lines" 
        :key="i"
        v-show="!isHidden(i)"
        class="flex hover:bg-white/[0.04] transition-colors group cursor-text"
        :class="{ 'bg-white/[0.04]': activeLine === i }"
        @click="activeLine = i"
      >
        <div class="w-[52px] shrink-0 text-right pr-2 text-slate-500 select-none border-r border-slate-700/50 mr-4 flex items-center justify-end gap-1 relative group-hover:text-slate-400">
          <span class="opacity-50 text-[11px]">{{ i + 1 }}</span>
          <div class="w-4 h-full flex items-center justify-center cursor-pointer hover:text-slate-200" @click.stop="toggleBlock(i)">
            <svg v-if="lineObj.blockEnd !== null" class="w-3 h-3 transition-transform" :class="{ '-rotate-90': collapsedBlocks.has(i) }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <div class="flex-1 flex items-stretch">
          <div class="shrink-0 flex" v-html="highlight(lineObj.text).prefix"></div>
          <div class="flex-1 whitespace-pre-wrap break-all" style="word-break: break-word;">
            <span v-html="highlight(lineObj.text).rest"></span>
            <span v-if="collapsedBlocks.has(i)" class="text-slate-400 select-none bg-white/10 px-1 mx-1 rounded text-[11px] cursor-pointer" @click.stop="toggleBlock(i)">...</span>
            <span v-if="collapsedBlocks.has(i)" class="text-slate-300">{{ getEndPunctuation(lineObj) }}</span>
          </div>
        </div>
      </div>
    </template>
    <div v-else class="text-red-400 italic px-6">Invalid JSON data</div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  data: {
    required: true
  }
})

const activeLine = ref(-1)
const collapsedBlocks = ref(new Set())

const toggleBlock = (i) => {
  if (collapsedBlocks.value.has(i)) {
    collapsedBlocks.value.delete(i)
  } else {
    collapsedBlocks.value.add(i)
  }
}

const parsedData = computed(() => {
  if (typeof props.data === 'string') {
    try {
      return JSON.parse(props.data)
    } catch (e) {
      return undefined
    }
  }
  return props.data
})

const lines = computed(() => {
  if (parsedData.value === undefined) return []
  const rawLines = JSON.stringify(parsedData.value, null, 4).split('\n')
  
  const blocks = {}
  const stack = []
  
  rawLines.forEach((line, i) => {
    const trimmed = line.trim()
    if (trimmed.endsWith('{') || trimmed.endsWith('[')) {
      stack.push(i)
    } else if (trimmed === '}' || trimmed === ']' || trimmed === '},' || trimmed === '],') {
      if (stack.length > 0) {
        const start = stack.pop()
        blocks[start] = i
      }
    }
  })
  
  return rawLines.map((line, i) => ({
    text: line,
    blockEnd: blocks[i] !== undefined ? blocks[i] : null
  }))
})

const hiddenLines = computed(() => {
  const hidden = new Array(lines.value.length).fill(false)
  for (const start of collapsedBlocks.value) {
    const end = lines.value[start].blockEnd
    if (end !== null) {
      for (let i = start + 1; i <= end; i++) {
        hidden[i] = true
      }
    }
  }
  return hidden
})

const isHidden = (i) => hiddenLines.value[i]

const getEndPunctuation = (lineObj) => {
  if (lineObj.blockEnd === null) return ''
  return lines.value[lineObj.blockEnd].text.trim()
}

const escapeHtml = (str) => {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const highlight = (rawLine) => {
  const line = escapeHtml(rawLine)
  
  const leadingSpaceMatch = line.match(/^( +)/)
  let prefix = ''
  let rest = line
  
  if (leadingSpaceMatch) {
    const spaces = leadingSpaceMatch[1]
    const depth = spaces.length / 4
    for (let i = 0; i < depth; i++) {
      prefix += `<div class="border-l border-slate-600/50 w-[4ch]"></div>`
    }
    rest = line.substring(spaces.length)
  }
  
  const regex = /("(?:[^"\\]|\\.)*")\s*:|("(?:[^"\\]|\\.)*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(true|false)|(null)/g
  
  rest = rest.replace(regex, (match, key, str, num, bool, nul) => {
    if (key) {
      return `<span class="text-syntax-key">${key}</span>:`
    } else if (str) {
      const isUrl = /^"https?:\/\//.test(str)
      const classes = isUrl ? 'text-syntax-str underline underline-offset-2 cursor-pointer' : 'text-syntax-str'
      return `<span class="${classes}">${str}</span>`
    } else if (num) {
      return `<span class="text-syntax-num">${num}</span>`
    } else if (bool) {
      return `<span class="text-syntax-bool">${bool}</span>`
    } else if (nul) {
      return `<span class="text-syntax-null">${nul}</span>`
    }
    return match
  })
  
  return { prefix, rest }
}
</script>
