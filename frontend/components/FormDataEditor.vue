<template>
  <div class="flex flex-col h-full bg-transparent text-sm text-slate-300 transition-colors duration-200" :class="error ? 'bg-red-500/5 ring-1 ring-inset ring-red-500/40' : ''">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50">
      <span class="text-xs font-medium text-slate-500">{{ title }}</span>
    </div>

    <!-- Table View -->
    <div class="flex-1 overflow-auto custom-scrollbar">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-slate-800 text-xs text-slate-500 bg-slate-900/20">
            <th class="w-10 p-2 text-center"></th>
            <th class="p-2 border-r border-slate-800/50 font-medium w-1/4">Key</th>
            <th class="p-2 border-r border-slate-800/50 font-medium w-24">Type</th>
            <th class="p-2 border-r border-slate-800/50 font-medium w-1/3">Value</th>
            <th class="p-2 border-r border-slate-800/50 font-medium">Description</th>
            <th class="w-10 p-2"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in rows" :key="row._id" class="border-b border-slate-800/30 hover:bg-slate-800/20 group">
            <td class="p-2 text-center border-r border-slate-800/30">
              <input v-if="index < rows.length - 1 || row.key || (row.type === 'text' ? row.value : row.file)" type="checkbox" v-model="row.enabled" @change="update" class="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-blue-500 cursor-pointer accent-blue-500" />
            </td>
            <td class="p-0 border-r border-slate-800/30">
              <div class="relative w-full h-8 group/key">
                <input v-model="row.key" @input="onInput(index)" @scroll="syncScroll" placeholder="Key" class="absolute inset-0 w-full h-full px-3 py-0 leading-[32px] bg-transparent outline-none focus:bg-slate-800/40 text-transparent caret-white placeholder:text-slate-700 font-mono text-[13px] z-10 m-0 border-0" :class="{ 'opacity-50 line-through': !row.enabled && (index < rows.length - 1 || row.key) }" spellcheck="false" />
                <div class="absolute inset-0 w-full h-full px-3 py-0 leading-[32px] pointer-events-none whitespace-pre font-mono text-[13px] text-emerald-400 z-20 overflow-hidden m-0 border-0" :class="{ 'opacity-50 line-through': !row.enabled && (index < rows.length - 1 || row.key) }" aria-hidden="true" v-html="highlightText(row.key)" @mouseover="$emit('varHover', $event)" @mouseout="$emit('varLeave', $event)" @click="focusInput"></div>
              </div>
            </td>
            <td class="p-0 border-r border-slate-800/30 relative">
              <select v-model="row.type" @change="onInput(index)" class="w-full h-8 px-2 bg-transparent outline-none focus:bg-slate-800/40 text-slate-400 appearance-none text-[13px] cursor-pointer">
                <option value="text" class="bg-slate-900">Text</option>
                <option value="file" class="bg-slate-900">File</option>
              </select>
            </td>
            <td class="p-0 border-r border-slate-800/30">
              <template v-if="row.type === 'text'">
                <div class="relative w-full h-8 group/val">
                  <input v-model="row.value" @input="onInput(index)" @scroll="syncScroll" placeholder="Value" class="absolute inset-0 w-full h-full px-3 py-0 leading-[32px] bg-transparent outline-none focus:bg-slate-800/40 text-transparent caret-white placeholder:text-slate-700 font-mono text-[13px] z-10 m-0 border-0" :class="{ 'opacity-50 line-through': !row.enabled && (index < rows.length - 1 || row.value) }" spellcheck="false" />
                  <div class="absolute inset-0 w-full h-full px-3 py-0 leading-[32px] pointer-events-none whitespace-pre font-mono text-[13px] text-amber-400 z-20 overflow-hidden m-0 border-0" :class="{ 'opacity-50 line-through': !row.enabled && (index < rows.length - 1 || row.value) }" aria-hidden="true" v-html="highlightText(row.value)" @mouseover="$emit('varHover', $event)" @mouseout="$emit('varLeave', $event)" @click="focusInput"></div>
                </div>
              </template>
              <template v-else>
                <div class="flex items-center h-8 px-3 w-full" :class="{ 'opacity-50 line-through': !row.enabled && (index < rows.length - 1 || row.file) }">
                  <input type="file" @change="(e) => onFileChange(e, index)" class="w-full text-[12px] text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer outline-none" />
                </div>
              </template>
            </td>
            <td class="p-0 border-r border-slate-800/30">
              <input v-model="row.description" @input="update" placeholder="Description" class="w-full h-8 px-3 bg-transparent outline-none focus:bg-slate-800/40 text-slate-400 placeholder-slate-700 text-[13px]" :class="{ 'opacity-50': !row.enabled && index < rows.length - 1 }" />
            </td>
            <td class="p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button v-if="index < rows.length - 1 || row.key || (row.type === 'text' ? row.value : row.file)" @click="removeRow(index)" class="text-slate-500 hover:text-red-400 transition-colors">
                <X class="w-3.5 h-3.5" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { X } from 'lucide-vue-next'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  title: { type: String, default: 'Form Data' },
  error: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'update:files', 'varHover', 'varLeave'])

const rows = ref([])

let isInternalUpdate = false

const generateId = () => Math.random().toString(36).substring(2, 9)

const ensureEmptyRow = () => {
  const last = rows.value[rows.value.length - 1]
  if (!last || last.key || (last.type === 'text' && last.value) || (last.type === 'file' && last.file) || last.description) {
    rows.value.push({ _id: generateId(), key: '', type: 'text', value: '', file: null, description: '', enabled: true })
  }
}

const syncFromValue = () => {
  if (isInternalUpdate) return
  
  let parsed = []
  if (Array.isArray(props.modelValue)) {
    parsed = props.modelValue.map(r => ({
      _id: generateId(),
      key: r.key || '',
      type: r.type === 'file' ? 'file' : 'text',
      value: r.value || '',
      file: r.file || null,
      description: r.description || '',
      enabled: r.enabled ?? true
    }))
  }
  
  rows.value = parsed
  ensureEmptyRow()
}

watch(() => props.modelValue, syncFromValue, { immediate: true })

const update = () => {
  ensureEmptyRow()
  const toSave = rows.value
    .filter(r => r.key || (r.type === 'text' ? r.value : r.file) || r.description)
    .map(r => ({
      key: r.key,
      type: r.type,
      value: r.value,
      file: r.file,
      description: r.description,
      enabled: r.enabled
    }))
  isInternalUpdate = true
  emit('update:modelValue', toSave)
  setTimeout(() => isInternalUpdate = false, 0)
}

const onInput = (index) => {
  if (index === rows.value.length - 1) {
    rows.value[index].enabled = true
  }
  update()
}

const onFileChange = (e, index) => {
  const file = e.target.files[0] || null
  rows.value[index].file = file
  onInput(index)
}

const removeRow = (index) => {
  rows.value.splice(index, 1)
  if (rows.value.length === 0) ensureEmptyRow()
  update()
}

const highlightText = (val) => {
  if (!val) return ''
  const escaped = val.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  return escaped.replace(/\{\{([^}]+)\}\}/g, '<span class="text-amber-400 pointer-events-auto cursor-pointer hover:underline env-var-highlight" data-var="$1">{{$1}}</span>')
}

const syncScroll = (e) => {
  const overlay = e.target.nextElementSibling
  if (overlay) {
    overlay.scrollLeft = e.target.scrollLeft
  }
}

const focusInput = (e) => {
  if (e.target && e.target.classList && e.target.classList.contains('env-var-highlight')) {
    const input = e.target.closest('td').querySelector('input')
    if (input) input.focus()
  }
}
</script>
