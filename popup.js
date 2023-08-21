async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };

    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

fetch('https://iu-isef01-functionapp.azurewebsites.net/api/GetCourses?').then(r => r.text()).then(result => {
    console.log(result);
})

getCurrentTab()
    .then((data) => {
        console.log('newdata', data)
        var url = data.url;
        var split = url.split("/");
        console.log();
        document.getElementById('course').value = split[4];

        if (split[5] == "books") {
            document.getElementById('documenttype').value = "Skript";
        };
    });

