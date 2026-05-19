import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const uploadFolders = ["avatars", "receipts"] as const;

export type UploadFolder = (typeof uploadFolders)[number];

function getExtension(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();
  return extension || ".bin";
}

export function isValidUploadFolder(value: string): value is UploadFolder {
  return uploadFolders.includes(value as UploadFolder);
}

function getUploadDirectory(folder: UploadFolder) {
  switch (folder) {
    case "avatars":
      return path.join(process.cwd(), "public", "uploads", "avatars");
    case "receipts":
      return path.join(process.cwd(), "public", "uploads", "receipts");
  }
}

export async function saveUploadedFile(file: File, folder: UploadFolder) {
  const targetDir = getUploadDirectory(folder);
  await mkdir(targetDir, { recursive: true });

  const fileName = `${randomUUID()}${getExtension(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const outputPath = path.join(targetDir, fileName);

  await writeFile(outputPath, buffer);

  return `/uploads/${folder}/${fileName}`;
}
