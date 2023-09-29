async function getCurrentTabUrl() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab.url;
}

async function getCourseByShortname(shortname) {
    let url = 'https://iu-isef01-functionapp.azurewebsites.net/api/GetCourseByShortname?shortname=' + shortname;
    return fetch(url)
        .then(response => response.json())
        .then(responseJson => { return responseJson });
}

async function getDocumentsByCourse(course_id) {
    let url = 'https://iu-isef01-functionapp.azurewebsites.net/api/GetDocumentsByCourse?course=' + course_id;
    return fetch(url)
        .then(response => response.json())
        .then(responseJson => { return responseJson });
}

async function createAttachment(ticket_id, filename, file_b64) {
    let url = 'https://iu-isef01-functionapp.azurewebsites.net/api/CreateAttachment?name=' + filename + '&ticket_id=' + ticket_id;
    let body = {
        'file': file_b64
    }
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(body)
    })
        .then(response => { return response });
}

async function getAllCourses() {
    let url = 'https://iu-isef01-functionapp.azurewebsites.net/api/GetCourses';
    return fetch(url)
        .then(response => response.json())
        .then(responseJson => { return responseJson });
}

async function getScriptFromDocumentList(documents) {
    for (var i = 0; i < documents.length; i++) {
        if (documents[i].doctype == 'script') {
            return documents[i];
        }
    }
}

async function getDocumentFromLocalStorageCourses(document_title) {
    var all_documents = JSON.parse(localStorage.getItem('course_documents'));
    for (var i = 0; i < all_documents.length; i++) {
        if (all_documents[i].title == document_title) {
            return all_documents[i]
        }
    }
}

async function createTicket(author_id, course_id, document_id, ticket_type, description) {
    let url = 'https://iu-isef01-functionapp.azurewebsites.net/api/CreateTicket?code=Lwxj3HyBdBta0G9OjlJrpxR-uzple7iu44aXbZ2MHxPCAzFu3pwm3A=='
    let body = {
        'author_id': author_id,
        'course_id': course_id,
        'document_id': document_id,
        'ticket_type': ticket_type,
        'description': description
    }
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(body)
    })
        .then(response => { return response });
}

async function addOptionSelect(select_id, value) {
    var option_html = '<option value="' + value + '">' + value + '</option>'
    document.getElementById(select_id).insertAdjacentHTML('beforeend', option_html)
}

function printError(message) {
    document.getElementById('error').innerHTML = message;
    document.getElementById('error').hidden = false;
}

function printSuccess(message) {
    document.getElementById('success').innerHTML = message;
    document.getElementById('success').hidden = false;
}

document.getElementById('course').addEventListener('clear', function () {
    localStorage.removeItem('course_documents');
    localStorage.removeItem('course_id');
})

document.getElementById('course').addEventListener('change', async function () {
    var selected_course_shortname = document.getElementById('course').value;
    var course = await getCourseByShortname(selected_course_shortname);
    localStorage.setItem('course_id', course.id);
    var course_documents = await getDocumentsByCourse(localStorage.getItem('course_id'));
    localStorage.setItem('course_documents', JSON.stringify(course_documents));
});

document.getElementById('documenttype').addEventListener('change', async function () {
    document.getElementById('title').innerHTML = '';
    var selected_course_name = document.getElementById('course').value;
    if (selected_course_name != " ") { // Still need to add actions when no course is selected
        var course_documents = await getDocumentsByCourse(localStorage.getItem('course_id'));
        for (var i = 0; i < course_documents.length; i++) {
            if ((course_documents[i].doctype).toUpperCase() == (document.getElementById('documenttype').value).toUpperCase()) {
                await addOptionSelect('title', course_documents[i].title)
            }
        };
        document.getElementById('title').dispatchEvent(new Event("change"));
    }
});

document.getElementById('title').addEventListener('clear', function () {
    localStorage.removeItem('document_id');
})

