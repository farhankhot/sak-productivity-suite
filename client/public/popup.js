console.log("SAK productivity-suite init");
window.onload = function () {
    document.getElementById("getLinkedInCookiesButton").onclick = function () {

        chrome.cookies.getAll({ url: "https://www.linkedin.com/feed/" }, (cookie) => {
                        
            fetch("https://sak-productivity-suite.herokuapp.com/save-cookie", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    cookie: cookie
                })
            })
            .then( (response) => response.json())
            .then( (data) => {
                const sessionId = data.session_id;
                const dashboardButton = document.createElement("button");
                dashboardButton.textContent = "Open Dashboard";

                // TODO: Authentication (Only allow access if the cookies exist/are valid)
                dashboardButton.onclick = function () {
                    chrome.tabs.create({ 
                        url: `http://localhost:3000/?sessionId=${sessionId}`
                    });
                }
                document.body.appendChild(dashboardButton);
            }); 
        });
    }

};

