const path = require("path"); 

function replacer(data) {
    const relative = path.relative(data.file, data.config.outDir);
    const relativeNormalized = relative.replace(/\\+/g, "/");
    // replace all "../" before "engine" (happens if recompiling) and then replace engine by the correct path
    return data.orig.replace(/(\.\.\/)+engine/, "engine").replace("engine", relativeNormalized + "/engine");
}

exports["default"] = replacer;