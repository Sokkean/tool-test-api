<template>
  <div class="flex flex-col gap-0.5">
    <!-- Folder Row -->
    <div class="px-2 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between group relative"
         :class="workspaceStore.activeCollection?.id === collection.id ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'">
      
      <div @click="toggleCollection" class="flex items-center gap-2 truncate cursor-pointer flex-1 min-w-0" :style="{ paddingLeft: `${depth * 12}px` }">
        <ChevronRight class="w-3 h-3 shrink-0 transition-transform" :class="{'rotate-90': isExpanded}" />
        <Folder class="w-3.5 h-3.5 shrink-0" :class="{'opacity-70': workspaceStore.activeCollection?.id !== collection.id}" />
        <span class="truncate">{{ collection.name }}</span>
      </div>

      <!-- Action Menu Button -->
      <button @click.stop="toggleMenu('col_' + collection.id)" 
              class="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700/50 rounded transition-opacity shrink-0">
        <MoreVertical class="w-3.5 h-3.5" />
      </button>

      <!-- Dropdown Menu -->
      <div v-if="activeMenu === 'col_' + collection.id"
           class="absolute right-0 top-full mt-1 w-40 bg-slate-800 border border-slate-700 rounded-md shadow-xl py-1 z-50 flex flex-col">
        <button @click.stop="handleCreateRequest" class="px-3 py-1.5 text-xs text-left hover:bg-slate-700 flex items-center gap-2 text-slate-300">
          <FilePlus class="w-3 h-3" /> New Request
        </button>
        <button @click.stop="isCreatingSub = !isCreatingSub; closeMenu()" class="px-3 py-1.5 text-xs text-left hover:bg-slate-700 flex items-center gap-2 text-slate-300">
          <FolderPlus class="w-3 h-3" /> New Sub-Folder
        </button>
        <div class="h-px bg-slate-700 my-1"></div>
        <button @click.stop="handleRename" class="px-3 py-1.5 text-xs text-left hover:bg-slate-700 flex items-center gap-2 text-slate-300">
          <Edit2 class="w-3 h-3" /> Rename
        </button>
        <button @click.stop="handleDuplicate" class="px-3 py-1.5 text-xs text-left hover:bg-slate-700 flex items-center gap-2 text-slate-300">
          <Copy class="w-3 h-3" /> Duplicate
        </button>
        <div class="h-px bg-slate-700 my-1"></div>
        <button @click.stop="handleImport" class="px-3 py-1.5 text-xs text-left hover:bg-slate-700 flex items-center gap-2 text-slate-300">
          <Upload class="w-3 h-3" /> Import Folder
        </button>
        <button @click.stop="handleExport" class="px-3 py-1.5 text-xs text-left hover:bg-slate-700 flex items-center gap-2 text-slate-300">
          <Download class="w-3 h-3" /> Export
        </button>
        <div class="h-px bg-slate-700 my-1"></div>
        <button @click.stop="handleDelete" class="px-3 py-1.5 text-xs text-left hover:bg-red-500/20 text-red-400 flex items-center gap-2">
          <Trash2 class="w-3 h-3" /> Delete
        </button>
      </div>
    </div>
    
    <!-- Expanded Content -->
    <div v-if="isExpanded" class="flex flex-col gap-0.5 w-full relative">
      <div class="absolute top-0 bottom-0 w-px bg-slate-800/50 -z-10" :style="{ left: `${(depth * 12) + 15}px` }"></div>
      
      <!-- Sub Collections (Recursive) -->
      <FolderTreeItem 
        v-for="child in collection.children" 
        :key="child.id" 
        :collection="child" 
        :depth="depth + 1" 
        :workspace="workspace" 
        :activeMenu="activeMenu"
        @update:activeMenu="$emit('update:activeMenu', $event)"
      />

      <!-- Requests -->
      <div v-for="req in collection.requests" :key="req.id"
           class="py-1.5 pr-2 rounded-md text-xs flex items-center justify-between group relative transition-colors"
           :class="workspaceStore.activeRequest?.id === req.id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'"
           :style="{ paddingLeft: `${(depth + 1) * 12 + 8}px` }">
        <div @click="workspaceStore.selectRequest(req)" class="flex items-center gap-2 truncate cursor-pointer flex-1 min-w-0">
          <span class="font-bold text-[9px] shrink-0" :class="methodColor(req.method)">{{ req.method }}</span>
          <span class="truncate">{{ req.name }}</span>
        </div>

        <button @click.stop="toggleMenu('req_' + req.id)" 
                class="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700/50 rounded transition-opacity shrink-0">
          <MoreVertical class="w-3.5 h-3.5" />
        </button>

        <!-- Request Menu -->
        <div v-if="activeMenu === 'req_' + req.id" 
             class="absolute right-0 top-full mt-1 w-36 bg-slate-800 border border-slate-700 rounded-md shadow-xl py-1 z-50 flex flex-col">
          <button @click.stop="handleRenameReq(req)" class="px-3 py-1.5 text-xs text-left hover:bg-slate-700 flex items-center gap-2 text-slate-300"><Edit2 class="w-3 h-3" /> Rename</button>
          <button @click.stop="handleDuplicateReq(req)" class="px-3 py-1.5 text-xs text-left hover:bg-slate-700 flex items-center gap-2 text-slate-300"><Copy class="w-3 h-3" /> Duplicate</button>
          <div class="h-px bg-slate-700 my-1"></div>
          <button @click.stop="handleDeleteReq(req)" class="px-3 py-1.5 text-xs text-left hover:bg-red-500/20 text-red-400 flex items-center gap-2"><Trash2 class="w-3 h-3" /> Delete</button>
        </div>
      </div>
      
      <!-- New Sub Collection Input -->
      <div v-if="isCreatingSub" class="mt-1 flex items-center gap-2 pr-1" :style="{ paddingLeft: `${(depth + 1) * 12 + 8}px` }">
        <input v-model="newSubName" placeholder="Folder Name..." 
               class="flex-1 w-full min-w-0 bg-slate-950/50 border border-slate-800 text-slate-300 px-2 py-1 rounded-md text-xs focus:outline-none focus:border-indigo-500 transition-colors" 
               @keyup.enter="handleCreateSub" @keyup.esc="isCreatingSub = false" />
        <button @click="handleCreateSub" class="p-1 bg-slate-800 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-400 rounded-md transition-colors border border-slate-700 hover:border-indigo-500/30 shrink-0">
          <Plus class="w-3 h-3" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, inject, watch } from 'vue'
