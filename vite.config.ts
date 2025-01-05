import { defineConfig } from "vite";
import { resolve, join } from "node:path";
import {
	copyFileSync,
	mkdirSync,
	existsSync,
	createWriteStream,
} from "node:fs";
import archiver from "archiver";

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
