const { ipcRenderer } = require('electron');

document.querySelector("form").addEventListener("submit", (event) => {
    event.preventDefault();
    console.log("Start parsing");
    ipcRenderer.send('started_parsing', {
        "name": document.querySelector("#script_name").value,
        "script": document.querySelector("#script").value
    });
});
