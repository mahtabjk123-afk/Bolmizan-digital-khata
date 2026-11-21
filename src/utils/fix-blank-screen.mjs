import fs from "fs";
import path from "path";

const srcDir = path.join(process.cwd(), "src");

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach((file) => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath, callback);
        } else if (fullPath.endsWith(".tsx") || fullPath.endsWith(".ts")) {
            callback(fullPath);
        }
    });
}

let fixedFilesCount = 0;

walkDir(srcDir, (filePath) => {
    let content = fs.readFileSync(filePath, "utf8");
    const original = content;

    // 1. Replace unsafe ".businessName" with optional chaining "?.businessName"
    content = content.replace(/([a-zA-Z0-9_\]\)]+)\.businessName/g, "$1?.businessName");

    // 2. Replace unsafe ".merchantName" with optional chaining "?.merchantName"
    content = content.replace(/([a-zA-Z0-9_\]\)]+)\.merchantName/g, "$1?.merchantName");

    // 3. Add safe fallback inside JSX {something?.businessName} -> {something?.businessName || "BolMizan Sovereign Trader"}
    content = content.replace(
        /\{([a-zA-Z0-9_?.]+?\?\.businessName)\}/g,
        '{$1 || "BolMizan Sovereign Trader"}'
    );

    if (content !== original) {
        fs.writeFileSync(filePath, content, "utf8");
        console.log(`✅ Fixed crash risk in: ${path.relative(process.cwd(), filePath)}`);
        fixedFilesCount++;
    }
});

console.log(`\n🎉 Total files patched: ${fixedFilesCount}`);
