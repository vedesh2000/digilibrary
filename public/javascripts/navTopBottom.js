// goto top and bottom code
window.addEventListener("scroll", function () {
    const goToTopLink = document.getElementById("goToTop");
    const goToBottomLink = document.getElementById("goToBottom");
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrolledFromTop = window.scrollY;
    const scrolledFromBottom = documentHeight - (scrolledFromTop + windowHeight);

    // Toggle visibility for "Go to Top" link
    if (scrolledFromTop > 100) { // You can adjust the value (100) as needed to control when the link becomes visible
        goToTopLink.style.display = "block";
    } else {
        goToTopLink.style.display = "none";
    }

    // Toggle visibility for "Go to Bottom" link
    if (scrolledFromBottom > 100) { // You can adjust the value (100) as needed to control when the link disappears
        goToBottomLink.style.display = "block";
    } else {
        goToBottomLink.style.display = "none";
    }
});