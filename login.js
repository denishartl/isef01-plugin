async function getUser(user_id) {
    let url = 'https://iu-isef01-functionapp.azurewebsites.net/api/getuser?user_id=' + user_id;
    return fetch(url)
        .then(response => response.json())
        .then(responseJson => { return responseJson });
}

function printError(message) {
    document.getElementById('error').innerHTML = message;
    document.getElementById('error').hidden = false;
}


document.getElementById('loginsubmit').addEventListener('click', async function () {
    document.getElementById('error').hidden = true;
    if (document.getElementById('username').value != "") {
        if (document.getElementById('password').value != "") {
            try {
                var user = await getUser(document.getElementById('username').value);
            }
            catch (error) {
                printError("Benutzername nicht bekannt!")
                return 1;
            }
            if (document.getElementById('password').value == user.password) {
                localStorage.setItem('user_id', user.id);
                document.getElementById('loginform').submit();
            }
            else {
                printError("Passwort falsch!")
            }
        }
        else {
            printError("Bitte Passwort eingeben!")
        };
    }
    else {
        printError("Bitte Benutzernamen eingeben!")
    };
});


document.getElementById('saveusername').addEventListener('change', async function () {
    if (document.getElementById('saveusername').checked) {
        localStorage.setItem('saveUsername', true)
    }
    else {
        localStorage.setItem('saveUsername', false)
    }
})

function init() {
    if (localStorage.getItem('saveUsername') == "true") {
        document.getElementById('saveusername').checked = true;
        document.getElementById('username').value = localStorage.getItem('user_id');
    }
}

init()