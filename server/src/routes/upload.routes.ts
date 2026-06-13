import { Router } from "express";
import multer from "multer";

import { authenticate } from "../middleware/authenticate.js";
import { isValidUploadFolder, saveUploadedFile, type UploadFolder } from "../services/upload.service.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router = Router();

router.post("/", authenticate, upload.single("file"), async (req, res) => {
  try {
    const folder = (req.headers["x-upload-folder"] as string) ?? (req.query.folder as string) ?? "";
    if (!isValidUploadFolder(folder)) { res.status(400).json({ success: false, message: "Invalid upload folder." }); return; }

    const file = req.file;
    if (!file) { res.status(400).json({ success: false, message: "No file received." }); return; }

    const isAvatarUpload = folder === "avatars";
    const isReceiptUpload = folder === "receipts";
    const isImage = file.mimetype.startsWith("image/");
    const isPdf = file.mimetype === "application/pdf";

    if (isAvatarUpload && !isImage) { res.status(400).json({ success: false, message: "Avatar uploads must be images." }); return; }
    if (isReceiptUpload && !isImage && !isPdf) { res.status(400).json({ success: false, message: "Receipts must be image or PDF files." }); return; }

    const url = await saveUploadedFile(file, folder as UploadFolder);
    res.json({ success: true, data: { url } });
  } catch (error) { console.error("Upload error:", error); res.status(500).json({ success: false, message: "Upload failed." }); }
});

export default router;
