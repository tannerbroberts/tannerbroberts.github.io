declare module 'firebase/app' {
  export function initializeApp(config: Record<string, unknown>): unknown;
}

declare module 'firebase/auth' {
  export function getAuth(app?: unknown): unknown;
}