document.getElementById('title').addEventListener('change', async function () {

    var course_document = await getDocumentFromLocalStorageCourses(document.getElementById('title').value);
    localStorage.setItem('document_id', course_document.id);
});

document.getElementById('attachment').addEventListener('change', async function () {
    document.getElementById('error').hidden = true;
    const reader = new FileReader();
    const selectedFile = document.getElementById("attachment").files[0];
    if (selectedFile.size < 4000000) {
        reader.readAsDataURL(selectedFile);
        reader.onload = function (e) {
            localStorage.setItem('attachment_name', selectedFile.name);
            localStorage.setItem('attachment_b64', reader.result.replace(/^.+?;base64,/, ''))
        };
    }
    else {
        printError('Uploads dürfen max. 4MB groß sein!')
    }

});

document.getElementById('submit').addEventListener('click', async function () {
    document.getElementById('error').hidden = true;
    document.getElementById('success').hidden = true;
    if (document.getElementById('course').value != " ") {
        if (document.getElementById('documenttype').value != "") {
            if (document.getElementById('title').value != "") {
                if (document.getElementById('tickettype').value != "") {
                    if (document.getElementById('description').value != "") {
                        var success = 0;
                        response_ticket = await createTicket(
                            author_id = localStorage.getItem('user_id'),
                            course_id = localStorage.getItem('course_id'),
                            document_id = localStorage.getItem('document_id'),
                            ticket_type = document.getElementById('tickettype').value,
                            description = document.getElementById('description').value
                        );
                        document.getElementById('course').value = '';
                        document.getElementById('course').dispatchEvent(new Event("clear"));
                        document.getElementById('documenttype').value = '';
                        document.getElementById('title').value = '';
                        document.getElementById('title').dispatchEvent(new Event("clear"));
                        document.getElementById('tickettype').value = '';
                        document.getElementById('description').value = '';
                        if (response_ticket.status != 200) {
                            success = -1;
                        }
                        if (document.getElementById("attachment").files.length > 0) {
                            response_attachment = await createAttachment(
                                ticket_id = await response_ticket.text(),
                                filename = localStorage.getItem('attachment_name'),
                                file_b64 = localStorage.getItem('attachment_b64')
                            )
                            localStorage.removeItem('attachment_name')
                            localStorage.removeItem('attachment_b64')
                            if (response_attachment.status != 200) {
                                success = -1;
                            }
                        }
                        if (success != 0) {
                            printError('Fehler beim erstellen der Meldung!')
                        }
                        else (
                            printSuccess('Meldung erfolgreich erstellt!')
                        )
                    }
                    else {
                        printError("Bitte Beschreibung ausfüllen!")
                    }
                }
                else {
                    printError('Bitte Meldungsart auswählen!')
                }
            }
            else {
                printError('Bitte Dokumententitel auswählen!')
            }
        }
        else {
            printError("Bitte Dokumentenart auswählen!")
        }
    }
    else {
        printError("Bitte Kurs auswählen!")
    }
});



async function init() {
    var current_url = await getCurrentTabUrl();
    var split_current_url = current_url.split('/');
    if (split_current_url[4]) { // Still need to check if course is actually valid (in case URL is not useful)
        var course_shortname = split_current_url[4];
        addOptionSelect('course', course_shortname);
        document.getElementById('course').dispatchEvent(new Event("change"));
        var course_documents = await getDocumentsByCourse(localStorage.getItem('course_id'));
        if (split_current_url[5] == "books") {
            document.getElementById('documenttype').value = "Script";
            for (var i = 0; i < course_documents.length; i++) {
                if ((course_documents[i].doctype).toUpperCase() == (document.getElementById('documenttype').value).toUpperCase()) {
                    await addOptionSelect('title', course_documents[i].title)
                }
            };

        };
    }
    else {
        var all_courses = await getAllCourses();
        addOptionSelect('course', " ")
        for (var i = 0; i < all_courses.length; i++) {
            addOptionSelect('course', all_courses[i].shortname)
        };
    }
}

init();

