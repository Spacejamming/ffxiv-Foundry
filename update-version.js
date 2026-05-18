const fs = require('fs');
const path = require('path');

// 1. Get the new version from package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const newVersion = packageData.version;

console.log(`Syncing version to v${newVersion} across files...`);

// 2. Update module.json
const moduleJsonPath = path.join(__dirname, 'module.json');
const moduleData = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf8'));

moduleData.version = newVersion;
// Assuming download URL pattern: https://github.com/Spacejamming/ffxiv-Foundry/releases/download/vX.Y.Z/ffxiv-vtt.zip
if (moduleData.download) {
    const urlParts = moduleData.download.split('/');
    // Replace the tag part (second to last element)
    urlParts[urlParts.length - 2] = `v${newVersion}`;
    moduleData.download = urlParts.join('/');
}

fs.writeFileSync(moduleJsonPath, JSON.stringify(moduleData, null, 2) + '\n');
console.log(`Updated module.json to v${newVersion}`);

// 3. Update scripts/module.js
const moduleJsPath = path.join(__dirname, 'scripts', 'module.js');
let moduleJsContent = fs.readFileSync(moduleJsPath, 'utf8');

// Regex to find: export const MODULE_VERSION = "x.y.z";
const versionRegex = /export const MODULE_VERSION = ".*?";/;
if (versionRegex.test(moduleJsContent)) {
    moduleJsContent = moduleJsContent.replace(
        versionRegex, 
        `export const MODULE_VERSION = "${newVersion}";`
    );
    fs.writeFileSync(moduleJsPath, moduleJsContent);
    console.log(`Updated scripts/module.js to v${newVersion}`);
} else {
    console.warn("Could not find MODULE_VERSION export in scripts/module.js");
}

console.log('Version synchronization complete.');
