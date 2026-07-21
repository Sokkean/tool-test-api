<template>
  <div class="flex-1 flex flex-col min-w-0 bg-slate-950 h-full relative">
    
    <!-- Environment Manager Modal -->
    <div v-if="showEnvModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl h-[80vh] shadow-2xl flex overflow-hidden">
        
        <!-- Sidebar -->
        <div class="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
          <div class="p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
            <h3 class="font-semibold text-slate-200 flex items-center gap-2"><Globe class="w-4 h-4 text-blue-400" /> Environments</h3>
            <button @click="createEnvironment" class="text-slate-400 hover:text-white" title="New Environment"><Plus class="w-4 h-4"/></button>
          </div>
          <div class="flex-1 overflow-auto p-2 space-y-1 custom-scrollbar">
            <div v-for="env in environments" :key="env.id" @click="editingEnvironmentId = env.id" :class="editingEnvironmentId === env.id ? 'bg-blue-500/10 text-blue-400' : 'text-slate-400 hover:bg-slate-800/50'" class="px-3 py-2 text-sm rounded-lg cursor-pointer flex justify-between items-center group transition-colors">
              <input v-if="editingSidebarId === env.id" v-model="env.name" @blur="editingSidebarId = null" @keyup.enter="editingSidebarId = null" @click.stop v-focus class="w-full bg-slate-900 border border-blue-500 rounded px-1 outline-none text-slate-200" />
              <span v-else class="truncate flex-1" @dblclick="env.id !== 'global' ? editingSidebarId = env.id : null" :title="env.id !== 'global' ? 'Double click to rename' : ''">{{ env.name }}</span>
              <button v-if="env.id !== 'global' && editingSidebarId !== env.id" @click.stop="deleteEnvironment(env.id)" class="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 ml-2 shrink-0"><Trash2 class="w-3.5 h-3.5"/></button>
            </div>
          </div>
        </div>

        <!-- Main Area -->
        <div class="flex-1 flex flex-col bg-[#0d1117]">
          <div class="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50 shrink-0 group">
            <div class="flex items-center gap-2 flex-1">
              <input v-model="editingEnvironment.name" :disabled="editingEnvironment.id === 'global'" class="bg-transparent text-lg font-semibold text-slate-200 outline-none border-b border-transparent focus:border-blue-500 px-1 disabled:opacity-80 disabled:cursor-not-allowed hover:bg-slate-800/50 focus:bg-slate-950 rounded transition-colors w-1/2" />
              <Pencil v-if="editingEnvironment.id !== 'global'" class="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
            <button @click="showEnvModal = false" class="text-slate-400 hover:text-white transition-colors">
              <X class="w-5 h-5" />
            </button>
          </div>
          <div class="p-6 flex-1 overflow-auto custom-scrollbar">
            <p class="text-sm text-slate-400 mb-4">Define variables for <strong class="text-slate-300">{{ editingEnvironment.name }}</strong> and use them in your requests with <code class="bg-slate-800 px-1 py-0.5 rounded text-blue-300" v-pre>{{key}}</code> syntax.</p>
            
            <div class="grid grid-cols-[1fr_2fr_auto] gap-3 font-medium text-xs text-slate-500 mb-2 px-1">
              <div>Variable</div>
              <div>Value</div>
              <div></div>
            </div>
            
            <div class="space-y-3">
              <div v-for="(envVar, idx) in editingEnvironment.variables" :key="idx" class="flex gap-3 items-start group">
                <input v-model="envVar.key" placeholder="e.g. url" class="flex-1 bg-slate-950/50 border border-slate-700 text-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors font-mono" />
                <input v-model="envVar.value" placeholder="e.g. https://api.example.com" class="flex-[2] bg-slate-950/50 border border-slate-700 text-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors font-mono" />
                <button @click="editingEnvironment.variables.splice(idx, 1)" class="p-2 text-slate-500 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all border border-transparent hover:border-red-500/30 shrink-0">
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <button @click="editingEnvironment.variables.push({key: '', value: ''})" class="mt-4 text-sm font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 p-2 hover:bg-blue-500/10 rounded-lg transition-colors border border-transparent hover:border-blue-500/30">
              <Plus class="w-4 h-4" /> Add Variable
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Save Request Modal -->
    <div v-if="showSaveModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        <div class="flex justify-between items-center p-4 border-b border-slate-800">
          <h3 class="font-semibold text-lg flex items-center gap-2"><Bookmark class="w-5 h-5 text-indigo-400" /> Save Request</h3>
          <button @click="showSaveModal = false" class="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"><X class="w-5 h-5"/></button>
        </div>
        <div class="p-6">
          <p class="text-sm text-slate-400 mb-2">Saving to collection: <strong class="text-white">{{ workspaceStore.activeCollection?.name }}</strong></p>
          <input v-model="saveRequestName" placeholder="Request Name (e.g. Get User Profile)" class="w-full bg-slate-950/50 border border-slate-700 text-slate-200 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-indigo-500 transition-colors" @keyup.enter="handleSaveRequest" />
        </div>
        <div class="p-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
          <button @click="showSaveModal = false" class="text-slate-400 hover:text-white px-4 py-2 text-sm font-medium transition-colors">Cancel</button>
          <button @click="handleSaveRequest" :disabled="!saveRequestName" class="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20">Save</button>
        </div>
      </div>
    </div>

    <!-- Tabs Bar -->
    <div v-if="workspaceStore.openRequests.length > 0" class="flex items-center overflow-x-auto bg-slate-950/80 border-b border-slate-800 custom-scrollbar shrink-0 pt-2 px-2 gap-1 h-10">
      <div v-for="tab in workspaceStore.openRequests" :key="tab.id"
           @click="workspaceStore.selectRequest(tab)"
           class="group flex items-center gap-2 px-3 py-1.5 min-w-[120px] max-w-[200px] border border-b-0 rounded-t-lg cursor-pointer transition-colors"
           :class="workspaceStore.activeRequestId === tab.id ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-950 border-transparent text-slate-400 hover:bg-slate-900/50 hover:text-slate-300'">
        <span class="text-[10px] font-bold shrink-0" :class="methodColor(tab.method)">{{ tab.method }}</span>
        <span class="truncate text-xs flex-1">{{ tab.name }}</span>
        <button @click.stop="handleCloseTab(tab)" class="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-700 rounded transition-opacity shrink-0">
          <X class="w-3 h-3"/>
        </button>
      </div>
    </div>

    <template v-if="workspaceStore.activeRequest">
      <!-- Top Action Bar -->
      <div class="h-16 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-sm flex items-center px-6 gap-4 shrink-0">
      
      <div class="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700 shadow-sm shrink-0">
        <select v-model="activeEnvironmentId" class="bg-transparent text-slate-300 font-medium px-3 py-1.5 outline-none cursor-pointer text-sm hover:text-white appearance-none max-w-[150px] truncate">
          <option v-for="env in environments" :key="env.id" :value="env.id" class="bg-slate-900 text-slate-200">{{ env.name }}</option>
        </select>
        <div class="w-px h-5 bg-slate-700 mx-1"></div>
        <button @click="showEnvModal = true; editingEnvironmentId = activeEnvironmentId" class="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded transition-colors group" title="Manage Environments">
          <Settings class="w-4 h-4 group-hover:rotate-90 transition-transform" />
        </button>
      </div>
      
      <div class="flex-1 flex items-center bg-slate-950/80 border border-slate-700 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 rounded-lg overflow-hidden transition-all shadow-inner h-10">
        <select v-model="method" class="bg-transparent text-blue-400 font-bold px-4 h-full outline-none cursor-pointer text-sm border-r border-slate-700/50 hover:bg-slate-800/50 appearance-none">
          <option class="bg-slate-900 text-slate-200" value="GET">GET</option>
          <option class="bg-slate-900 text-slate-200" value="POST">POST</option>
          <option class="bg-slate-900 text-slate-200" value="PUT">PUT</option>
          <option class="bg-slate-900 text-slate-200" value="PATCH">PATCH</option>
          <option class="bg-slate-900 text-slate-200" value="DELETE">DELETE</option>
        </select>
        <div class="relative flex-1 h-full min-w-0 font-mono overflow-hidden group">
          <!-- Highlight Overlay -->
          <div class="absolute inset-0 px-4 h-full flex items-center pointer-events-none whitespace-pre text-sm text-slate-200" aria-hidden="true" v-html="highlightedUrl"></div>
          
          <input type="text" ref="urlInputRef" v-model="url" :placeholder="'Enter API URL (e.g., {{url}}/v1/users)'" 
            class="absolute inset-0 w-full h-full bg-transparent px-4 outline-none text-transparent caret-white text-sm placeholder:text-slate-600 font-mono"
            @keyup.enter="sendRequest"
            @scroll="syncUrlScroll"
            spellcheck="false" />
        </div>
      </div>
      <button id="save-btn" @click="handleSaveAction" :disabled="!workspaceStore.activeCollection" 
        class="bg-slate-800 hover:bg-slate-700 text-slate-300 px-6 h-10 rounded-lg font-medium transition-colors border border-slate-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 w-[105px] justify-center">
        <Bookmark class="w-4 h-4" /> Save
      </button>
      <button @click="sendRequest" :disabled="loading" 
        class="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-8 h-10 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shrink-0">
        <Activity class="w-4 h-4" :class="{ 'animate-pulse': loading }" />
        {{ loading ? 'Sending...' : 'Send' }}
      </button>
    </div>

    <!-- Workspace Panels -->
    <div class="flex-1 flex flex-col overflow-hidden p-4 gap-2" @mousemove="handleResize" @mouseup="stopResize" @mouseleave="stopResize">
      
      <!-- Request Panel -->
      <div :style="{ height: requestPanelHeight + '%' }" class="flex flex-col bg-slate-900/40 border border-slate-800/80 rounded-xl overflow-hidden shadow-2xl shadow-black/50 backdrop-blur-sm min-h-[200px]">
        <div class="flex border-b border-slate-800/80 bg-slate-900/80 shrink-0 justify-between">
          <div class="flex">
            <button @click="activeTab = 'auth'" class="px-6 py-3 text-sm font-medium transition-colors border-b-2 outline-none focus-visible:bg-slate-800/50" :class="activeTab === 'auth' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'">Auth</button>
            <button @click="activeTab = 'query'" class="px-6 py-3 text-sm font-medium transition-colors border-b-2 outline-none focus-visible:bg-slate-800/50" :class="activeTab === 'query' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'">Query Params</button>
            <button @click="activeTab = 'headers'" class="px-6 py-3 text-sm font-medium transition-colors border-b-2 outline-none focus-visible:bg-slate-800/50" :class="activeTab === 'headers' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'">Headers</button>
            <button @click="activeTab = 'body'" class="px-6 py-3 text-sm font-medium transition-colors border-b-2 outline-none focus-visible:bg-slate-800/50" :class="activeTab === 'body' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'">Body</button>
            <button @click="activeTab = 'pre-request'" class="px-6 py-3 text-sm font-medium transition-colors border-b-2 outline-none focus-visible:bg-slate-800/50" :class="activeTab === 'pre-request' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'">Pre-request Script</button>
            <button @click="activeTab = 'tests'" class="px-6 py-3 text-sm font-medium transition-colors border-b-2 outline-none focus-visible:bg-slate-800/50" :class="activeTab === 'tests' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'">Tests</button>
          </div>
          <button @click="formatActiveTabJson" class="px-4 text-xs font-medium text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-1 group">
            <AlignLeft class="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> Format JSON
          </button>
        </div>
        
        <div class="flex-1 bg-slate-950 overflow-hidden relative">
          <div v-show="activeTab === 'auth'" class="absolute inset-0 p-6 overflow-auto custom-scrollbar bg-slate-950 flex flex-col gap-6">
            <div class="flex items-center gap-4">
              <label class="text-sm font-medium text-slate-300 w-24">Type</label>
              <select v-model="authType" class="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors w-64 outline-none appearance-none cursor-pointer">
                <option value="none">No Auth</option>
                <option value="bearer">Bearer Token</option>
                <option value="basic">Basic Auth</option>
              </select>
            </div>
            
            <div v-if="authType === 'bearer'" class="flex items-start gap-4">
              <label class="text-sm font-medium text-slate-300 w-24 mt-2">Token</label>
              <div class="flex-1 max-w-xl">
                <input v-model="authBearerToken" placeholder="e.g. {{token}}" class="w-full bg-slate-900/50 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors font-mono" />
                <p class="text-xs text-slate-500 mt-2">The Token will be automatically injected into the <code class="bg-slate-800 px-1 rounded text-slate-300">Authorization: Bearer &lt;token&gt;</code> header.</p>
              </div>
            </div>
            
            <div v-if="authType === 'basic'" class="flex items-start gap-4">
              <label class="text-sm font-medium text-slate-300 w-24 mt-2">Credentials</label>
              <div class="flex-1 max-w-xl space-y-3">
                <input v-model="authBasicUsername" placeholder="Username" class="w-full bg-slate-900/50 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors font-mono" />
                <input v-model="authBasicPassword" type="password" placeholder="Password" class="w-full bg-slate-900/50 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors font-mono" />
                <p class="text-xs text-slate-500 mt-2">The credentials will be base64 encoded and injected into the <code class="bg-slate-800 px-1 rounded text-slate-300">Authorization: Basic &lt;credentials&gt;</code> header.</p>
              </div>
            </div>
            
            <div v-if="authType === 'none'" class="flex items-center justify-center h-full text-slate-500 text-sm">
              This request does not use any authorization.
            </div>
          </div>
          <KeyValueEditor v-show="activeTab === 'query'" v-model="queryParams" title="Query Params" placeholder="[\n  { &quot;key&quot;: &quot;search&quot;, &quot;value&quot;: &quot;test&quot; }\n]" />
          <KeyValueEditor v-show="activeTab === 'headers'" v-model="headers" title="Headers" placeholder="[\n  { &quot;key&quot;: &quot;Authorization&quot;, &quot;value&quot;: &quot;Bearer {{token}}&quot; }\n]" />
          <CodeEditor v-show="activeTab === 'body'" v-model="body" placeholder='{
  "key": "value"
}' />
          <CodeEditor v-show="activeTab === 'pre-request'" v-model="preRequestScript" placeholder="// Write JavaScript here to run before the request is sent&#10;// Example: env.set('timestamp', Date.now())" />
          <CodeEditor v-show="activeTab === 'tests'" v-model="testScript" placeholder="// Write JavaScript here to run after the response is received&#10;// Example: env.set('token', responseData.token);" />
        </div>
      </div>

      <!-- Resizer Splitter -->
      <div class="h-4 flex items-center justify-center cursor-row-resize shrink-0 group select-none" @mousedown="startResize">
        <div class="h-1 w-12 rounded-full bg-slate-800 group-hover:bg-blue-500/80 transition-colors"></div>
      </div>

      <!-- Response Panel -->
      <div class="flex-1 flex flex-col bg-slate-900/40 border border-slate-800/80 rounded-xl overflow-hidden shadow-2xl shadow-black/50 backdrop-blur-sm min-h-[200px]">
        <div class="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-900/80 shrink-0 min-h-[49px]">
          <div class="flex items-center gap-4">
            <span class="text-sm font-medium text-slate-300 flex items-center gap-2"><Server class="w-4 h-4"/> Response</span>
            <div v-if="response" class="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800">
              <button @click="responseTab = 'pretty'" :class="responseTab === 'pretty' ? 'bg-slate-800 text-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-300'" class="px-3 py-1 text-[11px] font-medium rounded-md transition-all outline-none">Pretty</button>
              <button @click="responseTab = 'preview'" :class="responseTab === 'preview' ? 'bg-slate-800 text-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-300'" class="px-3 py-1 text-[11px] font-medium rounded-md transition-all outline-none">Preview</button>
            </div>
          </div>
          <div v-if="response" class="flex items-center gap-3">
            <span :class="statusClass" class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full" :class="statusDotClass"></span>{{ response.status }} {{ response.statusText }}</span>
            <span class="text-slate-400 text-xs flex items-center gap-1 font-mono bg-slate-950/50 px-2 py-1.5 rounded-md border border-slate-800"><Clock class="w-3 h-3"/> {{ response.timeMs }} ms</span>
          </div>
        </div>
        <div class="flex-1 overflow-auto bg-slate-950 relative custom-scrollbar">
          <div v-if="error" class="m-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm font-mono break-all">
            {{ error }}
          </div>
          <template v-else-if="response">
            <div v-show="responseTab === 'pretty'" class="p-4 w-full h-full overflow-auto custom-scrollbar">
              <JsonViewer :data="response.data" />
            </div>
            <iframe v-if="responseTab === 'preview'" class="w-full h-full bg-white border-0" :srcdoc="rawResponseData"></iframe>
          </template>
          <div v-else class="absolute inset-0 flex flex-col items-center justify-center text-slate-600 gap-3">
            <Activity class="w-12 h-12 opacity-20" />
            <p class="text-sm">Enter a URL and click Send to see the response</p>
          </div>
        </div>
      </div>
      
    </div>
    </template>
    
    <!-- Empty State -->
    <div v-else class="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-950">
      <Activity class="w-16 h-16 opacity-20 mb-4" />
      <h2 class="text-xl font-medium text-slate-300 mb-2">No Request Selected</h2>
      <p class="text-sm">Select a request from the sidebar or click + to create one.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useAuthStore } from '../features/auth/stores/auth'
