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
        .then(response => {return response});
}

function addOptionSelect(select_id, value) {
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

document.getElementById('course').addEventListener('change', async function () {
    var selected_course_shortname = document.getElementById('course').value;
    var course = await getCourseByShortname(selected_course_shortname);
    localStorage.setItem('course_id', course.id);
});

document.getElementById('documenttype').addEventListener('change', async function () {
    document.getElementById('title').innerHTML = '';
    var selected_course_name = document.getElementById('course').value;
    if (selected_course_name != " ") { // Still need to add actions when no course is selected
        var course_documents = await getDocumentsByCourse(localStorage.getItem('course_id'));
        for (var i = 0; i < course_documents.length; i++) {
            if ((course_documents[i].doctype).toUpperCase() == (document.getElementById('documenttype').value).toUpperCase()) {
                addOptionSelect('title', course_documents[i].title)
            }
        };
    }
});

document.getElementById('title').addEventListener('change', async function () {
    //write document to local storage
});

document.getElementById('submit').addEventListener('click', async function () {
    document.getElementById('error').hidden = true;
    console.log(document.getElementById('description').value)
    if (document.getElementById('course').value != " ") {
        if (document.getElementById('documenttype').value != "") {
            if (document.getElementById('title').value != "") {
                if (document.getElementById('tickettype').value != "") {
                    if (document.getElementById('description').value != ""){
                        response = await createTicket(
                            author_id = localStorage.getItem('user_id'),
                            course_id = localStorage.getItem('course_id'),
                            document_id = // get document_id from localstorage,
                            ticket_type = document.getElementById('tickettype').value,
                            description = document.getElementById('description').value
                        );
                        // Upload von Anhängen
                        if (response.status != 200) {
                            printError("Fehler beim erstellen der Meldung!")
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
    if (split_current_url[4]) { // Still need to check if course is actually valid (in case URL is shit)
        var course_shortname = split_current_url[4];
        addOptionSelect('course', course_shortname);
        document.getElementById('course').dispatchEvent(new Event("change"));
        var course_documents = await getDocumentsByCourse(localStorage.getItem('course_id'));
        if (split_current_url[5] == "books") {
            document.getElementById('documenttype').value = "Script";
            for (var i = 0; i < course_documents.length; i++) {
                if ((course_documents[i].doctype).toUpperCase() == (document.getElementById('documenttype').value).toUpperCase()) {
                    addOptionSelect('title', course_documents[i].title)
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

