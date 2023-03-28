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
                const encodedCookie = data.cookie;
                const dashboardButton = document.createElement("button");
                dashboardButton.textContent = "Open Dashboard";

                // TODO: Authentication (Only allow access if the cookies exist/are valid)
                dashboardButton.onclick = function () {
                    chrome.tabs.create({ url: `http://localhost:3000/?cookie=${encodedCookie}` });
                }
                document.body.appendChild(dashboardButton);
            }); 
        });
    }

};