import { useWorkspaceStore } from '../stores/workspace'
import { useRouter } from 'vue-router'
import { Search, Folder, Globe, Database, Moon, Sun, Monitor, Plus, X, AlignLeft, Send, Activity, Server, Clock, Bookmark, Trash2, Settings, Edit2, Pencil } from 'lucide-vue-next'
import CodeEditor from '../components/CodeEditor.vue'
import JsonViewer from '../components/JsonViewer.vue'
import KeyValueEditor from '../components/KeyValueEditor.vue'

const methodColor = (method) => {
  const colors = { GET: 'text-blue-400', POST: 'text-emerald-400', PUT: 'text-amber-400', PATCH: 'text-amber-400', DELETE: 'text-red-400' }
  return colors[method] || 'text-slate-400'
}

const authStore = useAuthStore()
const workspaceStore = useWorkspaceStore()
const config = useRuntimeConfig()

const method = ref('GET')
const url = ref('{{url}}/todos/1')
const urlInputRef = ref(null)

const highlightedUrl = computed(() => {
  if (!url.value) return ''
  const escaped = url.value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  return escaped.replace(/(\{\{[^}]+\}\})/g, '<span class="text-amber-400 font-semibold">$1</span>')
})

const syncUrlScroll = (e) => {
  const overlay = e.target.previousElementSibling
  if (overlay) overlay.scrollLeft = e.target.scrollLeft
}

