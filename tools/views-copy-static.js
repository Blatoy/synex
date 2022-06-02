const fs = require("fs");
const fsPromise = fs.promises;
const chokidar = require("chokidar");
const path = require("path");

const viewPath = "./views";
const gamePath = "./games";
const distFolder = "./dist";
const viewGeneratedPath = path.join(distFolder, "views");
const gameAssetsGeneratedPath = path.join(distFolder, "assets");

async function createBaseStructure() {
    try {
        await fsPromise.mkdir(distFolder);
    } catch (e) {
        console.warn("Not (re)creating dir", distFolder);
    }
}

async function copyGameAssets() {
    try {
        await fsPromise.rm(gameAssetsGeneratedPath, { recursive: true });
    } catch (e) {
        console.warn("Not (re)removing", viewGeneratedPath);
    }

    try {
        await fsPromise.mkdir(gameAssetsGeneratedPath);
    } catch (e) {
        console.warn("Not (re)creating dir", gameAssetsGeneratedPath);
    }

    const files = await fsPromise.readdir(gamePath);

    try {
        for (const file of files) {
            const outPath = path.join(gameAssetsGeneratedPath, file);
            const inPath = path.join(gamePath, file);

            const stats = await fsPromise.lstat(inPath);
            if (stats.isDirectory() && !outPath.startsWith("/")) {
                try {
                    await fsPromise.mkdir(outPath);
                }
                catch (e) {
                    console.log("Could not create dir", outPath);
                }
                try {
                    await fsPromise.cp(path.join(inPath, "assets"), outPath, { recursive: true });
                }
                catch (e) {
                    console.error("Could not copy static file of", inPath);
                }
            }
        }
        console.log("Copied static files.");
    }
    catch (e) {
        console.error("Could not copy static files!", e);
    }
}

async function copyStaticFiles() {
    try {
        await fsPromise.rm(viewGeneratedPath, { recursive: true });
    } catch (e) {
        console.warn("Not (re)removing", viewGeneratedPath);
    }

    try {
        await fsPromise.mkdir(viewGeneratedPath);
    } catch (e) {
        console.warn("Not (re)creating dir", viewGeneratedPath);
    }

    const files = await fsPromise.readdir(viewPath);

    try {
        for (const file of files) {
            const outPath = path.join(viewGeneratedPath, file);
            const inPath = path.join(viewPath, file);

            const stats = await fsPromise.lstat(inPath);
            if (stats.isDirectory() && !outPath.startsWith("/")) {
                try {
                    await fsPromise.mkdir(outPath);
                }
                catch (e) {
                    console.log("Could not create dir", outPath);
                }
                await fsPromise.cp(path.join(inPath, "static"), outPath, { recursive: true });
            }
        }
        console.log("Copied static files.");
    }
    catch (e) {
        console.error("Could not copy static files!", e);
    }
}

async function copyAll() {
    await createBaseStructure();
    await copyStaticFiles();
    await copyGameAssets();
}

const viewWatcher = chokidar.watch("./views", { atomic: true, recursive: true, ignoreInitial: false });

viewWatcher.on("change", async () => {
    await createBaseStructure();
    await copyStaticFiles();
});

viewWatcher.on("create", async () => {
    await createBaseStructure();
    await copyStaticFiles();
});

const gameWatcher = chokidar.watch("./views", { atomic: true, recursive: true, ignoreInitial: false });

gameWatcher.on("change", async () => {
    await createBaseStructure();
    await copyGameAssets();
});

gameWatcher.on("create", async () => {
    await createBaseStructure();
    await copyGameAssets();
});

copyAll();