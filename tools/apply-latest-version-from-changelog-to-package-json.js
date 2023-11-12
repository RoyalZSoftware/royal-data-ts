const fs = require('fs');

function readChangelogFile() {
    const buffer = fs.readFileSync(__dirname + '/../CHANGELOG.md');

    return buffer.toString();
}

function findLatestVersionFromChangelog(changelogData) {
    const regex = /\d*\.\d*\.\d*/;

    return regex.exec(changelogData)[0];
}

function readPackageJson() {
    const buffer = fs.readFileSync(__dirname + '/../package.json');

    return JSON.parse(buffer);
}

function savePackageJson(updatedPackageJson) {
    fs.writeFileSync(__dirname + '/../package.json', JSON.stringify(updatedPackageJson, null, 2));
}

const changelogContent = readChangelogFile();
const latestVesion = findLatestVersionFromChangelog(changelogContent);

const packageJson = readPackageJson();

if (latestVesion == packageJson.version) {
    console.info("Nothing to do");
    return process.exit(1);
}

console.log("Updating version in package.json from " + packageJson.version + " to " + latestVesion);

packageJson.version = latestVesion;

savePackageJson(packageJson);
return process.exit(0);