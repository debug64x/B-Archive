// search.js

document.addEventListener("DOMContentLoaded", () => {
    const input = document.querySelector(".searchbar");
    if (!input) return;

    function applyFilter() {
        const q = input.value.toLowerCase();

        document.querySelectorAll(".file").forEach(fileEl => {
            const nameEl = fileEl.querySelector(".filename");
            const name = nameEl ? nameEl.textContent.toLowerCase() : "";
            const tags = (fileEl.dataset.tags || "").toLowerCase();

            const match = name.includes(q) || tags.includes(q);
            fileEl.style.display = match ? "" : "none";
        });
    }

    input.addEventListener("input", applyFilter);
});
