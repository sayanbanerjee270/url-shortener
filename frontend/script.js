async function shortenURL() {

    const urlInput = document.getElementById("urlInput");
    const result = document.getElementById("result");

    const url = urlInput.value.trim();

    if (url === "") {
        result.innerHTML = "Please enter a URL.";
        return;
    }

    result.innerHTML = "Shortening...";

    try {

        const response = await fetch("http://localhost:5000/shorten", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                url: url
            })
        });

        const data = await response.json();

        if (!response.ok) {
            result.innerHTML = data.message || "Something went wrong.";
            return;
        }

        result.innerHTML = `
            <p>Your short URL:</p>

            <div class="short-url-container">
                <a href="${data.shortUrl}" target="_blank">
                    ${data.shortUrl}
                </a>

                <button onclick="copyURL('${data.shortUrl}')">
                    Copy
                </button>
            </div>
        `;

    } catch (error) {

        console.error(error);

        result.innerHTML = "Cannot connect to the backend.";
    }
}


async function copyURL(url) {

    try {

        await navigator.clipboard.writeText(url);

        alert("Short URL copied!");

    } catch (error) {

        console.error(error);

        alert("Could not copy URL.");
    }
}

async function loadHistory() {

    const historyList = document.getElementById("historyList");

    try {

        const response = await fetch("http://localhost:5000/urls");

        const urls = await response.json();

        if (urls.length === 0) {

            historyList.innerHTML = `
                <p class="empty-history">
                    No shortened URLs yet.
                </p>
            `;

            return;
        }

        historyList.innerHTML = urls.map(item => `

            <div class="history-card">

                <div class="history-info">

                    <p class="original-url">
                        ${item.originalUrl}
                    </p>

                    <a
                        href="http://localhost:5000/${item.shortCode}"
                        target="_blank"
                    >
                        http://localhost:5000/${item.shortCode}
                    </a>

                    <span class="clicks">
                        ${item.clicks} clicks
                    </span>

                </div>

                <div class="history-actions">

                    <button
                        onclick="copyURL('http://localhost:5000/${item.shortCode}')"
                    >
                        Copy
                    </button>

                    <button
                        onclick="window.open(
                            'http://localhost:5000/${item.shortCode}',
                            '_blank'
                        )"
                    >
                        Open
                    </button>

                </div>

            </div>

        `).join("");

    } catch (error) {

        console.error(error);

        historyList.innerHTML = `
            <p class="empty-history">
                Could not load history.
            </p>
        `;
    }
}

loadHistory();