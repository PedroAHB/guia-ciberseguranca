// Permite usar a roda do mouse (scroll vertical) para rolar
// horizontalmente a barra de abas superior quando o cursor esta sobre ela.
document.addEventListener("DOMContentLoaded", function () {
  var tabsList = document.querySelector(".md-tabs__list");
  if (!tabsList) {
    return;
  }

  tabsList.addEventListener(
    "wheel",
    function (event) {
      if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        event.preventDefault();
        tabsList.scrollLeft += event.deltaY;
      }
    },
    { passive: false }
  );
});
