// Mantém a navegação horizontal acessível após carregamentos instantâneos.
function setupTabsScroll() {
  const tabsList = document.querySelector(".md-tabs__list");
  if (!tabsList) {
    return;
  }

  const tabsInner = tabsList.closest(".md-tabs__inner");

  function updateOverflowIndicators() {
    const maxScroll = tabsList.scrollWidth - tabsList.clientWidth;
    const hasOverflow = maxScroll > 1;

    tabsInner?.classList.toggle(
      "md-tabs__inner--can-scroll-left",
      hasOverflow && tabsList.scrollLeft > 1
    );
    tabsInner?.classList.toggle(
      "md-tabs__inner--can-scroll-right",
      hasOverflow && tabsList.scrollLeft < maxScroll - 1
    );
  }

  // Evita registrar listeners duplicados a cada navegação instantânea.
  if (tabsList.dataset.horizontalScrollReady !== "true") {
    tabsList.dataset.horizontalScrollReady = "true";

    tabsList.addEventListener(
      "wheel",
      function (event) {
        const maxScroll = tabsList.scrollWidth - tabsList.clientWidth;
        if (
          maxScroll <= 1 ||
          Math.abs(event.deltaY) <= Math.abs(event.deltaX)
        ) {
          return;
        }

        const movingRight = event.deltaY > 0;
        const canMove =
          (movingRight && tabsList.scrollLeft < maxScroll - 1) ||
          (!movingRight && tabsList.scrollLeft > 1);

        if (canMove) {
          event.preventDefault();
          tabsList.scrollLeft += event.deltaY;
        }
      },
      { passive: false }
    );

    tabsList.addEventListener("scroll", updateOverflowIndicators, {
      passive: true,
    });
    window.addEventListener("resize", updateOverflowIndicators, {
      passive: true,
    });
  }

  updateOverflowIndicators();
}

if (typeof document$ !== "undefined") {
  document$.subscribe(setupTabsScroll);
} else if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupTabsScroll);
} else {
  setupTabsScroll();
}
