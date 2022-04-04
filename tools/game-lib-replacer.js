const path = require("path"); 

function replacer(data) {
    const relative = path.relative(data.file, data.config.outDir);
    const relativeNormalized = relative.replace(/\\+/g, "/");
    // replace all "../" before "game-lib" (happens if recompiling) and then replace game-lib by the correct path
    return data.orig.replace(/(\.\.\/)+game-lib/, "game-lib").replace("game-lib", relativeNormalized + "/game-lib");
}

exports["default"] = replacer;