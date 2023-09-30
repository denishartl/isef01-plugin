async function getUser(user_id) {
    let url = 'https://iu-isef01-functionapp2.azurewebsites.net/api/getuser?user_id=' + user_id;
    return fetch(url)
        .then(response => response.json())
        .then(responseJson => { return responseJson });
}

async function updateUser(user_id, user_password) {
    let url = 'https://iu-isef01-functionapp2.azurewebsites.net/api/UpdateUser?user_id=' + user_id;
    let body = {
        'password': user_password
    }
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(body)
    })
        .then(response => { return response });
}

function printError(message) {
    document.getElementById('error').innerHTML = message;
    document.getElementById('error').hidden = false;
}


document.getElementById('passwordsubmit').addEventListener('click', async function () {
    document.getElementById('error').hidden = true;
    if (document.getElementById('username').value != "") {
        try {
            var user = await getUser(document.getElementById('username').value);
        }
        catch (error) {
            printError("Benutzername nicht bekannt!")
            return 1;
        }
        if (document.getElementById('password').value != "") {
            if (document.getElementById('password2').value != "") {
                if (document.getElementById('password').value == document.getElementById('password2').value) {
                    // Check if password is equivalent to the old one, if not reset
                    console.log(document.getElementById('password').value)
                    console.log('break')
                    console.log(user.password)
                    if (document.getElementById('password').value != user.password) {
                        updateuser_response = await updateUser(
                            user_id = user.id,
                            user_password = document.getElementById('password').value
                        );
                        if (updateuser_response.status != 200) {
                            printError('Fehler beim Zurücksetzen des Passwort!');
                        }
                        else {
                            document.getElementById('passwordform').submit()
                        }
                    }
                    else {
                        printError('Neues und altes Passwort sind identisch!')
                    }
                }
                else {
                    printError('Die neuen Passwörter sind nicht identisch!')
                }
            }
            else {
                printError("Bitte neues Passwort wiederholen!")
            }
        }
        else {
            printError("Bitte neues Passwort eingeben!")
        };
    }
    else {
        printError("Bitte Benutzernamen eingeben!")
    };
});

