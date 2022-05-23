const fs = require("fs");
const fsPromise = fs.promises;
const chokidar = require("chokidar");
const path = require("path");

const viewPath = "./views";
const distFolder = "./dist";
const generatedPath = path.join(distFolder, "views");

let done = true;
async function copyStaticFiles() {
    if (!done) return;
    done = false;

    try {
        await fsPromise.mkdir(distFolder);
    } catch (e) {
        console.warn("Not (re)creating dir", distFolder);
    }
    try {
        await fsPromise.rm(generatedPath, { recursive: true });
    } catch (e) {
        console.warn("Not (re)removing", generatedPath);
    }

    try {
        await fsPromise.mkdir(generatedPath);
    } catch (e) {
        console.warn("Not (re)creating dir", generatedPath);
    }

    const files = await fsPromise.readdir(viewPath);

    try {
        for (const file of files) {
            const outPath = path.join(generatedPath, file);
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
    finally {
        done = true;
    }


}

copyStaticFiles();

const watcher = chokidar.watch("./views", { atomic: true, recursive: true, ignoreInitial: false });

watcher.on("change", async () => {
    await copyStaticFiles();
});

