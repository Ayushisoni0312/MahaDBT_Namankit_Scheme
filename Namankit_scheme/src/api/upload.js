// ============================================================
//  src/api/upload.js
//  Uploads files to Liferay Documents & Media.
//  Used by all sections that have file upload fields.
//
//  HOW IT WORKS:
//  1. Auto-detects the Liferay site ID
//  2. Finds (or creates) the folder by name
//  3. Uploads the file as multipart/form-data
//  4. Returns { documentId, title, downloadURL }
//     → pass documentId into your payload instead of base64
// ============================================================

const LIFERAY_USER = "prabhudasu";
const LIFERAY_PASS = "root";
const AUTH_HEADER  = "Basic " + btoa(`${LIFERAY_USER}:${LIFERAY_PASS}`);

// ── Get site ID ───────────────────────────────────────────────
// Priority:
//   1. window.Liferay.ThemeDisplay  (when deployed inside Liferay)
//   2. VITE_SITE_ID in .env         (set manually)
//   3. Auto-fetch from Liferay API  (dev mode fallback)
let _cachedSiteId = null;

async function getSiteId() {
  if (_cachedSiteId) return _cachedSiteId;

  // When running inside Liferay portal
  const liferaySiteId = window.Liferay?.ThemeDisplay?.getScopeGroupId?.();
  if (liferaySiteId) {
    _cachedSiteId = liferaySiteId;
    return _cachedSiteId;
  }

  // From .env
  const envSiteId = Number(import.meta.env.VITE_SITE_ID);
  if (envSiteId && envSiteId > 0) {
    _cachedSiteId = envSiteId;
    return _cachedSiteId;
  }

  // Auto-fetch from Liferay — gets the first non-guest site
  try {
    const res = await fetch("/o/headless-delivery/v1.0/sites", {
      headers: { Authorization: AUTH_HEADER },
      credentials: "include",
    });
    if (!res.ok) throw new Error(`Sites API ${res.status}`);
    const data = await res.json();
    const sites = (data.items || []).filter((s) => s.key !== "guest" && s.id > 0);
    if (sites.length === 0) throw new Error("No sites found in Liferay");
    _cachedSiteId = sites[0].id;
    console.log(`[upload] Using site: "${sites[0].name}" (id=${_cachedSiteId})`);
    return _cachedSiteId;
  } catch (err) {
    throw new Error(
      `Cannot determine Liferay site ID. ` +
      `Set VITE_SITE_ID in .env to your site's group ID.\n` +
      `(Find it: Site Settings → Site Configuration → Site ID)\n` +
      `Original error: ${err.message}`
    );
  }
}

// ── Get or auto-create folder ─────────────────────────────────
async function getOrCreateFolder(siteId, folderName) {
  const searchRes = await fetch(
    `/o/headless-delivery/v1.0/sites/${siteId}/document-folders?search=${encodeURIComponent(folderName)}`,
    { headers: { Authorization: AUTH_HEADER }, credentials: "include" }
  );

  if (!searchRes.ok) {
    const err = await searchRes.text();
    throw new Error(`Failed to fetch folders (${searchRes.status}): ${err}`);
  }

  const data = await searchRes.json();
  if (!Array.isArray(data.items)) throw new Error("Invalid folder response");

  const existing = data.items.find(
    (f) => f.name.trim().toLowerCase() === folderName.trim().toLowerCase()
  );
  if (existing) return existing.id;

  // Folder not found — create it
  console.log(`[upload] Folder "${folderName}" not found, creating...`);
  const createRes = await fetch(
    `/o/headless-delivery/v1.0/sites/${siteId}/document-folders`,
    {
      method: "POST",
      headers: { Authorization: AUTH_HEADER, "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: folderName }),
    }
  );

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Failed to create folder "${folderName}" (${createRes.status}): ${err}`);
  }

  const created = await createRes.json();
  console.log(`[upload] Created folder "${folderName}" (id=${created.id})`);
  return created.id;
}

// ── Upload a single file ──────────────────────────────────────
export async function uploadFileToFolder(file, folderName = "School Documents") {
  if (!file) throw new Error("No file provided");

  const siteId   = await getSiteId();
  const folderId = await getOrCreateFolder(siteId, folderName);

  // Unique filename to avoid collisions
  const ext        = file.name.split(".").pop();
  const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`;
  const renamed    = new File([file], uniqueName, { type: file.type });

  const form = new FormData();
  form.append("file",  renamed);
  form.append("title", uniqueName);

  const uploadRes = await fetch(
    `/o/headless-delivery/v1.0/document-folders/${folderId}/documents`,
    {
      method: "POST",
      headers: { Authorization: AUTH_HEADER },
      body: form,
      credentials: "include",
    }
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`Upload failed (${uploadRes.status}): ${err}`);
  }

  const result = await uploadRes.json();
  return {
    documentId:  result.id,
    title:       result.title,
    downloadURL: result.contentUrl,
  };
}

// ── Upload multiple files ─────────────────────────────────────
export async function uploadMultipleFiles(filesArray, folderName = "School Documents") {
  if (!filesArray || filesArray.length === 0) return [];
  return Promise.all(filesArray.map((f) => uploadFileToFolder(f, folderName)));
}