function toggleTheme() {
  // Read the current theme value from the cookie
  var theme = document.cookie.replace(/(?:(?:^|.*;\s*)theme\s*\=\s*([^;]*).*$)|^.*$/, "$1");

  // Toggle the theme value and update the cookie
  if (theme === "light") {
    // Switch to dark theme
    theme = "dark";
    document.cookie = "theme=dark; expires=Thu, 1 Jan 2099 00:00:00 UTC; path=/;";
  } else {
    // Switch to light theme
    theme = "light";
    document.cookie = "theme=light; expires=Thu, 1 Jan 2099 00:00:00 UTC; path=/;";
  }

  // Change the class and styling of the elements based on the updated theme value
  var iconElement = document.querySelector(".theme-toggle i");
  const html = document.querySelector('html');

  if (theme === "light") {
    iconElement.classList.remove("fa-sun");
    iconElement.classList.add("fa-moon");
    iconElement.style.color = "white";
    iconElement.style.fontSize = "40px";
    html.classList.remove("dark-theme");
    html.classList.add("light-theme");
  } else {
    iconElement.classList.remove("fa-moon");
    iconElement.classList.add("fa-sun");
    iconElement.style.color = "orange";
    iconElement.style.fontSize = "40px";
    html.classList.remove("light-theme");
    html.classList.add("dark-theme");
  }
}
  // Read the current theme value from the cookie
  var theme = document.cookie.replace(/(?:(?:^|.*;\s*)theme\s*\=\s*([^;]*).*$)|^.*$/, "$1");

  // Change the class and styling of the elements based on the updated theme value
  var iconElement = document.querySelector(".theme-toggle i");
  const html = document.querySelector('html');

  if (theme === "light") {
    iconElement.classList.remove("fa-sun");
    iconElement.classList.add("fa-moon");
    iconElement.style.color = "white";
    iconElement.style.fontSize = "40px";
    html.classList.remove("dark-theme");
    html.classList.add("light-theme");
  } else {
    iconElement.classList.remove("fa-moon");
    iconElement.classList.add("fa-sun");
    iconElement.style.color = "orange";
    iconElement.style.fontSize = "40px";
    html.classList.remove("light-theme");
    html.classList.add("dark-theme");
  }


  