<template>
  <div class="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
    <input type="file" ref="fileInput" @change="handleFileUpload" accept=".json" class="hidden" />
    <!-- Sidebar -->
    <div v-if="authStore.user" class="bg-slate-900/50 backdrop-blur-md border-r border-slate-800 flex flex-col shadow-xl z-10 shrink-0 relative transition-[width] duration-0" :style="{ width: `${sidebarWidth}px` }">
      <!-- User Profile -->
      <div class="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
        <div class="flex items-center gap-3 w-full min-w-0">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold shadow-lg shadow-blue-500/20 shrink-0">
            {{ authStore.user.name.charAt(0).toUpperCase() }}
          </div>
          <span class="font-medium text-sm truncate flex-1">{{ authStore.user.name }}</span>
          <button @click="authStore.logout()" class="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors shrink-0" title="Logout">
            <LogOut class="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div class="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
        <!-- Tree View -->
        <div>
          <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2 pl-1">
            <Layers class="w-4 h-4" /> Explorer
          </div>

          <div class="mb-3 px-1">
            <div class="relative">
              <Search class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input v-model="workspaceStore.searchQuery" 
                     @keyup.enter="workspaceStore.loadWorkspaces()" 
                     placeholder="Search workspaces..." 
                     class="w-full bg-slate-950/50 border border-slate-800 text-slate-300 pl-8 pr-2 py-1.5 rounded-md text-xs focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600" />
            </div>
          </div>

          <ul class="space-y-1">
            <!-- Workspace Level -->
            <li v-for="ws in workspaceStore.filteredWorkspaces" :key="ws.id" class="flex flex-col gap-1">
              <div class="px-2 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center justify-between group relative"
                  :class="workspaceStore.activeWorkspace?.id === ws.id ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'">
                <div @click="toggleWorkspace(ws)" class="flex items-center gap-2 truncate cursor-pointer flex-1 min-w-0">
                  <ChevronRight class="w-3.5 h-3.5 shrink-0 transition-transform" :class="{'rotate-90': expandedWorkspaces.has(ws.id)}" />
                  <Database class="w-3.5 h-3.5 shrink-0" :class="{'opacity-70': workspaceStore.activeWorkspace?.id !== ws.id}" />
                  <span class="truncate">{{ ws.name }}</span>
                </div>
                
                <!-- Action Menu Button -->
                <button @click.stop="activeMenu = activeMenu === ws.id ? null : ws.id" 
                        class="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-700/50 rounded transition-opacity shrink-0">
                  <MoreVertical class="w-3.5 h-3.5" />
                </button>

                <!-- Dropdown Menu -->
                <div v-if="activeMenu === ws.id" 
                     class="absolute right-0 top-full mt-1 w-36 bg-slate-800 border border-slate-700 rounded-md shadow-xl py-1 z-50 flex flex-col">
                  <button @click.stop="handleRename(ws)" class="px-3 py-1.5 text-xs text-left hover:bg-slate-700 flex items-center gap-2 text-slate-300">
                    <Edit2 class="w-3 h-3" /> Rename
                  </button>
                  <button @click.stop="openTeamModal(ws)" class="px-3 py-1.5 text-xs text-left hover:bg-slate-700 flex items-center gap-2 text-slate-300">
                    <Users class="w-3 h-3" /> Manage Team
                  </button>
                  <button @click.stop="handleDuplicate(ws)" class="px-3 py-1.5 text-xs text-left hover:bg-slate-700 flex items-center gap-2 text-slate-300">
                    <Copy class="w-3 h-3" /> Duplicate
                  </button>
                  <button @click.stop="triggerImport(ws)" class="px-3 py-1.5 text-xs text-left hover:bg-slate-700 flex items-center gap-2 text-slate-300">
                    <Upload class="w-3 h-3" /> Import Collection
                  </button>
                  <button @click.stop="handleExport(ws)" class="px-3 py-1.5 text-xs text-left hover:bg-slate-700 flex items-center gap-2 text-slate-300">
                    <Download class="w-3 h-3" /> Export
                  </button>
                  <div class="h-px bg-slate-700 my-1"></div>
                  <button @click.stop="handleDelete(ws)" class="px-3 py-1.5 text-xs text-left hover:bg-red-500/20 text-red-400 flex items-center gap-2">
                    <Trash2 class="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
              
              <!-- Collection Level (Nested) -->
              <div v-if="expandedWorkspaces.has(ws.id)" class="pl-3 pr-1 space-y-1 mt-1 border-l border-slate-800/50 ml-3.5 pb-1">
                <FolderTreeItem 
                  v-for="col in ws.treeCollections" 
                  :key="col.id" 
                  :collection="col" 
                  :workspace="ws"
                  :activeMenu="activeMenu"
                  @update:activeMenu="activeMenu = $event"
                />
                
                <!-- New Root Collection Input -->
                <div class="mt-2 flex items-center gap-2 pl-1 pr-1">
                  <input v-model="newCollectionName" placeholder="New Folder..." 
                    class="flex-1 w-full min-w-0 bg-slate-950/50 border border-slate-800 text-slate-300 px-2 py-1 rounded-md text-xs focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600" 
                    @keyup.enter="createCollection(ws)" />
                  <button @click="createCollection(ws)" class="p-1 bg-slate-800 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-400 rounded-md transition-colors border border-slate-700 hover:border-indigo-500/30 shrink-0" title="New Folder">
                    <Plus class="w-3.5 h-3.5" />
                  </button>
                  <button @click="triggerImport(ws)" class="p-1 bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 rounded-md transition-colors border border-slate-700 hover:border-emerald-500/30 shrink-0" title="Import Postman Collection (.json)">
                    <Upload class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </li>
          </ul>
          
          <div class="mt-4 pt-4 border-t border-slate-800/50 flex items-center gap-2 px-1">
            <input v-model="newWorkspaceName" placeholder="New Workspace..." 
              class="flex-1 w-full min-w-0 bg-slate-950/50 border border-slate-800 text-slate-300 px-2 py-1.5 rounded-md text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600" 
              @keyup.enter="createWorkspace" />
            <button @click="createWorkspace" class="p-1.5 bg-slate-800 hover:bg-blue-500/20 text-slate-300 hover:text-blue-400 rounded-md transition-colors border border-slate-700 hover:border-blue-500/30 shrink-0" title="New Workspace">
              <Plus class="w-4 h-4" />
            </button>
            <button @click="triggerGlobalImport" class="p-1.5 bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 rounded-md transition-colors border border-slate-700 hover:border-emerald-500/30 shrink-0" title="Import Postman Collection (.json)">
              <Upload class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <!-- Theme Switcher -->
      <div class="p-4 border-t border-slate-800 bg-slate-900/50 flex flex-col gap-3 shrink-0">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Palette class="w-4 h-4"/> Theme</span>
        <div class="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
          <button @click="theme = 'dark'" :class="theme === 'dark' ? 'bg-slate-800 text-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-300'" class="flex-1 py-1.5 text-xs font-medium rounded-md transition-all">Dark</button>
          <button @click="theme = 'light'" :class="theme === 'light' ? 'bg-slate-200 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-300'" class="flex-1 py-1.5 text-xs font-medium rounded-md transition-all">Light</button>
          <button @click="theme = 'ocean'" :class="theme === 'ocean' ? 'bg-blue-900/50 text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'" class="flex-1 py-1.5 text-xs font-medium rounded-md transition-all">Ocean</button>
        </div>
      </div>

      <!-- Advanced Settings -->
      <div class="p-4 border-t border-slate-800 bg-slate-900/50 flex flex-col gap-3 shrink-0">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2"><Settings class="w-4 h-4"/> System</span>
        <button @click="clearCache" class="flex items-center justify-center gap-2 w-full py-1.5 text-xs font-medium rounded-md transition-all bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 shadow-sm outline-none">
          <Trash2 class="w-3.5 h-3.5" /> Clear Cache
        </button>
      </div>

      <!-- Resizer Handle -->
      <div @mousedown="startResize" class="absolute top-0 -right-1 bottom-0 w-2 cursor-col-resize z-50 group flex justify-center">
        <div class="h-full w-0.5 bg-blue-500/0 group-hover:bg-blue-500/50 transition-colors"></div>
      </div>
    </div>

    <!-- Main Content Slot -->
    <div class="flex-1 flex flex-col min-w-0 bg-slate-950 z-0 relative">
      <div v-if="!authStore.user" class="absolute inset-0 flex items-center justify-center bg-slate-950 text-slate-400 z-50">
        Loading...
      </div>
      <slot />
    </div>

    <!-- Team Management Modal -->
    <div v-if="showTeamModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        <div class="flex justify-between items-center p-4 border-b border-slate-800">
          <h3 class="font-semibold text-lg flex items-center gap-2"><Users class="w-5 h-5 text-indigo-400" /> Manage Team for {{ teamWorkspace?.name }}</h3>
          <button @click="showTeamModal = false" class="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"><X class="w-5 h-5"/></button>
        </div>
        <div class="p-6">
          <div class="mb-6">
            <label class="block text-sm font-medium text-slate-300 mb-2">Invite User</label>
            <div class="flex gap-2">
              <input v-model="inviteEmail" placeholder="user@example.com" class="flex-1 bg-slate-950/50 border border-slate-700 text-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-colors" @keyup.enter="handleInvite" />
              <button @click="handleInvite" :disabled="!inviteEmail || isInviting" class="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                {{ isInviting ? 'Inviting...' : 'Invite' }}
              </button>
            </div>
            <p v-if="inviteError" class="text-red-400 text-xs mt-2">{{ inviteError }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Team Members ({{ teamWorkspace?.members?.length || 0 }} / 10)</label>
            <div class="bg-slate-950/50 border border-slate-800 rounded-lg overflow-hidden">
              <!-- Owner (from userId) -->
              <div class="flex items-center justify-between p-3 border-b border-slate-800/50 hover:bg-slate-800/30">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-400 shrink-0">O</div>
                  <div class="flex flex-col">
                    <span class="text-sm font-medium text-slate-200">Owner</span>
                    <span class="text-xs text-slate-500">Workspace Creator</span>
                  </div>
                </div>
                <span class="text-xs font-semibold px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-md">Owner</span>
              </div>
              
              <!-- Invited Members -->
              <div v-for="member in teamWorkspace?.members || []" :key="member.id" class="flex items-center justify-between p-3 border-b border-slate-800/50 hover:bg-slate-800/30">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-400 shrink-0">
                    {{ member.user?.name?.charAt(0)?.toUpperCase() || member.user?.email?.charAt(0)?.toUpperCase() }}
                  </div>
                  <div class="flex flex-col">
                    <span class="text-sm font-medium text-slate-200">{{ member.user?.name || member.user?.email }}</span>
                    <span class="text-xs text-slate-500">{{ member.user?.email }}</span>
                  </div>
                </div>
                <button v-if="teamWorkspace.userId === authStore.user.id" @click="handleRemoveMember(member.userId)" class="text-slate-500 hover:text-red-400 p-1.5 rounded-md hover:bg-red-400/10 transition-colors" title="Remove Member">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
              
              <div v-if="!teamWorkspace?.members?.length" class="p-4 text-center text-sm text-slate-500">
                No invited members yet.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, provide, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../features/auth/stores/auth'
import { useWorkspaceStore } from '../stores/workspace'
import { Folder, LogOut, Plus, ChevronRight, Database, Layers, Palette, MoreVertical, Edit2, Copy, Trash2, Users, X, FilePlus, FolderPlus, Upload, Download, Settings, Search } from 'lucide-vue-next'
import FolderTreeItem from '../components/FolderTreeItem.vue'
import { useState } from '#app'

const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()
const router = useRouter()
const theme = useState('theme', () => 'dark')

const newWorkspaceName = ref('')
const newCollectionName = ref('')
const activeMenu = ref(null)

const showTeamModal = ref(false)
const teamWorkspace = ref(null)
const inviteEmail = ref('')
const isInviting = ref(false)
const inviteError = ref('')

const expandedWorkspaces = ref(new Set())

watch(() => workspaceStore.searchQuery, (newVal) => {
  if (newVal) {
    workspaceStore.filteredWorkspaces.forEach(ws => expandedWorkspaces.value.add(ws.id))
  }
})

const expandedCollections = ref(new Set())

const sidebarWidth = ref(256)
let isResizing = false

const startResize = (e) => {
  isResizing = true
  document.addEventListener('mousemove', resize)
  document.addEventListener('mouseup', stopResize)
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'col-resize'
}

const resize = (e) => {
  if (isResizing) {
    let newWidth = e.clientX
    if (newWidth < 200) newWidth = 200
    if (newWidth > 800) newWidth = 800
    sidebarWidth.value = newWidth
  }
}

const stopResize = () => {
  isResizing = false
  document.removeEventListener('mousemove', resize)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
  localStorage.setItem('sidebar-width', sidebarWidth.value)
}

const clearCache = () => {
  if (confirm('Are you sure you want to clear local cache? This will reset themes and active workspaces.')) {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    const environments = localStorage.getItem('environments')
    const globalEnvironment = localStorage.getItem('globalEnvironment')
    const activeEnvironmentId = localStorage.getItem('activeEnvironmentId')
    
    // Backup scripts
    const scripts = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('req-') && (key.endsWith('-pre') || key.endsWith('-test')))) {
        scripts[key] = localStorage.getItem(key)
      }
    }
    
    localStorage.clear()
    
    if (token) localStorage.setItem('token', token)
    if (user) localStorage.setItem('user', user)
    if (environments) localStorage.setItem('environments', environments)
    if (globalEnvironment) localStorage.setItem('globalEnvironment', globalEnvironment)
    if (activeEnvironmentId) localStorage.setItem('activeEnvironmentId', activeEnvironmentId)
    
    // Restore scripts
    for (const [key, value] of Object.entries(scripts)) {
      localStorage.setItem(key, value)
    }
    
    window.location.reload()
  }
}

