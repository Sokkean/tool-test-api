<template>
  <div class="text-[13px] leading-[1.5] font-mono">
    <!-- Primitive Value -->
    <span v-if="isPrimitive" class="break-words">
      <span :class="primitiveClass" v-html="formattedValue"></span><span v-if="!isLast" class="text-slate-400">,</span>
    </span>
    
    <!-- Object/Array -->
    <div v-else class="w-full">
      <div class="flex items-start">
        <!-- Collapse Toggle Arrow -->
        <span 
          v-if="length > 0"
          class="w-[14px] h-[20px] inline-flex items-center justify-center cursor-pointer text-slate-500 hover:text-slate-300 transition-transform select-none shrink-0"
          :class="{ '-rotate-90': collapsed }"
          @click="collapsed = !collapsed"
        >
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
        <span v-else class="w-[14px] h-[20px] inline-block shrink-0"></span>
        
        <span class="text-slate-300 h-[20px] flex items-center">{{ isArray ? '[' : '{' }}</span>
        
        <!-- Collapsed summary -->
        <span v-if="collapsed" class="text-slate-500 mx-2 cursor-pointer hover:text-slate-400 select-none text-xs h-[20px] flex items-center" @click="collapsed = false">
          {{ length }} items
        </span>
        <span v-if="collapsed" class="text-slate-300 h-[20px] flex items-center">{{ isArray ? ']' : '}' }}</span>
        <span v-if="collapsed && !isLast" class="text-slate-400 h-[20px] flex items-center">,</span>
      </div>

      <!-- Expanded Content -->
      <div v-show="!collapsed" class="pl-[14px] ml-[6px] border-l border-slate-700/60 hover:border-slate-500/80 transition-colors">
        <div v-for="(val, key, index) in data" :key="key" class="flex items-start">
          <div v-if="!isArray" class="shrink-0 mr-2">
            <span class="text-pink-400 font-medium">"{{ key }}"</span><span class="text-slate-400">:</span>
          </div>
          <div class="flex-1 min-w-0">
            <JsonNode :data="val" :is-last="index === length - 1" />
          </div>
        </div>
      </div>
      
      <div v-show="!collapsed" class="flex items-center ml-[2px]">
        <span class="text-slate-300">{{ isArray ? ']' : '}' }}</span>
        <span v-show="!isLast" class="text-slate-400">,</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  data: {
    required: true
  },
  isLast: {
    type: Boolean,
    default: true
  },
  isRoot: {
    type: Boolean,
    default: false
  }
})

const collapsed = ref(false)

const isPrimitive = computed(() => {
  return props.data === null || typeof props.data !== 'object'
})

const isArray = computed(() => {
  return Array.isArray(props.data)
})

const length = computed(() => {
  if (isPrimitive.value) return 0
  if (isArray.value) return props.data.length
  return Object.keys(props.data).length
})

const primitiveClass = computed(() => {
  if (props.data === null) return 'text-red-400 italic font-medium'
  if (typeof props.data === 'boolean') return 'text-cyan-400 font-medium'
  if (typeof props.data === 'number') return 'text-purple-400'
  return 'text-yellow-300' // String
})

const formattedValue = computed(() => {
  if (props.data === null) return 'null'
  if (typeof props.data === 'string') {
    const escaped = props.data.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // URLs inside strings can be converted to links, but for now just basic escaping
    return `"${escaped}"`
  }
  return String(props.data)
})
</script>
<script>
export default {
  name: 'JsonNode'
}
</script>
