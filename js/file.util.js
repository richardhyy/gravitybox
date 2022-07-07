/**
 * Open a file dialog
 * @param onOpen {function} callback function when files are selected
 */
function browseFile(onOpen) {
    let input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = e => {
        onOpen(e.target.files);
    }
    input.click();
}

/**
 * Fetch file from network with progress callback
 * @param url {string} url of the file
 * @param responseType {string} response type of the file
 * @param onComplete {function} callback function when file is loaded
 * @param onError {function} callback function when error occurs
 */
function fetchFile(url, responseType, onComplete, onError) {
    let filename = url.substring(url.lastIndexOf('/') + 1);

    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = responseType;
    xhr.onprogress = ev => {
        let contentLength;
        if (ev.lengthComputable) {
            contentLength = ev.total;
        } else {
            contentLength = parseInt(ev.target.getResponseHeader('x-decompressed-content-length'), 10);
        }
        let percent = ev.loaded / contentLength * 100;
        showDownloadingToast(filename, percent);
    }
    xhr.onreadystatechange = ev => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                onComplete(xhr.response);
            } else {
                onError(xhr.status);
            }
            hideDownloadingToast(filename);
        }
    }
    xhr.onerror = onError;
    xhr.send();
}