const headers = ref('{\n  "Content-Type": "application/json"\n}')
const queryParams = ref('{}')
const body = ref('')
const preRequestScript = ref('')
const testScript = ref('')
const activeTab = ref('query')
const authType = ref('none')
const authBearerToken = ref('')
const authBasicUsername = ref('')
const authBasicPassword = ref('')

const stripJsonComments = (str) => {
  return str.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m);
}

const safeJsonParse = (str) => {
  return JSON.parse(stripJsonComments(str))
}

const formatActiveTabJson = () => {
  try {
    if (activeTab.value === 'query' && queryParams.value.trim()) {
      queryParams.value = JSON.stringify(safeJsonParse(queryParams.value), null, 2)
    } else if (activeTab.value === 'headers' && headers.value.trim()) {
      headers.value = JSON.stringify(safeJsonParse(headers.value), null, 2)
    } else if (activeTab.value === 'body' && body.value.trim()) {
      body.value = JSON.stringify(safeJsonParse(body.value), null, 2)
    }
    error.value = null
  } catch (e) {
    error.value = `Invalid JSON in ${activeTab.value} tab. Cannot format.`
  }
}

const loading = ref(false)
const error = ref(null)
const response = ref(null)
const responseTab = ref('pretty')
let isSwitchingTab = false

