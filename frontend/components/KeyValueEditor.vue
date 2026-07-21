<template>
  <div class="flex flex-col h-full bg-slate-950 text-sm text-slate-300">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50">
      <span class="text-xs font-medium text-slate-500">{{ title }}</span>
      <button @click="isBulkEdit = !isBulkEdit" class="text-[11px] font-medium text-blue-400 hover:text-blue-300 transition-colors">
        {{ isBulkEdit ? 'Key-Value Edit' : 'Bulk Edit' }}
      </button>
    </div>

    <!-- Table View -->
    <div v-if="!isBulkEdit" class="flex-1 overflow-auto custom-scrollbar">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-slate-800 text-xs text-slate-500 bg-slate-900/20">
            <th class="w-10 p-2 text-center"></th>
            <th class="p-2 border-r border-slate-800/50 font-medium">Key</th>
            <th class="p-2 border-r border-slate-800/50 font-medium">Value</th>
            <th class="p-2 border-r border-slate-800/50 font-medium">Description</th>
            <th class="w-10 p-2"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in rows" :key="row._id" class="border-b border-slate-800/30 hover:bg-slate-800/20 group">
            <td class="p-2 text-center border-r border-slate-800/30">
              <input v-if="index < rows.length - 1 || row.key || row.value" type="checkbox" v-model="row.enabled" @change="update" class="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-blue-500 cursor-pointer accent-blue-500" />
            </td>
            <td class="p-0 border-r border-slate-800/30">
              <input v-model="row.key" @input="onInput(index)" placeholder="Key" class="w-full h-8 px-3 bg-transparent outline-none focus:bg-slate-800/40 text-emerald-400 placeholder-slate-700 font-mono text-[13px]" :class="{ 'opacity-50 line-through': !row.enabled && (index < rows.length - 1 || row.key) }" />
            </td>
            <td class="p-0 border-r border-slate-800/30">
              <input v-model="row.value" @input="onInput(index)" placeholder="Value" class="w-full h-8 px-3 bg-transparent outline-none focus:bg-slate-800/40 text-amber-400 placeholder-slate-700 font-mono text-[13px]" :class="{ 'opacity-50 line-through': !row.enabled && (index < rows.length - 1 || row.value) }" />
            </td>
            <td class="p-0 border-r border-slate-800/30">
              <input v-model="row.description" @input="update" placeholder="Description" class="w-full h-8 px-3 bg-transparent outline-none focus:bg-slate-800/40 text-slate-400 placeholder-slate-700 text-[13px]" :class="{ 'opacity-50': !row.enabled && index < rows.length - 1 }" />
            </td>
            <td class="p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button v-if="index < rows.length - 1 || row.key || row.value" @click="removeRow(index)" class="text-slate-500 hover:text-red-400 transition-colors">
                <X class="w-3.5 h-3.5" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Bulk Edit (CodeEditor) -->
    <div v-else class="flex-1 relative">
      <CodeEditor :modelValue="modelValue" @update:modelValue="onBulkEdit" :placeholder="placeholder" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import CodeEditor from './CodeEditor.vue'

const props = defineProps({
  modelValue: { type: String, default: '[]' },
  title: { type: String, default: 'Params' },
  placeholder: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue'])

const isBulkEdit = ref(false)
const rows = ref([])

let isInternalUpdate = false

const generateId = () => Math.random().toString(36).substring(2, 9)

const ensureEmptyRow = () => {
  const last = rows.value[rows.value.length - 1]
  if (!last || last.key || last.value || last.description) {
    rows.value.push({ _id: generateId(), key: '', value: '', description: '', enabled: true })
  }
}

const syncFromValue = () => {
  if (isInternalUpdate) return
  
  let parsed = []
  try {
    let raw = JSON.parse(props.modelValue || '[]')
    if (!Array.isArray(raw) && typeof raw === 'object' && raw !== null) {
      parsed = Object.entries(raw).map(([k, v]) => ({ _id: generateId(), key: k, value: String(v), description: '', enabled: true }))
    } else if (Array.isArray(raw)) {
      parsed = raw.map(r => ({ _id: generateId(), key: r.key || '', value: r.value || '', description: r.description || '', enabled: r.enabled ?? true }))
    }
  } catch (e) {
    // Keep existing rows if invalid JSON
  }
  
  const currentSaved = rows.value
    .filter(r => r.key || r.value || r.description)
    .map(r => ({ key: r.key, value: r.value, description: r.description, enabled: r.enabled }))
    
  const parsedToCompare = parsed
    .filter(r => r.key || r.value || r.description)
    .map(r => ({ key: r.key, value: r.value, description: r.description, enabled: r.enabled }))
  
  if (JSON.stringify(currentSaved) !== JSON.stringify(parsedToCompare)) {
    rows.value = parsed
  }
  ensureEmptyRow()
}

watch(() => props.modelValue, syncFromValue, { immediate: true })

const update = () => {
  ensureEmptyRow()
  const toSave = rows.value
    .filter(r => r.key || r.value || r.description)
    .map(r => ({ key: r.key, value: r.value, description: r.description, enabled: r.enabled }))
  isInternalUpdate = true
  emit('update:modelValue', JSON.stringify(toSave, null, 2))
  setTimeout(() => isInternalUpdate = false, 0)
}

const onInput = (index) => {
  if (index === rows.value.length - 1) {
    rows.value[index].enabled = true
  }
  update()
}

const removeRow = (index) => {
  rows.value.splice(index, 1)
  if (rows.value.length === 0) ensureEmptyRow()
  update()
}

const onBulkEdit = (val) => {
  emit('update:modelValue', val)
}
</script>
