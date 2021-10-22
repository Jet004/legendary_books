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
    .then(res => res.json())
    .then(data => {
        alert(data)
    })
})

//----------------------------- Author Search -----------------------------//

// Get author search box element so we can create a dynamic search box
const authorSearch = document.getElementById('authorSearch')

// Set event listener for input to search box
authorSearch.addEventListener('input', () => {
    // Get the output element so we can clear values and print new ones
    let authorSearchOutput = document.getElementById('author-search-output')
    // Clear the previous output values
    authorSearchOutput.innerHTML = ''

    // Get the current input value within the search box
    const inputData = authorSearch.value
    
    // TODO: Validate input data
    if(inputData === ''){
        return
    }

    // Send data to backend to retrieve authors matching the given string
    fetch(`/api/authors/search/${inputData}`)
        .then(response => response.json())
        .then(data => {
            // Handle output when no results
            if(data === 'no results'){
                authorSearchOutput.innerHTML += `<div class="output-row">-- No results --</div>`
                // Need to return to prevent the search box being populated with undefined values
                return
            }

            // Populate the search output box
            for(let row of data){
                authorSearchOutput.innerHTML += `<div class="output-row" id="${row.authorID}">${row.firstName} ${row.lastName}</div>`
            }

            // Set event handlers on result rows to populate form with author data when clicked
            // Get all result rows
            let authors = document.querySelectorAll('.output-row')
            for(let author of authors){
                author.addEventListener('click', () => {
                    // Get the data for the selected author
                    let dataToPopulate = data.find(item => item.authorID == author.id)
                    // Get form elements
                    let formElements = document.getElementsByTagName('form')[0].elements
                    // Populate the form with the author's data
                    for(let elem of formElements){
                        if(elem.name){
                            elem.value = dataToPopulate[elem.name]
                        }
                    }
                })
            }

        })
})