// Environment Manager state
const showEnvModal = ref(false)
const environments = ref([{ id: 'global', name: 'Globals', variables: [] }])
const activeEnvironmentId = ref('global')
const editingEnvironmentId = ref('global')
const editingSidebarId = ref(null)

const activeEnvironment = computed(() => environments.value.find(e => e.id === activeEnvironmentId.value) || environments.value[0])
const editingEnvironment = computed(() => environments.value.find(e => e.id === editingEnvironmentId.value) || environments.value[0])

const createEnvironment = () => {
  const newId = generateId()
  environments.value.push({ id: newId, name: 'New Environment', variables: [] })
  editingEnvironmentId.value = newId
}

const deleteEnvironment = (id) => {
  if (environments.value.length <= 1) return
  environments.value = environments.value.filter(e => e.id !== id)
  if (editingEnvironmentId.value === id) editingEnvironmentId.value = environments.value[0].id
  if (activeEnvironmentId.value === id) activeEnvironmentId.value = environments.value[0].id
}

const getEnvValue = (key) => {
  const v = activeEnvironment.value.variables.find(e => e.key === key)
  if (v) return v.value
  
  if (activeEnvironment.value.id !== 'global') {
    const globals = environments.value.find(e => e.id === 'global')
    if (globals) {
      const gv = globals.variables.find(e => e.key === key)
      if (gv) return gv.value
    }
  }
  return undefined
}

