import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: true,
  theme: "dark", // 
  themeVariables: {
    primaryColor: "#1e88e5",
    primaryBorderColor: "#1565c0",
    primaryTextColor: "#fff"
  }
});



document.addEventListener('DOMContentLoaded', () => {
  console.log("Mermaid init script loaded");
  
    // Hide all SVG elements with the 'flowchart' class
    const flowchartsToHide = document.querySelectorAll('svg.flowchart');
    flowchartsToHide.forEach(svg => {
        svg.style.display = 'none';
    });

    // Your existing Mermaid rendering script
    document.querySelectorAll('.flowchart').forEach((element, index) => {
        // Skip if the element is an SVG we just hid
        if (element.tagName.toLowerCase() === 'svg') {
            return;
        }

        const graphDefinition = element.textContent;
        const graphId = `mermaid-${index}`;
        element.innerHTML = `<div class="mermaid" id="${graphId}">${graphDefinition}</div>`;
        
        try {
            // This initializes the newly created div, not the original element
            mermaid.init(undefined, `#${graphId}`);
            console.log(`Mermaid diagram rendered: ${graphId}`);
        } catch (error) {
            console.error("Mermaid diagram rendering error:", error);
            element.innerHTML = `<pre class="mermaid-error">Error rendering diagram: ${error.message}</pre>`;
        }
    });
});