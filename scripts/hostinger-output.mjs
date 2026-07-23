import { mkdir, writeFile } from "node:fs/promises";

// Hostinger's Next.js preset checks for a .next output directory. Vinext
// intentionally writes its runnable output to dist/, so create a small
// compatibility marker while keeping dist/ as the real runtime output.
await mkdir(".next", { recursive: true });
await writeFile(
  ".next/README.txt",
  "This project is built with Vinext. The runnable server is dist/standalone/server.js.\n",
);
