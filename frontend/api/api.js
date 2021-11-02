document.onload = fetchIncludes()

function fetchIncludes(){
    // Fetch header
    fetch('includes/header.html')
        .then(response => response.text())
        .then(data => {
            let [targetElement] = document.getElementsByTagName('header')
            targetElement.outerHTML = data
        })

    // Fetch navigation
    fetch('includes/nav.html')
        .then(response => response.text())
        .then(data => {
            let [targetElement] = document.getElementsByTagName('nav')
            targetElement.outerHTML = data
        })

    // Fetch footer
    fetch('includes/footer.html')
        .then(response => response.text())
        .then(data => {
            let [targetElement] = document.getElementsByTagName('footer')
            targetElement.outerHTML = data
        })
}