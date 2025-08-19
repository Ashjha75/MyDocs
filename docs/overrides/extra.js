if (window.innerWidth > 900) { // Typical breakpoint for desktop/web view
  const primary = document.getElementsByClassName('md-sidebar--primary')[0];
  const secondary = document.getElementsByClassName('md-sidebar--secondary')[0];
  if (primary) primary.classList.add('pymdownx-highlight');
  if (secondary) secondary.classList.add('pymdownx-highlight');
}
