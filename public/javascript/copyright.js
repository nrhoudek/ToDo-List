let date = new Date();
let currentYear = date.getFullYear();

const copyrightYear = document.querySelector("[data-copyright]");
copyrightYear.innerText = `© ${currentYear} Nick Houdek`;