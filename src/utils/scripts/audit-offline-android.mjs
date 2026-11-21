import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'src');
const SERVER_DIR = path.join(ROOT, 'server');
const ANDROID_DIR = path.join(ROOT, 'android');

const report = {
    summary: {
        totalFilesScanned: 0,
        criticalBlockers: 0,
        warnings: 0,
        apiEndpointsFound: [],
        externalUrlsFound: [],
        heavyAssetsFound: []
    },
    issues: []
};

function addIssue(severity, file, line, category, message) {
    report.issues.push({ severity, file: path.relative(ROOT, file), line, category, message });
    if (severity === 'CRITICAL') report.summary.criticalBlockers++;
    if (severity === 'WARNING') report.summary.warnings++;
}

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (['node_modules', '.git', 'dist', 'build', '.gradle'].includes(entry.name)) continue;
            walkDir(fullPath, callback);
        } else {
            callback(fullPath);
        }
    }
}

// 1. Scan Frontend (src/ & index.html) for Offline Blockers & API calls
const apiRegex = /['"`](\/api\/[a-zA-Z0-9_\-\/:]+)['"`]/g;
const urlRegex = /(https?:\/\/[^\s'"`<>)]+)/g;

function scanCodeFile(filePath) {
    const ext = path.extname(filePath);
    if (!['.ts', '.tsx', '.js', '.jsx', '.html', '.css'].includes(ext)) return;

    report.summary.totalFilesScanned++;
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((lineText, idx) => {
        const lineNum = idx + 1;

        // Check API endpoints called from frontend
        let apiMatch;
        while ((apiMatch = apiRegex.exec(lineText)) !== null) {
            const endpoint = apiMatch[1];
            if (!report.summary.apiEndpointsFound.includes(endpoint)) {
                report.summary.apiEndpointsFound.push(endpoint);
            }
            addIssue('CRITICAL', filePath, lineNum, 'API_DEPENDENCY', `Frontend calls backend route "${endpoint}" (will fail offline without bridge)`);
        }

        // Check external URLs (CDNs, fonts, external APIs)
        let urlMatch;
        while ((urlMatch = urlRegex.exec(lineText)) !== null) {
            const url = urlMatch[1];
            if (!url.includes('localhost') && !url.includes('127.0.0.1') && !url.includes('w3.org')) {
                if (!report.summary.externalUrlsFound.includes(url)) {
                    report.summary.externalUrlsFound.push(url);
                }
                addIssue('WARNING', filePath, lineNum, 'EXTERNAL_URL', `External URL found: ${url}`);
            }
        }

        // Check Node-only imports inside src/
        if (filePath.startsWith(SRC_DIR)) {
            if (/from\s+['"](fs|path|crypto|sqlite3|better-sqlite3|express|child_process)['"]/.test(lineText)) {
                addIssue('CRITICAL', filePath, lineNum, 'NODE_IMPORT_IN_FRONTEND', `Node.js module imported in browser/Android code: ${lineText.trim()}`);
            }
            if (/process\.env\./.test(lineText) && !lineText.includes('NODE_ENV')) {
                addIssue('WARNING', filePath, lineNum, 'PROCESS_ENV', `Direct process.env usage may crash Vite/Android WebView: ${lineText.trim()}`);
            }
            if (/@google\/genai/.test(lineText)) {
                addIssue('CRITICAL', filePath, lineNum, 'CLOUD_AI_SDK', `Direct @google/genai import in frontend requires internet & exposes API keys`);
            }
        }
    });
}

// 2. Scan Assets for Heavy Images (>300KB) that crash low-RAM phones
walkDir(SRC_DIR, (filePath) => {
    scanCodeFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    if (['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(ext)) {
        const stats = fs.statSync(filePath);
        if (stats.size > 300 * 1024) {
            const sizeKB = Math.round(stats.size / 1024);
            report.summary.heavyAssetsFound.push({ file: path.relative(ROOT, filePath), sizeKB });
            addIssue('WARNING', filePath, 0, 'HEAVY_IMAGE', `Large image (${sizeKB} KB) will slow down low-RAM Android devices`);
        }
    }
});

if (fs.existsSync(path.join(ROOT, 'index.html'))) {
    scanCodeFile(path.join(ROOT, 'index.html'));
}

// 3. Extract All Backend Routes from server.ts & server/
const serverRoutes = [];
const routeRegex = /\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
[path.join(ROOT, 'server.ts'), ...(() => {
    const list = [];
    walkDir(SERVER_DIR, (f) => list.push(f));
    return list;
})()].forEach((serverFile) => {
    if (!fs.existsSync(serverFile)) return;
    const content = fs.readFileSync(serverFile, 'utf8');
    let match;
    while ((match = routeRegex.exec(content)) !== null) {
        serverRoutes.push(`${match[1].toUpperCase()} ${match[2]}`);
    }
});
report.summary.serverRoutesDefined = [...new Set(serverRoutes)];

// 4. Audit Android Configuration
const manifestPath = path.join(ANDROID_DIR, 'app/src/main/AndroidManifest.xml');
if (fs.existsSync(manifestPath)) {
    const manifest = fs.readFileSync(manifestPath, 'utf8');
    if (!manifest.includes('RECORD_AUDIO')) {
        addIssue('WARNING', manifestPath, 0, 'ANDROID_PERMISSION', 'Missing RECORD_AUDIO permission for Sindhi voice parsing');
    }
}

const varsGradlePath = path.join(ANDROID_DIR, 'variables.gradle');
if (fs.existsSync(varsGradlePath)) {
    const gradle = fs.readFileSync(varsGradlePath, 'utf8');
    const minSdkMatch = gradle.match(/minSdkVersion\s*=\s*(\d+)/);
    if (minSdkMatch && Number(minSdkMatch[1]) > 23) {
        addIssue('WARNING', varsGradlePath, 0, 'ANDROID_SDK', `minSdkVersion is ${minSdkMatch[1]} (Android ${Number(minSdkMatch[1]) - 19}+). Lowering to 23 supports older budget phones.`);
    }
}

// Save & Print Report
const outPath = path.join(ROOT, 'FULL_PROJECT_AUDIT_REPORT.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

console.log('\n======================================================');
console.log('   BOLMIZAN COMPLETE OFFLINE ANDROID AUDIT REPORT');
console.log('======================================================');
console.log(`Files Scanned      : ${report.summary.totalFilesScanned}`);
console.log(`Critical Blockers  : ${report.summary.criticalBlockers}`);
console.log(`Warnings           : ${report.summary.warnings}`);
console.log(`Frontend API Calls : ${report.summary.apiEndpointsFound.length}`);
console.log(`Backend Routes     : ${report.summary.serverRoutesDefined.length}`);
console.log(`Heavy Images       : ${report.summary.heavyAssetsFound.length}`);
console.log('------------------------------------------------------');
console.log('Full detailed report saved to: FULL_PROJECT_AUDIT_REPORT.json\n');