const setEnvValue = (key, value) => {
  const targetEnv = activeEnvironment.value
  const idx = targetEnv.variables.findIndex(e => e.key === key)
  if (idx !== -1) {
    targetEnv.variables[idx].value = String(value)
  } else {
    targetEnv.variables.push({ key, value: String(value) })
  }
}

// Save Request state
const showSaveModal = ref(false)
const saveRequestName = ref('')

// Resize state
const requestPanelHeight = ref(50)
let isResizing = false

const startResize = () => {
  isResizing = true
  document.body.style.cursor = 'row-resize'
  document.body.style.userSelect = 'none'
}
const handleResize = (e) => {
  if (!isResizing) return
  const container = e.currentTarget
  const rect = container.getBoundingClientRect()
  const offsetY = e.clientY - rect.top
  let percentage = (offsetY / rect.height) * 100
  if (percentage < 20) percentage = 20
  if (percentage > 80) percentage = 80
  requestPanelHeight.value = percentage
}
const stopResize = () => {
  isResizing = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}


watch(() => workspaceStore.activeRequestId, (newId, oldId) => {
  if (oldId && !isSwitchingTab) {
    workspaceStore.updateRequestData(oldId, {
      method: method.value,
      url: url.value,
      headers: headers.value,
      queryParams: queryParams.value,
      body: body.value,
      authType: authType.value,
      authBearerToken: authBearerToken.value,
      authBasicUsername: authBasicUsername.value,
      authBasicPassword: authBasicPassword.value
    })
  }

  const newReq = workspaceStore.activeRequest
  if (newReq) {
    isSwitchingTab = true
    method.value = newReq.method || 'GET'
    url.value = newReq.url || ''
    headers.value = newReq.headers || '{\n  "Content-Type": "application/json"\n}'
    queryParams.value = newReq.queryParams || '{}'
    body.value = newReq.body || ''
    
    authType.value = newReq.authType || 'none'
    authBearerToken.value = newReq.authBearerToken || ''
    authBasicUsername.value = newReq.authBasicUsername || ''
    authBasicPassword.value = newReq.authBasicPassword || ''
    
    preRequestScript.value = localStorage.getItem(`req-${newId}-pre`) || ''
    testScript.value = localStorage.getItem(`req-${newId}-test`) || ''
    
    response.value = newReq.response || null
    error.value = newReq.error || null

    setTimeout(() => { isSwitchingTab = false }, 0)
  } else {
    // Clear state if no active request
    preRequestScript.value = ''
    testScript.value = ''
    authType.value = 'none'
    authBearerToken.value = ''
    authBasicUsername.value = ''
    authBasicPassword.value = ''
    response.value = null
    error.value = null
  }
})

