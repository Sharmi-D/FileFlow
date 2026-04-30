function togglemenu(){
    const menu = document.querySelector(".nav-links");
    const icon = document.querySelector(".hamburger-icon");
    icon.classList.toggle("open");
    menu.classList.toggle("open");
}

function dropdown(){
    const arrowdown = document.querySelector('.drop-down');
    const submenu = document.querySelector('.sub-menu');
    arrowdown.classList.toggle('submenu-opened');
    submenu.classList.toggle('submenu-opened');
}

