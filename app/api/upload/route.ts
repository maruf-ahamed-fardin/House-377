import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { isValidUploadFolder, saveUploadedFile } from "@/lib/upload";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const folder = request.headers.get("x-upload-folder") ?? new URL(request.url).searchParams.get("folder") ?? "";

  if (!isValidUploadFolder(folder)) {
    return NextResponse.json({ error: "Invalid upload folder." }, { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    return NextResponse.json({ error: "File is too large. Maximum size is 5MB." }, { status: 400 });
  }

  const isAvatarUpload = folder === "avatars";
  const isReceiptUpload = folder === "receipts";
  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf";

  if (isAvatarUpload && !isImage) {
    return NextResponse.json({ error: "Avatar uploads must be images." }, { status: 400 });
  }

  if (isReceiptUpload && !isImage && !isPdf) {
    return NextResponse.json({ error: "Receipts must be image or PDF files." }, { status: 400 });
  }

  const url = await saveUploadedFile(file, folder);

  return NextResponse.json({ url });
}