watch(preRequestScript, (val) => {
  if (workspaceStore.activeRequestId && !isSwitchingTab) {
    localStorage.setItem(`req-${workspaceStore.activeRequestId}-pre`, val)
  }
})
watch(testScript, (val) => {
  if (workspaceStore.activeRequestId && !isSwitchingTab) {
    localStorage.setItem(`req-${workspaceStore.activeRequestId}-test`, val)
  }
})

let isSyncingUrlParams = false
const generateId = () => Math.random().toString(36).substring(2, 9)

watch(url, (newUrl) => {
  if (isSyncingUrlParams || isSwitchingTab) return
  
  const parts = newUrl.split('?')
  const urlParamsList = []
  if (parts.length > 1) {
    const searchStr = parts.slice(1).join('?')
    const pairs = searchStr.split('&')
    pairs.forEach(p => {
      if (!p) return
      const [k, ...vParts] = p.split('=')
      urlParamsList.push({ key: k, value: vParts.join('=') })
    })
  }
  
  let currentParams = []
  try {
    const parsed = JSON.parse(queryParams.value)
    if (Array.isArray(parsed)) currentParams = parsed
    else if (typeof parsed === 'object' && parsed !== null) {
      currentParams = Object.entries(parsed).map(([k, v]) => ({ _id: generateId(), key: k, value: String(v), enabled: true, description: '' }))
    }
  } catch(e) {}
  
  const newParams = []
  urlParamsList.forEach(up => {
    let existingIdx = currentParams.findIndex(cp => cp.key === up.key && cp.enabled)
    if (existingIdx === -1) {
      existingIdx = currentParams.findIndex(cp => cp.key === up.key)
    }
    if (existingIdx >= 0) {
      const cp = currentParams.splice(existingIdx, 1)[0]
      newParams.push({ ...cp, value: up.value, enabled: true })
    } else {
      newParams.push({ _id: generateId(), key: up.key, value: up.value, description: '', enabled: true })
    }
  })
  
  currentParams.forEach(cp => {
    if (!cp.enabled) newParams.push(cp)
  })
  
  isSyncingUrlParams = true
  queryParams.value = JSON.stringify(newParams, null, 2)
  setTimeout(() => isSyncingUrlParams = false, 0)
})

watch(queryParams, (newQp) => {
  if (isSyncingUrlParams || isSwitchingTab) return
  
  let parsed = []
  try {
    parsed = JSON.parse(newQp)
    if (!Array.isArray(parsed) && typeof parsed === 'object' && parsed !== null) {
      parsed = Object.entries(parsed).map(([k, v]) => ({ key: k, value: String(v), enabled: true, description: '' }))
    }
  } catch(e) { return }
  
  let searchStr = ''
  if (Array.isArray(parsed)) {
    const qsParts = []
    parsed.forEach(p => {
      if (p.enabled !== false && p.key) {
        qsParts.push(p.value ? `${p.key}=${p.value}` : p.key)
      }
    })
    searchStr = qsParts.join('&')
  }
  
  const parts = url.value.split('?')
  const basePath = parts[0]
  const newUrl = searchStr ? `${basePath}?${searchStr}` : basePath
  
  if (url.value !== newUrl) {
    isSyncingUrlParams = true
    url.value = newUrl
    setTimeout(() => isSyncingUrlParams = false, 0)
  }
}, { deep: true })