import { useWorkspaceStore } from '../stores/workspace'
import { Folder, ChevronRight, MoreVertical, Edit2, Copy, Trash2, FilePlus, FolderPlus, Plus, Download, Upload } from 'lucide-vue-next'

const props = defineProps({
  collection: Object,
  workspace: Object,
  depth: { type: Number, default: 0 },
  activeMenu: String
})

const emit = defineEmits(['update:activeMenu'])
const workspaceStore = useWorkspaceStore()
const triggerCollectionImport = inject('triggerCollectionImport')

const isExpanded = ref(false)

watch(() => workspaceStore.searchQuery, (newVal) => {
  if (newVal) {
    isExpanded.value = true
  }
})
const isCreatingSub = ref(false)
const newSubName = ref('')

const toggleMenu = (menuId) => {
  emit('update:activeMenu', props.activeMenu === menuId ? null : menuId)
}

const closeMenu = () => {
  emit('update:activeMenu', null)
}

const toggleCollection = async () => {
  await workspaceStore.selectCollection(props.collection)
  isExpanded.value = !isExpanded.value
}

const handleCreateRequest = async () => {
  closeMenu()
  isExpanded.value = true
  await workspaceStore.createNewRequest(props.collection)
}

const handleCreateSub = async () => {
  if (!newSubName.value) return
  await workspaceStore.createCollection(props.workspace.id, newSubName.value, props.collection.id)
  newSubName.value = ''
  isCreatingSub.value = false
  isExpanded.value = true
}

const handleRename = async () => {
  closeMenu()
  const newName = prompt('Rename folder to:', props.collection.name)
  if (newName && newName.trim() !== props.collection.name) {
    await workspaceStore.renameCollection(props.collection.id, newName.trim())
  }
}

const handleDuplicate = async () => {
  closeMenu()
  await workspaceStore.duplicateCollection(props.collection.id)
}

const handleExport = async () => {
  closeMenu()
  try {
    await workspaceStore.exportCollection(props.collection.id, props.collection.name)
  } catch (err) {
    alert('Error exporting collection: ' + err.message)
  }
}

const handleImport = () => {
  closeMenu()
  if (triggerCollectionImport) {
    triggerCollectionImport(props.collection, props.workspace)
  }
}

const handleDelete = async () => {
  closeMenu()
  if (confirm(`Are you sure you want to delete folder "${props.collection.name}"?`)) {
    await workspaceStore.deleteCollection(props.collection.id)
  }
}

const handleRenameReq = async (req) => {
  closeMenu()
  const newName = prompt('Rename request to:', req.name)
  if (newName && newName.trim() !== req.name) {
    await workspaceStore.renameRequest(req.id, newName.trim())
  }
}

const handleDuplicateReq = async (req) => {
  closeMenu()
  await workspaceStore.duplicateRequest(req.id)
}

const handleDeleteReq = async (req) => {
  closeMenu()
  if (confirm(`Are you sure you want to delete request "${req.name}"?`)) {
    await workspaceStore.deleteRequest(req.id)
  }
}

const methodColor = (method) => {
  const colors = { GET: 'text-blue-400', POST: 'text-emerald-400', PUT: 'text-amber-400', PATCH: 'text-amber-400', DELETE: 'text-red-400' }
  return colors[method] || 'text-slate-400'
}
</script>
