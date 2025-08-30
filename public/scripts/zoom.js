document.addEventListener('DOMContentLoaded', () => {
  // Helper: Create the zoom icon button
  function createZoomIcon() {
    const btn = document.createElement('button');
    btn.setAttribute('aria-roledescription', 'zoom');
    btn.setAttribute('title', 'Zoom diagram');
    btn.style.position = 'absolute';
    btn.style.top = '8px';
    btn.style.right = '8px';
    btn.style.background = 'rgba(24,24,24,0.92)';
    btn.style.border = 'none';
    btn.style.borderRadius = '50%';
    btn.style.width = '32px';
    btn.style.height = '32px';
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.cursor = 'pointer';
    btn.style.zIndex = '10';
    btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.18)';
    btn.style.transition = 'background 0.2s';

    btn.onmouseenter = () => btn.style.background = 'rgba(44,44,44,1)';
    btn.onmouseleave = () => btn.style.background = 'rgba(24,24,24,0.92)';

    btn.innerHTML = `
      <svg width="18" height="18" fill="white" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5
          6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5
          4.99c.41.41 1.09.41 1.5 0s.41-1.09 0-1.5l-4.99-5zm-6
          0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5
          11.99 14 9.5 14z"/>
      </svg>
    `;
    return btn;
  }

  // Helper: Create close (cross) icon button
  function createCloseIcon() {
    const btn = document.createElement('button');
    btn.setAttribute('aria-label', 'Close zoom');
    btn.style.position = 'absolute';
    btn.style.top = '32px';
    btn.style.left = '32px';
    btn.style.background = 'rgba(34,34,34,0.92)';
    btn.style.border = 'none';
    btn.style.borderRadius = '50%';
    btn.style.width = '44px';
    btn.style.height = '44px';
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.cursor = 'pointer';
    btn.style.zIndex = '10001';
    btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.18)';
    btn.style.transition = 'background 0.2s';

    btn.onmouseenter = () => btn.style.background = 'rgba(54,54,54,1)';
    btn.onmouseleave = () => btn.style.background = 'rgba(34,34,34,0.92)';

    btn.innerHTML = `
      <svg width="22" height="22" fill="white" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12l-4.89 4.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.89a1 1 0 0 0 1.41-1.41L13.41 12l4.89-4.89a1 1 0 0 0 0-1.4z"/>
      </svg>
    `;
    return btn;
  }

  // Helper: Create zoom in/out buttons
  function createZoomControl(sign, ariaLabel) {
    const btn = document.createElement('button');
    btn.setAttribute('aria-label', ariaLabel);
    btn.style.background = 'rgba(34,34,34,0.92)';
    btn.style.border = 'none';
    btn.style.borderRadius = '50%';
    btn.style.width = '44px';
    btn.style.height = '44px';
    btn.style.display = 'flex';
    btn.style.alignItems = 'center';
    btn.style.justifyContent = 'center';
    btn.style.cursor = 'pointer';
    btn.style.margin = '0 8px';
    btn.style.zIndex = '10001';
    btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.18)';
    btn.style.transition = 'background 0.2s';

    btn.onmouseenter = () => btn.style.background = 'rgba(54,54,54,1)';
    btn.onmouseleave = () => btn.style.background = 'rgba(34,34,34,0.92)';

    btn.innerHTML = `
      <span style="color:white;font-size:2rem;line-height:1;">${sign}</span>
    `;
    return btn;
  }

  // Helper: Create modal overlay with zoom and pan
  function createModal(svg) {
    if (window.innerWidth < 1024) return null;

    let scale = 1;
    let pan = { x: 0, y: 0 };
    let isPanning = false;
    let start = { x: 0, y: 0 };

    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(10, 10, 10, 0.98)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = 10000;
    overlay.style.cursor = isPanning ? 'grabbing' : 'grab';
    overlay.style.overflow = 'hidden';
    overlay.style.transition = 'background 0.3s';

    // Container for pan/zoom
    const svgContainer = document.createElement('div');
    svgContainer.style.position = 'relative';
    svgContainer.style.overflow = 'auto';
    svgContainer.style.width = '95vw';
    svgContainer.style.height = '95vh';
    svgContainer.style.background = 'transparent';
    svgContainer.style.borderRadius = '12px';
    svgContainer.style.boxShadow = '0 4px 32px rgba(0, 0, 0, 0.7)';
    svgContainer.style.display = 'flex';
    svgContainer.style.alignItems = 'center';
    svgContainer.style.justifyContent = 'center';
    svgContainer.style.cursor = 'grab';

    // Clone the SVG and scale it up
    const svgClone = svg.cloneNode(true);
    svgClone.style.transformOrigin = '0 0';
    svgClone.style.transform = `scale(${scale}) translate(${pan.x}px, ${pan.y}px)`;
    svgClone.style.display = 'block';
    svgClone.style.maxWidth = 'none';
    svgClone.style.maxHeight = 'none';
    svgClone.style.transition = 'transform 0.18s cubic-bezier(.4,2,.6,1)';

    svgContainer.appendChild(svgClone);

    // Pan with mouse drag
    svgContainer.addEventListener('mousedown', (e) => {
      isPanning = true;
      start = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      svgContainer.style.cursor = 'grabbing';
      e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
      if (!isPanning) return;
      pan.x = e.clientX - start.x;
      pan.y = e.clientY - start.y;
      svgClone.style.transform = `scale(${scale}) translate(${pan.x}px, ${pan.y}px)`;
    });
    window.addEventListener('mouseup', () => {
      isPanning = false;
      svgContainer.style.cursor = 'grab';
    });

    // Zoom controls
    function updateZoom(newScale) {
      scale = Math.max(0.2, Math.min(newScale, 8));
      svgClone.style.transform = `scale(${scale}) translate(${pan.x}px, ${pan.y}px)`;
    }

    const zoomInBtn = createZoomControl('+', 'Zoom in');
    zoomInBtn.style.position = 'absolute';
    zoomInBtn.style.top = '32px';
    zoomInBtn.style.right = '88px';
    zoomInBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateZoom(scale * 1.2);
    });

    const zoomOutBtn = createZoomControl('−', 'Zoom out');
    zoomOutBtn.style.position = 'absolute';
    zoomOutBtn.style.top = '32px';
    zoomOutBtn.style.right = '32px';
    zoomOutBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      updateZoom(scale / 1.2);
    });

    // Add close icon
    const closeBtn = createCloseIcon();
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.body.removeChild(overlay);
      window.removeEventListener('mousemove', null);
      window.removeEventListener('mouseup', null);
    });

    overlay.appendChild(svgContainer);
    overlay.appendChild(zoomInBtn);
    overlay.appendChild(zoomOutBtn);
    overlay.appendChild(closeBtn);

    return overlay;
  }

  // Only target SVGs with role="graphics-document document"
  document.querySelectorAll('svg[role="graphics-document document"]').forEach(svg => {
    if (window.innerWidth < 1024) return;

    // Wrap SVG in a relatively positioned div for icon placement
    let wrapper = svg.parentElement;
    if (!wrapper.classList.contains('mermaid-zoom-wrapper')) {
      wrapper = document.createElement('div');
      wrapper.style.position = 'relative';
      wrapper.classList.add('mermaid-zoom-wrapper');
      svg.parentNode.insertBefore(wrapper, svg);
      wrapper.appendChild(svg);
    }

    // Add zoom icon if not already present
    if (!wrapper.querySelector('button[aria-roledescription="zoom"]')) {
      const zoomBtn = createZoomIcon();
      zoomBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const modal = createModal(svg);
        if (modal) document.body.appendChild(modal);
      });
      wrapper.appendChild(zoomBtn);
    }
  });

  // Target images with class="zoomable"
  document.querySelectorAll('img.zoomable').forEach(img => {
    if (window.innerWidth < 1024) return;

    // Wrap IMG in a relatively positioned div for icon placement
    let wrapper = img.parentElement;
    if (!wrapper.classList.contains('image-zoom-wrapper')) {
      wrapper = document.createElement('div');
      wrapper.style.position = 'relative';
      wrapper.style.display = 'inline-block';
      wrapper.classList.add('image-zoom-wrapper');
      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(img);
    }

    // Add zoom icon if not already present
    if (!wrapper.querySelector('button[aria-roledescription="zoom"]')) {
      const zoomBtn = createZoomIcon();
      zoomBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const modal = createModal(img);
        if (modal) document.body.appendChild(modal);
      });
      wrapper.appendChild(zoomBtn);
    }
  });
});