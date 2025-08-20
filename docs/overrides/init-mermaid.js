window.addEventListener("load", () => {
  if (window.mermaid) {
    console.log("Mermaid version:", mermaid.version);
    mermaid.initialize({
      startOnLoad: true,
      theme: "neo-dark"
    });
  } else {
    console.error("Mermaid not loaded");
  }
});
