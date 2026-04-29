// In-Memory Übergabe von Dateien zwischen Routen (z. B. Scanner → Vault).
// Bewusst kein localStorage/sessionStorage: rohe Bytes sollen nicht außerhalb
// des Speichers landen, damit die Vault-Verschlüsselung nicht umgangen wird.

let pending: File | null = null;

export const pendingIngest = {
  set(file: File) {
    pending = file;
  },
  take(): File | null {
    const f = pending;
    pending = null;
    return f;
  },
  has() {
    return pending !== null;
  },
};
