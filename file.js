// file.js

let emojiRules = [];

// --- LOAD EMOJI RULES --- //
async function loadEmojiRules() {
    try {
        const res = await fetch("./emoji.json");
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();

        // normalize: all keywords to lowercase
        emojiRules = data.map(rule => ({
            keyword: String(rule.keyword || "").toLowerCase(),
            emoji: String(rule.emoji || "📦")
        }));

        console.log("Loaded emoji rules:", emojiRules);
    } catch (err) {
        console.error("Could not load emoji.json:", err);
        emojiRules = []; // fall back to default icon later
    }
}

// --- SIZE FORMATTER --- //
function formatSize(bytes) {
    const units = ["BIT", "B", "KB", "MB", "GB", "TB"];

    if (!Number.isFinite(bytes) || bytes <= 0) return "0 BIT";

    let i = 1;
    let size = bytes;

    while (size >= 1024 && i < units.length - 1) {
        size /= 1024;
        i++;
    }

    size = (size % 1 === 0) ? size.toString() : size.toFixed(1);
    return size + " " + units[i];
}

// --- EMOJI PICKER --- //
function getIcon(name, tags) {
    const tagList = Array.isArray(tags) ? tags : [];
    const searchText =
        (String(name) + " " + tagList.join(" ")).toLowerCase();

    // try emoji rules from emoji.json
    for (const rule of emojiRules) {
        if (!rule.keyword) continue;
        if (searchText.includes(rule.keyword)) {
            return rule.emoji;
        }
    }

    // fallback default icon
    return "📦";
}

// --- CREATE FILE CARD --- //
function createFileElement(file, exists, sizeBytes) {
    const tags = Array.isArray(file.tags) ? file.tags : [];

    const fileDiv = document.createElement("div");
    fileDiv.className = "file";
    fileDiv.dataset.tags = tags.join(",");

    const icon = document.createElement("span");
    icon.className = "icon";
    icon.textContent = getIcon(file.name, tags);

    const filenameMark = document.createElement("mark");
    filenameMark.className = "filename";
    filenameMark.textContent = exists
        ? file.name
        : `${file.name} [ NOT FOUND ]`;

    const sizeMark = document.createElement("mark");
    sizeMark.className = "filesize";
    sizeMark.textContent = exists ? formatSize(sizeBytes) : "0 BIT";

    const br1 = document.createElement("br");

    const tagContainer = document.createElement("div");
    tagContainer.className = "tags";
    tags.forEach(t => {
        const tagEl = document.createElement("span");
        tagEl.className = "tag";
        tagEl.textContent = t;
        tagContainer.appendChild(tagEl);
    });

    const br2 = document.createElement("br");

    const link = document.createElement("a");
    link.className = "download-btn";
    if (exists) {
        link.href = file.url;
        link.setAttribute("download", "");
        link.textContent = "Download";
    } else {
        link.href = "#";
        link.textContent = "Unavailable";
    }

    fileDiv.appendChild(icon);
    fileDiv.appendChild(filenameMark);
    fileDiv.appendChild(document.createTextNode(" "));
    fileDiv.appendChild(sizeMark);
    fileDiv.appendChild(br1);
    fileDiv.appendChild(tagContainer);
    fileDiv.appendChild(br2);
    fileDiv.appendChild(link);

    return fileDiv;
}

// --- HEAD CHECK FOR FILE SIZE --- //
async function checkFile(file) {
    try {
        const res = await fetch(file.url, { method: "HEAD" });

        if (!res.ok) {
            return { exists: false, size: 0 };
        }

        const len = res.headers.get("Content-Length");
        const size = len ? Number(len) : 0;
        return { exists: true, size };
    } catch (err) {
        console.error("HEAD failed for", file.url, err);
        return { exists: false, size: 0 };
    }
}

// --- LOAD FILES + EMOJI RULES --- //
async function loadFiles() {
    const container = document.getElementById("file-container");
    if (!container) return;

    container.innerHTML = "";

    try {
        // 1) load emoji rules first
        await loadEmojiRules();

        // 2) then load files
        const response = await fetch("./files.json");
        if (!response.ok) throw new Error("HTTP " + response.status);

        const files = await response.json();
        console.log("Loaded files:", files);

        for (const file of files) {
            const info = await checkFile(file);
            const el = createFileElement(file, info.exists, info.size);
            container.appendChild(el);
        }
    } catch (err) {
        console.error("Error loading files.json:", err);
        container.innerHTML = `
            <div class="file">
                <strong>Could not load <code>files.json</code>.</strong><br>
                Check the console (F12 → Console) for details.
            </div>
        `;
    }
}

document.addEventListener("DOMContentLoaded", loadFiles);
