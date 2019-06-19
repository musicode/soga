
export interface Response {
  readonly ok: boolean
  readonly status: number
  readonly statusText: string
  readonly url: string
  readonly headers: {
    get(name: string): string | void
    has(name: string): boolean
  }
  readonly body: any
  blob(): Blob
  json(): any
  text(): string
  clone(): Response
}

export interface FetchOptions {
  body?: BodyInit | null
  credentials?: RequestCredentials
  headers?: HeadersInit
  method?: string
}

export interface UploadOptions {
  data?: Record<string, any>
  headers?: HeadersInit
  fileName: string
  action: string
}

export interface UploadChunkOptions {
  headers?: HeadersInit
  chunkIndex: number
  chunkSize: number
  action: string
}

export interface UploadProgress {
  uploaded: number
  total: number
  percent: number
}

export interface UploadChunkProgress {
  chunkIndex: number
  uploaded: number
  total: number
  percent: number
}

export interface UploadChunkSuccess {
  chunkIndex: number
}

export interface ChunkInfo {
  uploaded: number
  uploading: number
  options: UploadChunkOptions
}

export interface UploadHooks {
  onStart?: () => void
  onEnd?: () => void
  onError?: () => void
  onAbort?: () => void

  onProgress?: (progress: UploadProgress) => void
  onSuccess?: (response: Response) => void

  onChunkProgress?: (progress: UploadChunkProgress) => void
  onChunkSuccess?: (success: UploadChunkSuccess) => void
}

