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


document.addEventListener('DOMContentLoaded', () => {
  console.log('Adding custom tab to sidebar...🪸');
  // Find the <sl-sidebar-state-persist> container
  const persist = document.querySelector('sl-sidebar-state-persist');
  if (!persist) return;

  // Create a new ul with your desired class and content
  function addCustomUl() {
    const customUl = document.createElement('ul');
    customUl.className = 'tab-list tabbed-sidebar astro-3x5efdbn astro-6yyweqw4';
    customUl.setAttribute('role', 'tablist');

    customUl.innerHTML = `
      <li class="tab-item astro-3x5efdbn" role="presentation">
        <a href="#__tab-custom" class="tab-link" aria-selected="false" role="tab" id="customtab0">
          <svg aria-hidden="true" class="icon astro-3x5efdbn astro-35nr2byd" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="--sl-icon-size: 1em;">
            <circle cx="12" cy="12" r="10" fill="white"/>
            <text x="12" y="16" text-anchor="middle" font-size="10" fill="#222">New</text>
          </svg>
          Custom Tab
        </a>
      </li>
    `;

    // Insert before the first .top-level ul
    const firstUl = persist.querySelector('.top-level');
    if (firstUl) {
      persist.insertBefore(customUl, firstUl);
    } else {
      persist.appendChild(customUl);
    }
  }

  addCustomUl();
});