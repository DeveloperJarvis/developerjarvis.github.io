const repos = [
    "DeveloperJarvis/bcalc",
    "DeveloperJarvis/bouncing_circle",
    "DeveloperJarvis/caesar_cipher",
    "DeveloperJarvis/cmd_todo",
    "DeveloperJarvis/digital_clock",
    "DeveloperJarvis/dns",
    "DeveloperJarvis/fct",
    "DeveloperJarvis/file_diff",
    "DeveloperJarvis/hide_in_clear_text",
    "DeveloperJarvis/my_cat",
    "DeveloperJarvis/my_echo",
    "DeveloperJarvis/number_guessing_game",
    "DeveloperJarvis/one_time_pad",
    "DeveloperJarvis/password_validator",
    "DeveloperJarvis/rock_paper_scissors",
    "DeveloperJarvis/string_extractor",
    "DeveloperJarvis/temperature_converter",
    "DeveloperJarvis/text_analyzer",
    "DeveloperJarvis/tic_tac_toe",
];

// Path to the JSON file (replace with correct path if needed)
const reposJsonPath = '/portfolio/data/repos.json';

// Table element where data will be displayed
const table = document.getElementById("repoTable");

let repoData = [];      // Successful GitHub responses
let fallbackData = [];  // For failed fetches

// Default sort settings -> sort by repo name ascending
let currentSort = { column: "name", direction: 1 };

// Function to fetch repo metadata from GitHub API
function fetchRepoData() {
    return Promise.all(
        repos.map(r => fetch(`https://api.github.com/repos/${r}`)
            .then(res => res.ok ? res.json() : null)
            .catch(err => {
                console.error("Network error: ", r, err);
                return null;
            })
        )
    );
}

// Function to fetch the existing repos from the local JSON file
function fetchExistingRepos() {
    return fetch(reposJsonPath)
        .then(response => response.json())
        .catch(err => {
            console.error("Error loading repos.json: ", err);
            return [];
        });
}

// Function to update the repos.json file
function updateReposJson(newRepos) {
    // You need to handle file writing on the server side to update the JSON file
    // This is typically done by sending the new data to a backend server and saving it
    console.log("New repos to add:", newRepos);
    // Example of posting the updated data to the server
    // fetch(reposJsonPath, {
    //   method: 'POST',
    //   body: JSON.stringify(newRepos),
    //   headers: { 'Content-Type': 'application/json' }
    // })
    // .then(response => response.json())
    // .then(data => console.log("Repos updated:", data))
    // .catch(err => console.error("Error updating repos:", err));
}

// Fetch repos, update the JSON and render the table
Promise.all([fetchExistingRepos(), fetchRepoData()])
    .then(([existingRepos, fetchedRepos]) => {
        // Combine the new repos with the existing ones
        const newRepos = fetchedRepos.filter(repo => repo && !existingRepos.some(existingRepo => existingRepo.project === repo.name));

        // Add new repos to the existing data
        const updatedRepos = [...existingRepos, ...newRepos.map(repo => ({
            project: repo.name,
            start_date: repo.created_at.split('T')[0],
            end_date: repo.updated_at.split('T')[0],
            url: repo.html_url
        }))];

        // Sort repos alphabetically by project name
        updatedRepos.sort((a, b) => a.project.localeCompare(b.project));

        // Update the JSON file on the server
        updateReposJson(updatedRepos);

        // Render the table with updated repos
        repoData = updatedRepos;
        renderTable(true);
    })
    .catch(err => console.error("Error fetching repos data:", err));

// Function to render the table with repo data
function renderTable(firstLoad = false) {
    // Remove previous table rows except the header
    table.querySelectorAll("tr:not(:first-child)").forEach(r => r.remove());

    // Sort logic
    repoData.sort((a, b) => {
        let valA, valB;

        switch (currentSort.column) {
            case "name":
                valA = a.project.toLowerCase();
                valB = b.project.toLowerCase();
                break;
            case "created":
                valA = new Date(a.start_date);
                valB = new Date(b.start_date);
                break;
            case "updated":
                valA = new Date(a.end_date);
                valB = new Date(b.end_date);
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
            <td>${data.project}</td>
            <td>${data.start_date}</td>
            <td>${data.end_date}</td>
            <td><a href="${data.url}" target="_blank">${data.url}</a></td>
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

// Function to update sort indicators
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

        // Clicking the same column toggles sort order
        if (currentSort.column === col) {
            currentSort.direction *= -1;
        } else {
            currentSort.column = col;
            currentSort.direction = 1;
        }

        renderTable();
    });
});
