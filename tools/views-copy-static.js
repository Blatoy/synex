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
        console.warn("Could not create dir", distFolder);
    }
    try {
        await fsPromise.rm(generatedPath, { recursive: true });
    } catch (e) {
        console.warn("Could not remove dir", generatedPath);
    }
    
    try {
        await fsPromise.mkdir(generatedPath);
     } catch (e) {
        console.warn("Could not create dir", generatedPath);
    }

    const files = await fsPromise.readdir(viewPath);

    for (const file of files) {
        const outPath = path.join(generatedPath, file);
        const inPath = path.join(viewPath, file);

        const stats = await fsPromise.lstat(inPath);
        if (stats.isDirectory() && !outPath.startsWith("/")) {
            await fsPromise.mkdir(outPath);
            await fsPromise.cp(path.join(inPath, "static"), outPath, { recursive: true });
        }
    }
    done = true;
}

copyStaticFiles();

chokidar.watch(viewPath, { recursive: true }, async () => {
    if (done) {
        await copyStaticFiles();
    }
});
