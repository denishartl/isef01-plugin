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

function addOptionSelect(select_id, value) {
    var option_html = '<option value="' + value + '">' + value + '</option>'
    document.getElementById(select_id).insertAdjacentHTML('beforeend', option_html)
}

async function saveCourseId() {
    var selected_course_shortname = document.getElementById('course').value;
    var course = await getCourseByShortname(selected_course_shortname);
    localStorage.setItem('course_id', course.id);
}

async function docTypeSelection() {
    console.log('h')
}


async function documentSelection() {
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
}

document.getElementById('course').addEventListener('change', function () {
    saveCourseId();
    docTypeSelection();
});

document.getElementById('documenttype').addEventListener('change', function () {
    documentSelection();
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

