// Set click event listenter on add author button
document.getElementById('add-author-btn').addEventListener('click', () => {
    // Get form element and convert data to json object
    const form = document.getElementById('author-form')
    const formDataJSON = JSON.stringify(Object.fromEntries(new FormData(form)))

    fetch('/api/authors/add', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: formDataJSON
    })
})