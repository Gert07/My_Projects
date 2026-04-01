function loadPage(page) {
  fetch(page)
    .then(response => response.text())
    .then(data => {
      document.getElementById("content").innerHTML = data;
    });
}
//Main Menu
function toggleMenu() {
    document.getElementById("menu").classList.toggle("active");
}
//Second Menu
function toggleMenu2() {
    document.getElementById("menu2").classList.toggle("active");
}
//Submenus
function toggleSubmenu1() {
    document.getElementById("submenu1").classList.toggle("active");
}
//SubMenu
function toggleSubmenu(button) {
  const submenu = button.nextElementSibling;
  submenu.classList.toggle("active");
}