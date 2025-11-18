const repos = [
    "DeveloperJarvis/dns",
    "DeveloperJarvis/hide_in_clear_text",
    "DeveloperJarvis/my_echo",
    "DeveloperJarvis/one_time_pad",
    "DeveloperJarvis/string_extractor"
];

const table = document.getElementById("repoTable");

let repoData = [];

// Default sort settings -> sort by repo name ascending
let currentSort = { column: "name", direction: 1 };

// Fetch data repo metadata from Github API
Promise.all(
    repos.map(r => fetch(`https://api.github.com/repos/${r}`)
        .then(res => {
            if (!res.ok) {
                console.warn("Github API limit reached or missing repo: ", r);
                return null;
            }
            return res.json();
        }))
        .catch(err => {
            console.error("Network error: ", r, err);
            return null;
        })
).then(data => {
    // Filter null entries if Github API failed
    repoData = data.filter(x => x !== null);
    renderTable(true);   // first load → instant fade in
});

function renderTable(firstLoad = false) {
    // Remove previous table rows except the header
    table.querySelectorAll("tr:not(:first-child)").forEach(r => r.remove());

    // Sort logic
    repoData.sort((a, b) => {
        let valA, valB;

        switch (currentSort.column) {
            case "name":
                valA = a.name.toLowerCase();
                valB = b.name.toLowerCase();
                break;
            case "created":
                valA = new Date(a.created_at);
                valB = new Date(b.created_at);
                break;
            case "updated":
                valA = new Date(a.updated_at);
                valB = new Date(b.updated_at);
                break;
        }

        if (valA < valB) return -1 * currentSort.direction;
        if (valA > valB) return 1 * currentSort.direction;
        return 0;
    });

    // Append new sorted rows into table
    repoData.forEach(data => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${data.name}</td>
            <td>${new Date(data.created_at).toLocaleDateString()}</td>
            <td>${new Date(data.updated_at).toLocaleDateString()}</td>
            <td><a href="${data.html_url}" target="_blank">${data.html_url}</a></td>
        `;
        table.appendChild(row);
    });

    // Update sorted column highlight and arrows
    updateSortIndicators();

    // Fade-in animation only once on first load
    if (firstLoad) {
        setTimeout(() => table.classList.add("fade-in"), 50);
    }
}

function updateSortIndicators() {
    document.querySelectorAll("th[data-sort]").forEach(th => {
        th.classList.remove("sort-asc", "sort-desc", "active");

        if (th.dataset.sort === currentSort.column) {
            th.classList.add("active");
            th.classList.add(currentSort.direction === 1 ? "sort-asc" : "sort-desc");
        }
    });
}

// Sorting when clicking a column header
document.querySelectorAll("th[data-sort]").forEach(th => {
    th.addEventListener("click", () => {
        const col = th.dataset.sort;

        // Clicking the same colun toggles sort order
        if (currentSort.column === col) {
            currentSort.direction *= -1;
        } else {
            currentSort.column = col;
            currentSort.direction = 1;
        }

        renderTable();
    });
});