import { r2Storage } from '@/storage';
import {
  IMAGE_MIME_TYPES,
  VIDEO_MIME_TYPES,
  AUDIO_MIME_TYPES,
  PDF_MIME_TYPES,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  MAX_AUDIO_SIZE,
  MAX_PDF_SIZE,
} from '@/types/upload';

function generateUploadKey(file: File) {
  const safe = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  let folder = 'uploads/images';
  if (file.type.startsWith('video/')) {
    folder = 'uploads/videos';
  } else if (file.type.startsWith('audio/')) {
    folder = 'uploads/audio';
  } else if (file.type === 'application/pdf') {
    folder = 'uploads/pdfs';
  }
  return `${folder}/${Date.now()}-${safe}`;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file');

    if (!(file instanceof File)) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }


    const isImage = IMAGE_MIME_TYPES.includes(file.type);
    const isVideo = VIDEO_MIME_TYPES.includes(file.type);
    const isAudio = AUDIO_MIME_TYPES.includes(file.type);
    const isPdf = PDF_MIME_TYPES.includes(file.type);

    if (!isImage && !isVideo && !isAudio && !isPdf) {
      return Response.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    if (isImage && file.size > MAX_IMAGE_SIZE) {
      return Response.json({ error: 'Image too large' }, { status: 400 });
    }
    if (isVideo && file.size > MAX_VIDEO_SIZE) {
      return Response.json({ error: 'Video too large' }, { status: 400 });
    }
    if (isAudio && file.size > MAX_AUDIO_SIZE) {
      return Response.json({ error: 'Audio too large' }, { status: 400 });
    }
    if (isPdf && file.size > MAX_PDF_SIZE) {
      return Response.json({ error: 'PDF too large' }, { status: 400 });
    }

    const buffer = new Uint8Array(await file.arrayBuffer());
    const key = generateUploadKey(file);

    const publicUrl = await r2Storage.upload({
      key,
      buffer,
      mime: file.type,
    });


    let fileType = 'other';
    if (isImage) fileType = 'image';
    else if (isVideo) fileType = 'video';
    else if (isAudio) fileType = 'audio';
    else if (isPdf) fileType = 'pdf';

    return Response.json({
      success: true,
      publicUrl,
      type: fileType,
    });
  } catch (err) {
    console.error('[UPLOAD]', err);
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}