watch([method, url, headers, queryParams, body, authType, authBearerToken, authBasicUsername, authBasicPassword], () => {
  if (workspaceStore.activeRequestId && !isSwitchingTab) {
    workspaceStore.updateRequestData(workspaceStore.activeRequestId, {
      method: method.value,
      url: url.value,
      headers: headers.value,
      queryParams: queryParams.value,
      body: body.value,
      authType: authType.value,
      authBearerToken: authBearerToken.value,
      authBasicUsername: authBasicUsername.value,
      authBasicPassword: authBasicPassword.value
    })
  }
}, { deep: true })

const handleGlobalSave = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault()
    if (workspaceStore.activeRequestId) {
      handleSaveAction()
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleGlobalSave)
  const saved = localStorage.getItem('lastWorkspace')
    try {
      const stored = JSON.parse(saved)
      if (stored && stored.id) {
        workspaceStore.openWorkspace(stored.id)
      }
    } catch(e){}
  
  const savedEnvs = localStorage.getItem('environments')
  if (savedEnvs) {
    try {
      environments.value = JSON.parse(savedEnvs)
    } catch(e){}
  } else {
    const savedGlobal = localStorage.getItem('globalEnvironment')
    if (savedGlobal) {
      try {
        environments.value = [{ id: 'global', name: 'Globals', variables: JSON.parse(savedGlobal) }]
      } catch(e){}
    }
  }
  
  const savedActiveEnv = localStorage.getItem('activeEnvironmentId')
  if (savedActiveEnv) activeEnvironmentId.value = savedActiveEnv
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalSave)
})

watch(environments, (newVal) => {
  localStorage.setItem('environments', JSON.stringify(newVal))
}, { deep: true })

watch(activeEnvironmentId, (newVal) => {
  localStorage.setItem('activeEnvironmentId', newVal)
})

const interpolate = (str) => {
  if (!str) return str
  return str.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const v = getEnvValue(key.trim())
    return v !== undefined && v !== '' ? v : match
  })
}

const fetchApi = async (endpoint, options = {}) => {
  const res = await fetch(`${config.public.apiBaseUrl}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${authStore.token}`
    }
  })
  if (res.status === 401) { authStore.logout(); throw new Error('Unauthorized') }
  return res.json()
}

const formattedResponse = computed(() => {
  if (!response.value?.data) return ''
  try { return typeof response.value.data === 'object' ? JSON.stringify(response.value.data, null, 2) : String(response.value.data) } 
  catch (e) { return String(response.value.data) }
})

const rawResponseData = computed(() => {
  if (!response.value?.data) return ''
  return typeof response.value.data === 'object' ? JSON.stringify(response.value.data) : String(response.value.data)
})

const statusClass = computed(() => {
  if (!response.value) return ''
  const status = response.value.status
  if (status >= 200 && status < 300) return 'text-xs font-mono px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
  if (status >= 400) return 'text-xs font-mono px-2 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/20'
  return 'text-xs font-mono px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20'
})

const statusDotClass = computed(() => {
  if (!response.value) return ''
  const status = response.value.status
  if (status >= 200 && status < 300) return 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
  if (status >= 400) return 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]'
  return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
})

