const BASE_URL = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('sih_token');
  const userId = localStorage.getItem('sih_active_user') || 'usr-pol-042'; // Fallback for older components
  const headers = { 'x-user-id': userId };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchApi(endpoint, options = {}) {
  const headers = {
    ...getAuthHeader(),
    ...options.headers,
  };

  if (!(options.body instanceof FormData) && options.body) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP Error ${res.status}`);
  }
  
  return res.json();
}

export async function getUsers() {
  return fetchApi('/auth/users');
}

export async function getCases() {
  return fetchApi('/cases');
}

export async function createCase(data) {
  return fetchApi('/cases', {
    method: 'POST',
    body: data,
  });
}

export async function getCaseDetails(caseId) {
  return fetchApi(`/cases/${caseId}`);
}

export async function getCaseDocuments(caseId) {
  return fetchApi(`/cases/${caseId}/documents`);
}

export async function getCaseAuditTrail(caseId) {
  return fetchApi(`/cases/${caseId}/audit-trail`);
}

export async function uploadDocument(caseId, file) {
  const formData = new FormData();
  formData.append('file', file);
  
  // Custom fetch to handle FormData properly (without setting Content-Type, let browser set boundary)
  const res = await fetch(`${BASE_URL}/cases/${caseId}/documents`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: formData,
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Upload failed');
  }
  
  return res.json();
}

export async function verifyDocument(documentId) {
  return fetchApi(`/documents/${documentId}/verify`);
}

export function getDownloadUrl(documentId) {
  return `${BASE_URL}/documents/${documentId}/download`;
}

export async function semanticSearchCase(caseId, query) {
  return fetchApi(`/cases/${caseId}/search?q=${encodeURIComponent(query)}`);
}

// Complaint APIs
export async function getComplaints(caseId) {
  return fetchApi(`/cases/${caseId}/complaints`);
}

export async function createComplaint(caseId, data) {
  return fetchApi(`/cases/${caseId}/complaints`, {
    method: 'POST',
    body: data,
  });
}

export async function reviewComplaint(complaintId, data) {
  return fetchApi(`/complaints/${complaintId}/review`, {
    method: 'PATCH',
    body: data,
  });
}

export async function generateCaseSummary(caseId) {
  return fetchApi(`/cases/${caseId}/summary`, { method: 'POST' });
}

export async function findContradictions(caseId) {
  return fetchApi(`/cases/${caseId}/contradictions`);
}

export async function updateCaseStatus(caseId, status) {
  return fetchApi(`/cases/${caseId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
}
