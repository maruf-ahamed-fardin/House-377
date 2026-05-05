import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const uploadDirectories = {
  avatars: path.join(process.cwd(), "public", "uploads", "avatars"),
  receipts: path.join(process.cwd(), "public", "uploads", "receipts"),
} as const;

export type UploadFolder = keyof typeof uploadDirectories;

function getExtension(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();
  return extension || ".bin";
}

export function isValidUploadFolder(value: string): value is UploadFolder {
  return value in uploadDirectories;
}

export async function saveUploadedFile(file: File, folder: UploadFolder) {
  const targetDir = uploadDirectories[folder];
  await mkdir(targetDir, { recursive: true });

  const fileName = `${randomUUID()}${getExtension(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const outputPath = path.join(targetDir, fileName);

  await writeFile(outputPath, buffer);

  return `/uploads/${folder}/${fileName}`;
}
