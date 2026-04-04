
//Changing div inside text
function loadPage(page, element) {
  fetch(page)
    .then(response => response.text())
    .then(data => {
      document.getElementById("content").innerHTML = data;
    });

  document.querySelectorAll(".menu-link").forEach(btn => {
    btn.classList.remove("active-page");
  });

  // add active to clicked one
  element.classList.add("active-page");
}

//changing div with iframe
function openFrame(page) {
  document.getElementById("myframe").src = page;
}

//Main Menu
document.querySelectorAll(".body-menu-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("active");
    const submenu = btn.nextElementSibling;

    //close others (accordion style)
    document.querySelectorAll(".body-submenu").forEach(m => {
      if (m !== submenu) m.classList.remove("open");
    });

    submenu.classList.toggle("open");
  });
});

//SubMenu
document.querySelectorAll(".body-submenu-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("active");
    const submenu = btn.nextElementSibling;
    submenu.classList.toggle("open");
  });
});