import React, { useRef, useState } from 'react';

interface MediaUploaderProps {
  courseId: string;
  accept: string; // 'image/*' | 'video/*' | 'audio/*'
  label: string;
  onUploaded: (publicUrl: string, fileName: string) => void;
}

const font = { sans: "'DM Sans', sans-serif", mono: "'DM Mono', monospace" };
const palette = {
  bg: '#ffffff', text: '#0d0d0d', muted: '#6b7280',
  border: '#e5e7eb', accent: '#0057ff', green: '#059669', red: '#dc2626',
};

export function MediaUploader({ courseId, accept, label, onUploaded }: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      // Step 1: Get presigned URL
      const resp = await fetch('/api/lms/media/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          courseId,
        }),
      });

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(body.error || `Erreur ${resp.status}`);
      }

      const { presignedUrl, publicUrl } = await resp.json();

      // Step 2: PUT file to S3 — use XHR for progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', presignedUrl);
        xhr.setRequestHeader('Content-Type', file.type);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload échoué (HTTP ${xhr.status})`));
          }
        };

        xhr.onerror = () => reject(new Error('Erreur réseau lors de l\'upload'));
        xhr.send(file);
      });

      setProgress(100);
      setUploadedName(file.name);
      onUploaded(publicUrl, file.name);
    } catch (err: any) {
      setError(err.message || 'Erreur upload');
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragging ? palette.accent : palette.border}`,
          borderRadius: 8,
          padding: '24px 16px',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          background: dragging ? '#f0f5ff' : '#fafafa',
          transition: 'border-color 0.15s, background 0.15s',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        {uploadedName ? (
          <div>
            <div style={{ fontSize: 20, marginBottom: 4 }}>✓</div>
            <div style={{ fontSize: 13, color: palette.green, fontFamily: font.mono, fontWeight: 600 }}>
              {uploadedName}
            </div>
          </div>
        ) : uploading ? (
          <div>
            <div style={{ fontSize: 12, color: palette.muted, fontFamily: font.sans, marginBottom: 10 }}>
              Upload en cours... {progress}%
            </div>
            <div
              style={{
                width: '100%', height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%', width: `${progress}%`,
                  background: palette.accent, borderRadius: 3,
                  transition: 'width 0.2s',
                }}
              />
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 28, marginBottom: 8 }}>↑</div>
            <div style={{ fontSize: 13, color: palette.muted, fontFamily: font.sans }}>
              {label}
            </div>
          </div>
        )}
      </div>
      {error && (
        <div style={{ marginTop: 6, fontSize: 12, color: palette.red, fontFamily: font.sans }}>
          {error}
        </div>
      )}
    </div>
  );
}
