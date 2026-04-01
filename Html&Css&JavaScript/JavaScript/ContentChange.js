function loadPage(page) {
  fetch(page)
    .then(response => response.text())
    .then(data => {
      document.getElementById("content").innerHTML = data;
    });
}

function toggleMenu() {
    document.getElementById("menu").classList.toggle("active");
}

function toggleMenu2() {
    document.getElementById("menu2").classList.toggle("active");
}