const sendRequest = async () => {
  if (!url.value) return
  loading.value = true
  error.value = null
  response.value = null
  
  // Sandbox environment object for scripts
  const envObj = {
    set: setEnvValue,
    get: getEnvValue
  }

  // Execute pre-request script
  if (preRequestScript.value && preRequestScript.value.trim()) {
    try {
      const preFn = new Function('env', preRequestScript.value)
      preFn(envObj)
    } catch (err) {
      error.value = "Pre-request Script Error: " + err.message
      loading.value = false
      return
    }
  }

  // Interpolate environment variables

  const finalUrlRaw = interpolate(url.value)
  const headersRaw = interpolate(headers.value)
  const queryParamsRaw = interpolate(queryParams.value)
  const bodyRaw = interpolate(body.value)
  
  let parsedHeaders, parsedQuery, parsedBody
  try {
    if (headersRaw.trim()) parsedHeaders = safeJsonParse(headersRaw)
    if (queryParamsRaw.trim()) parsedQuery = safeJsonParse(queryParamsRaw)
    if (bodyRaw.trim()) parsedBody = safeJsonParse(bodyRaw)
  } catch (e) {
    error.value = "Invalid JSON after variable interpolation. Please check your variables and syntax."
    loading.value = false
    return
  }

  let finalUrl = finalUrlRaw
  if (parsedQuery) {
    const searchParams = new URLSearchParams()
    if (Array.isArray(parsedQuery)) {
      parsedQuery.forEach(q => { if (q.enabled !== false && q.key) searchParams.append(q.key, q.value) })
    } else if (typeof parsedQuery === 'object' && parsedQuery !== null) {
      for (const key in parsedQuery) searchParams.append(key, parsedQuery[key])
    }
    const qs = searchParams.toString()
    if (qs) finalUrl += (finalUrl.includes('?') ? '&' : '?') + qs
  }

  let finalHeaders = parsedHeaders
  if (Array.isArray(parsedHeaders)) {
    finalHeaders = {}
    parsedHeaders.forEach(h => { if (h.enabled !== false && h.key) finalHeaders[h.key] = h.value })
  }
  if (!finalHeaders) finalHeaders = {}

  // Inject Authorization Header
  if (authType.value === 'bearer' && authBearerToken.value) {
    const interpolatedToken = interpolate(authBearerToken.value)
    finalHeaders['Authorization'] = `Bearer ${interpolatedToken}`
  } else if (authType.value === 'basic' && (authBasicUsername.value || authBasicPassword.value)) {
    const interpolatedUser = interpolate(authBasicUsername.value)
    const interpolatedPass = interpolate(authBasicPassword.value)
    const base64 = btoa(`${interpolatedUser}:${interpolatedPass}`)
    finalHeaders['Authorization'] = `Basic ${base64}`
  }

  try {
    response.value = await fetchApi('/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: method.value,
        url: finalUrl,
        headers: finalHeaders,
        body: parsedBody,
      })
    })
    
    // Execute test script
    if (testScript.value && testScript.value.trim() && response.value && response.value.data) {
      try {
        const responseData = response.value.data;
        const responseBody = typeof responseData === 'object' ? JSON.stringify(responseData) : String(responseData);
        const testFn = new Function('env', 'responseData', 'responseBody', testScript.value)
        testFn(envObj, responseData, responseBody)
      } catch (err) {
        error.value = "Test Script Error: " + err.message
      }
    }
    
    if (workspaceStore.activeRequestId) {
      workspaceStore.updateRequestData(workspaceStore.activeRequestId, {
        response: response.value,
        error: error.value
      })
    }
  } catch (e) {
    error.value = e.message || "Failed to connect to backend proxy"
    if (workspaceStore.activeRequestId) {
      workspaceStore.updateRequestData(workspaceStore.activeRequestId, {
        response: null,
        error: error.value
      })
    }
  } finally {
    loading.value = false
  }
}

const handleSaveRequest = async () => {
  if (!saveRequestName.value || !workspaceStore.activeCollection) return
  
  if (workspaceStore.activeRequest && workspaceStore.activeRequest.id && (workspaceStore.activeRequest._isNew || workspaceStore.activeRequest.name === 'Untitled Request')) {
    await workspaceStore.saveRequestChanges(workspaceStore.activeRequest.id, {
      name: saveRequestName.value,
      method: method.value,
      url: url.value,
      headers: headers.value,
      queryParams: queryParams.value,
      body: body.value
    })
  } else {
    await workspaceStore.saveRequest(workspaceStore.activeCollection.id, {
      name: saveRequestName.value,
      method: method.value,
      url: url.value,
      headers: headers.value,
      queryParams: queryParams.value,
      body: body.value
    })
  }
  
  showSaveModal.value = false
  saveRequestName.value = ''
}

const handleSaveAction = async () => {
  if (workspaceStore.activeRequest && workspaceStore.activeRequest.id) {
    if (workspaceStore.activeRequest._isNew || workspaceStore.activeRequest.name === 'Untitled Request') {
      showSaveModal.value = true
      return
    }

    await workspaceStore.saveRequestChanges(workspaceStore.activeRequest.id, {
      method: method.value,
      url: url.value,
      headers: headers.value,
      queryParams: queryParams.value,
      body: body.value
    })
    const btn = document.getElementById('save-btn')
    if (btn) {
      const originalText = btn.innerHTML
      btn.innerHTML = `<svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Saved`
      setTimeout(() => {
        btn.innerHTML = originalText
      }, 2000)
    }
  } else {
    showSaveModal.value = true
  }
}

const handleCloseTab = async (tab) => {
  if (workspaceStore.isRequestModified(tab.id)) {
    if (!confirm(`You have unsaved changes in "${tab.name}". Are you sure you want to close it and discard your changes?`)) {
      return
    }
  }
  
  if (tab._isNew) {
    // If it's a new request that was never saved, delete it to prevent polluting the workspace
    await workspaceStore.deleteRequest(tab.id)
  } else {
    workspaceStore.closeRequest(tab.id)
  }
}
</script>
