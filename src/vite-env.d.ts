/// <reference types="vite/client" />

interface AureusAPI {
  storage: {
    read: () => Promise<string | null>;
    write: (data: string) => Promise<boolean>;
    clear: () => Promise<boolean>;
  };
  app: {
    getVersion: () => Promise<string>;
    getPath: (name: string) => Promise<string>;
  };
}

declare global {
  interface Window {
    aureus?: AureusAPI;
  }
}

export {};
