import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("aureus", {
  storage: {
    read: () => ipcRenderer.invoke("storage:read"),
    write: (data: string) => ipcRenderer.invoke("storage:write", data),
    clear: () => ipcRenderer.invoke("storage:clear"),
  },
  app: {
    getVersion: () => ipcRenderer.invoke("app:getVersion"),
    getPath: (name: string) => ipcRenderer.invoke("app:getPath", name),
  },
});
