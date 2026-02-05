import type { UploadResult } from '@/types/upload';

export async function uploadFile(
  file: File,
  onProgress?: (p: number) => void
): Promise<UploadResult> {
  try {
    const form = new FormData();
    form.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: form,
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data?.error ?? 'Upload failed' };
    }

    onProgress?.(100);

    return { success: true, url: data.publicUrl };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Upload failed' };
  }
}
