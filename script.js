const usernameInput = document.getElementById("usernameInput");
const searchBtn = document.getElementById("searchBtn");
const loader = document.getElementById("loader");
const resultContainer = document.getElementById("resultContainer");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const dateTime = document.getElementById("dateTime");

document.addEventListener("DOMContentLoaded", () => {
    usernameInput.focus();
    loadHistory();
    updateDateTime();

    setInterval(updateDateTime, 1000);
});

searchBtn.addEventListener("click", searchProfile);

usernameInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        searchProfile();
    }
});

clearHistoryBtn.addEventListener("click", () => {
    localStorage.removeItem("githubHistory");
    loadHistory();
});

function updateDateTime() {
    const now = new Date();

    dateTime.textContent =
        now.toLocaleDateString() +
        " | " +
        now.toLocaleTimeString();
}

async function searchProfile() {

    const username = usernameInput.value.trim();

    if (!username) {
        showError("Please enter a GitHub username.");
        return;
    }

    toggleLoading(true);

    try {

        const response = await fetch(
            `https://api.github.com/users/${username}`
        );

        if (response.status === 404) {
            throw new Error("User not found.");
        }

        if (!response.ok) {
            throw new Error("GitHub API error.");
        }

        const data = await response.json();

        renderProfile(data);

        saveHistory(username);

    } catch (error) {

        if (error.message === "Failed to fetch") {
            showError("Network connection failed.");
        } else {
            showError(error.message);
        }

    } finally {
        toggleLoading(false);
    }
}

function toggleLoading(isLoading) {

    loader.classList.toggle("hidden", !isLoading);

    searchBtn.disabled = isLoading;
}

function renderProfile(user) {

    resultContainer.innerHTML = `
    
    <div class="profile-card">

        <div class="profile-top">

            <img src="${user.avatar_url}" alt="${user.login}">

            <div class="profile-info">

                <h2>${user.name || "No Name Available"}</h2>

                <p>@${user.login}</p>

                <p>${user.bio || "No bio available."}</p>

                <p>📍 ${user.location || "Not Available"}</p>

                <p>
                📅 Joined:
                ${new Date(user.created_at).toLocaleDateString()}
                </p>

                <div class="stats">

                    <div class="stat">
                        <h3>${user.followers}</h3>
                        <p>Followers</p>
                    </div>

                    <div class="stat">
                        <h3>${user.following}</h3>
                        <p>Following</p>
                    </div>

                    <div class="stat">
                        <h3>${user.public_repos}</h3>
                        <p>Repositories</p>
                    </div>

                </div>

                <div class="buttons">

                    <a
                        href="${user.html_url}"
                        target="_blank"
                        class="btn"
                    >
                        Open GitHub Profile
                    </a>

                    <button
                        class="btn"
                        onclick="copyProfileUrl('${user.html_url}')"
                    >
                        Copy Profile URL
                    </button>

                </div>

            </div>

        </div>

    </div>
    
    `;
}

function showError(message) {

    resultContainer.innerHTML = `
    
    <div class="error-card">
        <h3>Error</h3>
        <p>${message}</p>
    </div>
    
    `;
}

function copyProfileUrl(url) {

    navigator.clipboard.writeText(url);

    alert("Profile URL copied successfully!");
}

function saveHistory(username) {

    let history =
        JSON.parse(
            localStorage.getItem("githubHistory")
        ) || [];

    history = history.filter(
        item => item !== username
    );

    history.unshift(username);

    history = history.slice(0, 5);

    localStorage.setItem(
        "githubHistory",
        JSON.stringify(history)
    );

    loadHistory();
}

function loadHistory() {

    const history =
        JSON.parse(
            localStorage.getItem("githubHistory")
        ) || [];

    historyList.innerHTML = "";

    history.forEach(username => {

        const li = document.createElement("li");

        li.textContent = username;

        li.addEventListener("click", () => {

            usernameInput.value = username;

            searchProfile();
        });

        historyList.appendChild(li);
    });
}