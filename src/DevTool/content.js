document.addEventListener("DOMContentLoaded", () => {
    console.log("loaded from content script: " + document.location.href);
    alert("from DOMContentLoaded");
});
alert(document.location.href);
prompt("DevTools");