import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { createUploadthing, type FileRouter } from "uploadthing/express";
import { createRouteHandler } from "uploadthing/express";

dotenv.config();

const app = express();
const PORT = 3000;

const f = createUploadthing();

export const uploadRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .onUploadComplete((data) => {
      console.log("Upload complete:", data.file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;

app.use(
  "/api/uploadthing",
  createRouteHandler({
    router: uploadRouter,
  })
);

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
