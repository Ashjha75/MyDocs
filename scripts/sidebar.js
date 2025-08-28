document.addEventListener('DOMContentLoaded', () => {
  // Find the sidebar's top-level <ul>
  const ul = document.querySelector('.top-level');
  if (!ul) return;

  // Create the Collapse All button
  const li = document.createElement('li');
  li.style.listStyle = 'none'; // Remove bullet

  li.innerHTML = `
    <button id="collapse-all-btn" title="Collapse All" style="
      background: #222;
      border: none;
      color: white;
      padding: 0.5em 1em;
      border-radius: 0.5em;
      display: flex;
      align-items: center;
      gap: 0.5em;
      font-size: 1em;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
      margin-bottom: 1rem;
    ">
      <span class="icon" style="display:flex;align-items:center;">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M5.23 12.77a1 1 0 0 1 1.41 0L10 16.13l3.36-3.36a1 1 0 1 1 1.41 1.41l-4.06 4.06a1 1 0 0 1-1.41 0l-4.06-4.06a1 1 0 0 1 0-1.41z" fill="white"/>
          <path d="M5.23 7.77a1 1 0 0 1 1.41 0L10 11.13l3.36-3.36a1 1 0 1 1 1.41 1.41l-4.06 4.06a1 1 0 0 1-1.41 0l-4.06-4.06a1 1 0 0 1 0-1.41z" fill="white"/>
        </svg>
      </span>
      <span class="label" style="color:white;letter-spacing:0.03em;">Collapse All</span>
    </button>
  `;

  // Insert as the first element in the ul
  ul.insertBefore(li, ul.firstChild);

  // Add click event to collapse all details
  li.querySelector('#collapse-all-btn').addEventListener('click', () => {
    console.log('All open details elements have been collapsed.');
    document.querySelectorAll('details').forEach((el) => {
      el.removeAttribute('open');
    });
  });
});