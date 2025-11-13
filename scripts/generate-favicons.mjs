import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import favicons from "favicons";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = resolve(__dirname, "..");
const sourceImage = join(projectRoot, "WhatsApp Image 2025-11-03 at 3.53.22 PM (1).jpeg");
const publicDir = join(projectRoot, "public", "favicons");

try {
  const { images, files } = await favicons(sourceImage, {
    path: "/favicons",
    appName: "ANJ SPORTs",
    appShortName: "ANJ SPORTs",
    appDescription:
      "ANJ SPORTs es tu tienda especializada en tenis de mesa en Perú. Raquetas, gomas y accesorios.",
    developerName: "ANJ SPORTs",
    developerURL: "https://anjsports.com",
    display: "standalone",
    background: "#000000",
    theme_color: "#000000",
    icons: {
      android: true,
      appleIcon: true,
      appleStartup: false,
      favicons: true,
      windows: false,
      yandex: false,
    },
  });

  await mkdir(publicDir, { recursive: true });

  await Promise.all(
    images.map(async (image) => {
      const targetPath = join(publicDir, image.name);
      await writeFile(targetPath, image.contents);
    }),
  );

  await Promise.all(
    files.map(async (file) => {
      const targetPath = join(publicDir, file.name);
      await writeFile(targetPath, file.contents);
    }),
  );

  console.log("Favicons generated successfully.");
} catch (error) {
  console.error("Failed to generate favicons:", error);
  process.exitCode = 1;
}