const fileInput = ref(null)
const importWorkspaceTarget = ref(null)
const importCollectionTarget = ref(null)

const triggerImport = (ws) => {
  activeMenu.value = null
  importWorkspaceTarget.value = ws
  importCollectionTarget.value = null
  if (fileInput.value) {
    fileInput.value.click()
  }
}

provide('triggerCollectionImport', (collection, workspace) => {
  activeMenu.value = null
  importWorkspaceTarget.value = workspace
  importCollectionTarget.value = collection
  if (fileInput.value) fileInput.value.click()
})

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result)
      if (importCollectionTarget.value && importWorkspaceTarget.value) {
        await workspaceStore.importCollection(importWorkspaceTarget.value.id, data, importCollectionTarget.value.id)
      } else if (importWorkspaceTarget.value) {
        await workspaceStore.importCollection(importWorkspaceTarget.value.id, data)
      } else {
        await workspaceStore.importGlobalCollection(data)
      }
      alert('Collection imported successfully!')
    } catch (err) {
      alert('Error importing collection: ' + err.message)
    } finally {
      event.target.value = '' // reset input
      importWorkspaceTarget.value = null // reset target
      importCollectionTarget.value = null
    }
  }
  reader.readAsText(file)
}

const triggerGlobalImport = () => {
  importWorkspaceTarget.value = null
  importCollectionTarget.value = null
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handleExport = async (ws) => {
  activeMenu.value = null
  try {
    await workspaceStore.exportWorkspace(ws.id, ws.name)
  } catch (err) {
    alert('Error exporting workspace: ' + err.message)
  }
}

onMounted(() => {
  const savedWidth = localStorage.getItem('sidebar-width')
  if (savedWidth) {
    sidebarWidth.value = parseInt(savedWidth)
  }

  authStore.loadAuth()
  if (!authStore.token) {
    router.push('/login')
  } else {
    workspaceStore.loadWorkspaces()
  }
  document.addEventListener('click', () => { activeMenu.value = null })
})

const handleRename = async (ws) => {
  activeMenu.value = null
  const newName = prompt('Rename workspace to:', ws.name)
  if (newName && newName.trim() !== ws.name) {
    await workspaceStore.renameWorkspace(ws.id, newName.trim())
  }
}

const handleDuplicate = async (ws) => {
  activeMenu.value = null
  await workspaceStore.duplicateWorkspace(ws.id)
}

const openTeamModal = (ws) => {
  activeMenu.value = null
  teamWorkspace.value = ws
  inviteEmail.value = ''
  inviteError.value = ''
  showTeamModal.value = true
}

const handleInvite = async () => {
  if (!inviteEmail.value) return
  isInviting.value = true
  inviteError.value = ''
  try {
    await workspaceStore.addWorkspaceMember(teamWorkspace.value.id, inviteEmail.value)
    inviteEmail.value = ''
    teamWorkspace.value = workspaceStore.workspaces.find(w => w.id === teamWorkspace.value.id)
  } catch (err) {
    inviteError.value = err.message || 'Failed to invite user'
  } finally {
    isInviting.value = false
  }
}

const handleRemoveMember = async (userId) => {
  if (confirm('Are you sure you want to remove this member from the workspace?')) {
    try {
      await workspaceStore.removeWorkspaceMember(teamWorkspace.value.id, userId)
      teamWorkspace.value = workspaceStore.workspaces.find(w => w.id === teamWorkspace.value.id)
    } catch (err) {
      alert(err.message || 'Failed to remove user')
    }
  }
}

const handleDelete = async (ws) => {
  activeMenu.value = null
  if (confirm(`Are you sure you want to delete workspace "${ws.name}"? This will delete all collections and requests inside it. This action cannot be undone.`)) {
    await workspaceStore.deleteWorkspace(ws.id)
  }
}

const toggleWorkspace = (ws) => {
  workspaceStore.selectWorkspace(ws)
  if (expandedWorkspaces.value.has(ws.id)) {
    expandedWorkspaces.value.delete(ws.id)
  } else {
    expandedWorkspaces.value.add(ws.id)
  }
}

const createWorkspace = async () => {
  if (!newWorkspaceName.value) return
  await workspaceStore.createWorkspace(newWorkspaceName.value)
  newWorkspaceName.value = ''
}

const createCollection = async (ws) => {
  if (!newCollectionName.value || !ws) return
  await workspaceStore.createCollection(ws.id, newCollectionName.value)
  newCollectionName.value = ''
}

const methodColor = (method) => {
  const colors = { GET: 'text-blue-400', POST: 'text-emerald-400', PUT: 'text-amber-400', PATCH: 'text-amber-400', DELETE: 'text-red-400' }
  return colors[method] || 'text-slate-400'
}
</script>
