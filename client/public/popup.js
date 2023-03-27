// Basically, this script is required for the extension to work, without it the LinkedInCookie.js's chrome cookies API returns ""

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
                
                const dashboardButton = document.createElement("button");
                dashboardButton.textContent = "Open Dashboard";
                
                // Go to https://sak-productivity-suite.herokuapp.com/profile-search
                dashboardButton.onclick = function () {
                    chrome.tabs.create({ url: 'https://sak-productivity-suite.herokuapp.com/profile-search' });
                }
                document.body.appendChild(dashboardButton);
            }); 
        });
    }

};

