import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
})

export default api

export const getDocuments = () => api.get('/documents/')

export const uploadDocument = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/documents/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const getDocument = (id) => api.get(`/documents/${id}/`)

export const deleteDocument = (id) => api.delete(`/documents/${id}/`)

export const exportDocuments = () =>
  api.get('/documents/export/', { responseType: 'blob' })

export const getStats = () => api.get('/documents/stats/')
