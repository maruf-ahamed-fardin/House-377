"use client";

import { useRef, useState } from "react";
import { LoaderCircle, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UploadFolder = "avatars" | "receipts";

export function UploadField({
  label,
  value,
  onChange,
  folder,
  accept,
  helperText,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  folder: UploadFolder;
  accept: string;
  helperText?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileSelect(file?: File | null) {
    if (!file) {
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/upload?folder=${folder}`, {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "Upload failed.");
      }

      onChange(payload.url);
      toast.success("Upload completed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input value={value ?? ""} onChange={(event) => onChange(event.target.value)} placeholder="Paste URL or upload file" />
        <div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(event) => void handleFileSelect(event.target.files?.[0])}
          />
          <Button type="button" variant="outline" disabled={isUploading} onClick={() => inputRef.current?.click()}>
            {isUploading ? <LoaderCircle className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
      {helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}
    </div>
  );
}
