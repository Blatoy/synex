const fs = require("fs");
const fsPromise = fs.promises;
const path = require("path");

const viewPath = "./views";
const distFolder = "./dist";
const generatedPath = path.join(distFolder, "views");

async function copyStaticFiles() {
    try { await fsPromise.mkdir(distFolder); } catch (e) { }
    try { await fsPromise.rm(generatedPath, { recursive: true });  } catch (e) { }

    await fsPromise.mkdir(generatedPath);

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
}

copyStaticFiles();

let done = true;
fs.watch(viewPath, { recursive: true }, async () => {
    if (done) {
        done = false;
        await copyStaticFiles();
        done = true;
    }
});
