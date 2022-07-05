/**
 * Open a file dialog
 * @param onOpen {function} callback function when files are selected
 */
function browseFile(onOpen) {
    let input = document.createElement('input');
    input.type = 'file';
    input.onchange = e => {
        onOpen(e.target.files);
    }
    input.click();
}