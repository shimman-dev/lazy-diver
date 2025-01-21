import { copyFileSync, createWriteStream, existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import archiver from "archiver";
import { defineConfig } from "vite";

const copyAssetsZip = () => {
	return {
		name: "copy-then-zip",
		async closeBundle() {
			try {
				if (!existsSync("dist")) {
					mkdirSync("dist", { recursive: true });
				}

				copyFileSync("manifest.json", "dist/manifest.json");

				copyFileSync("assets/pinny-non-diver.png", "dist/pinny-non-diver.png");
				copyFileSync("assets/pinny-diver.png", "dist/pinny-diver.png");

				console.log("✓ all assets successfully copied");

				const output = createWriteStream("lazy-diver.zip");
				const archive = archiver("zip", { zlib: { level: 9 } });

				archive.pipe(output);
				archive.directory("dist/", false);
				await archive.finalize();

				console.log("✓ zip successfully created");
			} catch (error) {
				console.error("Error copying or zipping files:", error);
				throw error;
			}
		},
	};
};

export default defineConfig({
	build: {
		rollupOptions: {
			input: {
				popup: resolve(__dirname, "popup.html"),
				content: resolve(__dirname, "src/content.ts"),
			},
			output: {
				entryFileNames: "[name].js",
				chunkFileNames: "[name].js",
				assetFileNames: "[name].[ext]",
			},
		},
		outDir: "dist",
		emptyOutDir: true,
	},
	plugins: [copyAssetsZip()],
});
