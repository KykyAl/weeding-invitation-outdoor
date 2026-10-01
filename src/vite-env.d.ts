/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_API_PROXY_TARGET?: string
  readonly VITE_USE_SAMPLE_DATA?: string
  readonly VITE_CREDIT_NAME?: string
  readonly VITE_CREDIT_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
