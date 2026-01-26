type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE"

export interface RequestOptions {
  token?: string | null
  method?: HttpMethod
  body?: unknown
  searchParams?: Record<string, string | number | boolean | undefined>
  headers?: Record<string, string>
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1"

const buildUrl = (path: string, params?: RequestOptions["searchParams"]): string => {
  const base = API_BASE_URL.startsWith("http")
    ? API_BASE_URL
    : `${window.location.origin}${API_BASE_URL}`

  const url = path.startsWith("http")
    ? new URL(path)
    : new URL(`${base.replace(/\/$/, "")}${path}`)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return
      url.searchParams.set(key, String(value))
    })
  }

  return url.toString()
}

const handleResponse = async <T>(response: Response): Promise<T> => {
if (response.status === 204) {
return {} as T
}


const rawText = await response.text()


// Use `unknown` instead of `any` and assert later
let data: unknown = null
try {
data = rawText ? JSON.parse(rawText) : null
} catch {
data = null
}


if (!response.ok) {
const detail =
(data as { detail?: unknown; message?: unknown })?.detail ??
(data as { detail?: unknown; message?: unknown })?.message ??
rawText ??
`HTTP ${response.status}`


const message = Array.isArray(detail)
? detail.map((item) => (item && (item as { msg?: string }).msg) ?? "Invalid request").join("; ")
: String(detail)


throw new Error(message)
}


return (data as T) ?? ({} as T)
}

export const apiClient = {
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { token, method = "GET", body, searchParams, headers } = options

    const response = await fetch(buildUrl(path, searchParams), {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(headers ?? {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    return handleResponse<T>(response)
  },

  get<T>(path: string, options: RequestOptions = {}) {
    return apiClient.request<T>(path, { ...options, method: "GET" })
  },

  post<T>(path: string, body: unknown, options: RequestOptions = {}) {
    return apiClient.request<T>(path, { ...options, method: "POST", body })
  },

  patch<T>(path: string, body: unknown, options: RequestOptions = {}) {
    return apiClient.request<T>(path, { ...options, method: "PATCH", body })
  },

  delete(path: string, options: RequestOptions = {}) {
    return apiClient.request(path, { ...options, method: "DELETE" })
  },
}