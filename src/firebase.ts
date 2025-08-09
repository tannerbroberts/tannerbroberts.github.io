// Firebase scaffold (placeholder). Do not import firebase SDK until installed.
// Controlled via VITE_FIREBASE_ENABLED flag.

export type FirebaseServices = {
  enabled: boolean;
  init: () => Promise<void>;
}

export const firebaseServices: FirebaseServices = {
  enabled: import.meta.env.VITE_FIREBASE_ENABLED === 'true',
  async init() {
    if (import.meta.env.VITE_FIREBASE_ENABLED !== 'true') return;
    // Lazy dynamic import to avoid build errors before SDK install
    try {
      const appMod = 'firebase' + '/app'
      const authMod = 'firebase' + '/auth'
      const result = await Promise.all([
        import(appMod),
        import(authMod)
      ])
      const firebaseApp = result[0] as unknown as { initializeApp: (config: Record<string, string>) => unknown }
      const firebaseAuth = result[1] as unknown as { getAuth: (app?: unknown) => unknown }
      const config = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      } as Record<string, string>;
      if (!config.apiKey) {
        console.warn('[firebase] Missing config; skipping init');
        return;
      }
      const app = firebaseApp.initializeApp(config);
      firebaseAuth.getAuth(app);
      console.log('[firebase] initialized');
    } catch (e) {
      console.warn('[firebase] init skipped or failed:', e);
    }
  }
}
