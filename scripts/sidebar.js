document.addEventListener('DOMContentLoaded', () => {
  console.log('All open details elements have been collapsed.');
  document.querySelectorAll('details').forEach((el) => {
    el.removeAttribute('open');
  });
});