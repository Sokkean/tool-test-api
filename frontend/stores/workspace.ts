import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from '../features/auth/stores/auth'
import { useRuntimeConfig } from '#app'

export const useWorkspaceStore = defineStore('workspace', () => {
  const workspaces = ref([])
  const activeWorkspace = ref(null)
  const activeCollection = ref(null)
  const openRequests = ref([])
  const activeRequestId = ref(null)
  const searchQuery = ref('')

  const activeRequest = computed(() => openRequests.value.find(r => r.id === activeRequestId.value) || null)

  const loadWorkspaces = async () => {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    try {
      let url = `${config.public.apiBaseUrl}/workspaces`
      if (searchQuery.value) {
        url += `?search=${encodeURIComponent(searchQuery.value)}`
      }
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${authStore.token}` }
      })
      if (res.status === 401) {
        authStore.logout()
        return
      }
      if (!res.ok) throw new Error('Failed to load')
      const rawWorkspaces = await res.json()
      
      // Build tree for collections
      for (const ws of rawWorkspaces) {
        if (!ws.collections) continue
        const map = new Map()
        ws.collections.forEach(c => {
          c.children = []
          if (c.requests) {
            c.requests = c.requests.map(req => {
              if (req.body) {
                try {
                  const p = JSON.parse(req.body)
                  if (p && p._bodyType) {
                    req.bodyType = p._bodyType
                    req.body = p.raw || ''
                    req.bodyForm = p.formdata || '[]'
                    req.bodyUrlencoded = p.urlencoded || '[]'
                  } else {
                    req.bodyType = 'raw'
                  }
                } catch(e) {
                  req.bodyType = 'raw'
                }
              } else {
                req.bodyType = 'none'
              }
              return req
            })
          }
          map.set(c.id, c)
        })
        const roots = []
        ws.collections.forEach(c => {
          if (c.parentId) {
            const parent = map.get(c.parentId)
            if (parent) parent.children.push(c)
            else roots.push(c)
          } else {
            roots.push(c)
          }
        })
        ws.treeCollections = roots
      }
      
      workspaces.value = rawWorkspaces
      
      if (activeWorkspace.value) {
        activeWorkspace.value = workspaces.value.find(w => w.id === activeWorkspace.value.id) || workspaces.value[0] || null
      } else if (workspaces.value.length > 0) {
        activeWorkspace.value = workspaces.value[0]
      }
      
      if (activeCollection.value && activeWorkspace.value) {
        activeCollection.value = activeWorkspace.value.collections?.find(c => c.id === activeCollection.value.id) || null
      }
    } catch (e) {
      console.error(e)
    }
  }

  const filteredWorkspaces = computed(() => {
    if (!searchQuery.value) return workspaces.value
    const q = searchQuery.value.toLowerCase()
    const copy = JSON.parse(JSON.stringify(workspaces.value))
    
    return copy.filter(ws => {
      let hasMatch = false
      if (ws.name.toLowerCase().includes(q)) hasMatch = true
      
      const filterTree = (collections) => {
        return collections.filter(c => {
          let keep = false
          if (c.name.toLowerCase().includes(q)) keep = true
          
          if (c.requests) {
            c.requests = c.requests.filter(r => 
              r.name.toLowerCase().includes(q) || r.url.toLowerCase().includes(q)
            )
            if (c.requests.length > 0) keep = true
          }
          
          if (c.children) {
            c.children = filterTree(c.children)
            if (c.children.length > 0) keep = true
          }
          
          return keep
        })
      }
      
      ws.treeCollections = filterTree(ws.treeCollections || [])
      if (ws.treeCollections.length > 0) hasMatch = true
      
      return hasMatch
    })
  })

  const createWorkspace = async (name) => {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    const res = await fetch(`${config.public.apiBaseUrl}/workspaces`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${authStore.token}` },
      body: JSON.stringify({ name })
    })
    if (res.status === 401) {
      authStore.logout()
      return
    }
    await loadWorkspaces()
  }

  const renameWorkspace = async (id, name) => {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    await fetch(`${config.public.apiBaseUrl}/workspaces/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${authStore.token}` },
      body: JSON.stringify({ name })
    })
    await loadWorkspaces()
  }

  const deleteWorkspace = async (id) => {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    await fetch(`${config.public.apiBaseUrl}/workspaces/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (activeWorkspace.value?.id === id) {
      activeWorkspace.value = null
      activeCollection.value = null
      openRequests.value = []
      activeRequestId.value = null
    }
    await loadWorkspaces()
  }

  const duplicateWorkspace = async (id) => {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    await fetch(`${config.public.apiBaseUrl}/workspaces/${id}/duplicate`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    await loadWorkspaces()
  }

  const createCollection = async (workspaceId, name, parentId = null) => {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    await fetch(`${config.public.apiBaseUrl}/workspaces/${workspaceId}/collections`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${authStore.token}` },
      body: JSON.stringify({ name, parentId })
    })
    await loadWorkspaces()
  }

  const renameCollection = async (id, name) => {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    await fetch(`${config.public.apiBaseUrl}/workspaces/collections/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${authStore.token}` },
      body: JSON.stringify({ name })
    })
    await loadWorkspaces()
  }

  const deleteCollection = async (id) => {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    await fetch(`${config.public.apiBaseUrl}/workspaces/collections/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (activeCollection.value?.id === id) {
      activeCollection.value = null
      openRequests.value = []
      activeRequestId.value = null
    }
    await loadWorkspaces()
  }

  const duplicateCollection = async (id) => {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    await fetch(`${config.public.apiBaseUrl}/workspaces/collections/${id}/duplicate`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    await loadWorkspaces()
  }

  const addWorkspaceMember = async (workspaceId, email) => {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    const res = await fetch(`${config.public.apiBaseUrl}/workspaces/${workspaceId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authStore.token}` },
      body: JSON.stringify({ email })
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.message || 'Failed to add member')
    }
    await loadWorkspaces()
  }

  const removeWorkspaceMember = async (workspaceId, userId) => {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    const res = await fetch(`${config.public.apiBaseUrl}/workspaces/${workspaceId}/members/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (!res.ok) throw new Error('Failed to remove member')
    await loadWorkspaces()
  }

  const saveRequest = async (collectionId, requestData, tempId = null) => {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    const payload = { ...requestData }
    if (payload.bodyType) {
      payload.body = JSON.stringify({
        _bodyType: payload.bodyType,
        raw: payload.body,
        formdata: payload.bodyForm,
        urlencoded: payload.bodyUrlencoded
      })
      delete payload.bodyType
      delete payload.bodyForm
      delete payload.bodyUrlencoded
    }

    const res = await fetch(`${config.public.apiBaseUrl}/workspaces/collections/${collectionId}/requests`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${authStore.token}` },
      body: JSON.stringify(payload)
    })
    const rawReq = await res.json()
    
    // Deserialize immediately for the open tab
    if (rawReq.body) {
      try {
        const p = JSON.parse(rawReq.body)
        if (p && p._bodyType) {
          rawReq.bodyType = p._bodyType
          rawReq.body = p.raw || ''
          rawReq.bodyForm = p.formdata || '[]'
          rawReq.bodyUrlencoded = p.urlencoded || '[]'
        } else {
          rawReq.bodyType = 'raw'
        }
      } catch(e) {
        rawReq.bodyType = 'raw'
      }
    } else {
      rawReq.bodyType = 'none'
    }
    const savedReq = rawReq
    
    if (tempId) {
      const idx = openRequests.value.findIndex(r => r.id === tempId)
      if (idx !== -1) {
        openRequests.value[idx] = savedReq
        activeRequestId.value = savedReq.id
      }
    }
    
    // Refresh the active collection to fetch the new request
    await loadWorkspaces()
    if (activeCollection.value) {
      await selectCollection(activeCollection.value)
    }
  }

  const saveRequestChanges = async (id, data) => {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    
    const payload = { ...data }
    if (payload.bodyType) {
      payload.body = JSON.stringify({
        _bodyType: payload.bodyType,
        raw: payload.body,
        formdata: payload.bodyForm,
        urlencoded: payload.bodyUrlencoded
      })
      delete payload.bodyType
      delete payload.bodyForm
      delete payload.bodyUrlencoded
    }
    
    await fetch(`${config.public.apiBaseUrl}/workspaces/requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${authStore.token}` },
      body: JSON.stringify(payload)
    })
    
    // Clear the isNew flag upon explicit save
    const req = openRequests.value.find(r => r.id === id)
    if (req) {
      req._isNew = false
      Object.assign(req, data)
    }
    
    await loadWorkspaces()
    if (activeCollection.value) {
      await selectCollection(activeCollection.value)
    }
  }

  const renameRequest = async (id, name) => {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    await fetch(`${config.public.apiBaseUrl}/workspaces/requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${authStore.token}` },
      body: JSON.stringify({ name })
    })
    // If it's currently selected, update its name locally
    if (activeRequest.value?.id === id) {
      activeRequest.value.name = name
    }
    await selectCollection(activeCollection.value)
  }

  const deleteRequest = async (id) => {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    await fetch(`${config.public.apiBaseUrl}/workspaces/requests/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    closeRequest(id)
    await selectCollection(activeCollection.value)
  }

  const duplicateRequest = async (id) => {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    await fetch(`${config.public.apiBaseUrl}/workspaces/requests/${id}/duplicate`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (activeCollection.value) {
      await selectCollection(activeCollection.value)
    }
  }

  const loadCollectionRequests = async (collectionId) => {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    const res = await fetch(`${config.public.apiBaseUrl}/workspaces/collections/${collectionId}/requests`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (res.ok) {
      const data = await res.json()
      return data.map(req => {
        if (req.body) {
          try {
            const p = JSON.parse(req.body)
            if (p && p._bodyType) {
              req.bodyType = p._bodyType
              req.body = p.raw || ''
              req.bodyForm = p.formdata || '[]'
              req.bodyUrlencoded = p.urlencoded || '[]'
            } else {
              req.bodyType = 'raw'
            }
          } catch(e) {
            req.bodyType = 'raw'
          }
        } else {
          req.bodyType = 'none'
        }
        return req
      })
    }
    return []
  }

  const selectWorkspace = (ws) => {
    activeWorkspace.value = ws
    activeCollection.value = null
  }

  const selectCollection = async (col) => {
    if (!col) return
    activeCollection.value = col
    const requests = await loadCollectionRequests(col.id)
    activeCollection.value.requests = requests
  }

  const selectRequest = (req) => {
    const existing = openRequests.value.find(r => r.id === req.id)
    if (!existing) {
      openRequests.value.push(JSON.parse(JSON.stringify(req)))
    }
    activeRequestId.value = req.id
  }

  const isRequestModified = (id) => {
    const openReq = openRequests.value.find(r => r.id === id)
    if (!openReq) return false
    if (openReq._isNew) return true
    
    let originalReq = null
    for (const ws of workspaces.value) {
      for (const col of ws.collections || []) {
        if (col.id === openReq.collectionId) {
          originalReq = col.requests?.find(r => r.id === id)
          if (originalReq) break
        }
      }
      if (originalReq) break
    }
    
    if (!originalReq) return false
    
    const fields = ['name', 'method', 'url', 'headers', 'queryParams', 'body', 'bodyType', 'bodyForm', 'bodyUrlencoded', 'preRequestScript', 'testScript']
    for (const field of fields) {
      let openVal = openReq[field] || ''
      let origVal = originalReq[field] || ''
      
      if (openVal === '[]' || openVal === '{}') openVal = ''
      if (origVal === '[]' || origVal === '{}') origVal = ''
      
      if (openVal !== origVal) {
        return true
      }
    }
    return false
  }

  const closeRequest = (id) => {
    const idx = openRequests.value.findIndex(r => r.id === id)
    if (idx !== -1) {
      openRequests.value.splice(idx, 1)
      if (activeRequestId.value === id) {
        activeRequestId.value = openRequests.value.length > 0 ? openRequests.value[Math.max(0, idx - 1)].id : null
      }
    }
  }

  const updateRequestData = (id, data) => {
    const req = openRequests.value.find(r => r.id === id)
    if (req) {
      Object.assign(req, data)
    }
  }

  const createNewRequest = async (collection) => {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    const newReqData = {
      name: 'Untitled Request',
      method: 'GET',
      url: '{{url}}/',
      headers: '{\n  "Content-Type": "application/json"\n}',
      queryParams: '{}',
      body: '{}'
    }
    
    const res = await fetch(`${config.public.apiBaseUrl}/workspaces/collections/${collection.id}/requests`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${authStore.token}` },
      body: JSON.stringify(newReqData)
    })
    
    const savedReq = await res.json()
    savedReq._isNew = true // Flag it as new so closing it without saving deletes it
    
    // Refresh the collection to update the sidebar
    await selectCollection(collection)
    
    // Open it in a tab
    selectRequest(savedReq)
  }

  const openNewTab = () => {
    const tempId = `temp-${Date.now()}`
    const newReq = {
      id: tempId,
      name: 'Untitled Request',
      method: 'GET',
      url: '{{url}}/',
      headers: '[\n  { "key": "Content-Type", "value": "application/json" }\n]',
      queryParams: '[]',
      body: '{}',
      bodyType: 'none',
      bodyForm: '[]',
      bodyUrlencoded: '[]',
      _isNew: true,
      _isTemp: true
    }
    openRequests.value.push(newReq)
    activeRequestId.value = tempId
  }

  const importCollection = async (workspaceId, collectionData, parentId = null) => {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    let url = `${config.public.apiBaseUrl}/workspaces/${workspaceId}/import`
    if (parentId) {
      url += `?parentId=${parentId}`
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authStore.token}` },
      body: JSON.stringify(collectionData)
    })
    if (!res.ok) {
      throw new Error('Failed to import collection')
    }
    await loadWorkspaces()
  }

  const importGlobalCollection = async (collectionData) => {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    const res = await fetch(`${config.public.apiBaseUrl}/workspaces/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authStore.token}` },
      body: JSON.stringify(collectionData)
    })
    if (!res.ok) {
      throw new Error('Failed to import globally')
    }
    await loadWorkspaces()
  }

  const triggerDownload = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportWorkspace = async (workspaceId, workspaceName) => {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    const res = await fetch(`${config.public.apiBaseUrl}/workspaces/${workspaceId}/export`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (!res.ok) throw new Error('Failed to export workspace')
    const data = await res.json()
    triggerDownload(data, `${workspaceName || 'workspace'}.postman_collection.json`)
  }

  const exportCollection = async (collectionId, collectionName) => {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()
    const res = await fetch(`${config.public.apiBaseUrl}/workspaces/collections/${collectionId}/export`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    if (!res.ok) throw new Error('Failed to export collection')
    const data = await res.json()
    triggerDownload(data, `${collectionName || 'collection'}.postman_collection.json`)
  }

  return {
    workspaces,
    filteredWorkspaces,
    activeWorkspace,
    activeCollection,
    activeRequestId,
    openRequests,
    activeRequest,
    searchQuery,
    selectRequest,
    closeRequest,
    isRequestModified,
    updateRequestData,
    loadWorkspaces,
    selectWorkspace,
    selectCollection,
    createWorkspace,
    createCollection,
    renameWorkspace,
    deleteWorkspace,
    duplicateWorkspace,
    renameCollection,
    deleteCollection,
    duplicateCollection,
    addWorkspaceMember,
    removeWorkspaceMember,
    createNewRequest,
    saveRequest,
    saveRequestChanges,
    renameRequest,
    deleteRequest,
    openNewTab,
    importCollection,
    importGlobalCollection,
    exportWorkspace,
    exportCollection
  }
})
