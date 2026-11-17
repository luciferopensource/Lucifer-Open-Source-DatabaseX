/**
 * Wallpaper storage.
 *
 * Uploaded images are kept in IndexedDB as a data URL (2 MB cap enforced in the
 * settings drawer), because localStorage's ~5 MB budget is shared with every
 * other preference and a base64 image would evict it.
 */

const DB_NAME = 'lx-appearance'
const STORE = 'wallpaper'
const KEY = 'custom'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export async function saveWallpaperImage(file: File): Promise<string> {
  const dataUrl = await fileToDataUrl(file)
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(dataUrl, KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
  return dataUrl
}

export async function loadWallpaperImage(): Promise<string | null> {
  const db = await openDb()
  const value = await new Promise<string | null>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const request = tx.objectStore(STORE).get(KEY)
    request.onsuccess = () => resolve((request.result as string | undefined) ?? null)
    request.onerror = () => reject(request.error)
  })
  db.close()
  return value
}

export async function clearWallpaperImage(): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}
