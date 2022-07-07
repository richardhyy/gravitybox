function paintGeoPattern(class_name = 'geo-pattern') {
    let pattern_divs = document.getElementsByClassName(class_name);
    for (let i = 0; i < pattern_divs.length; i++) {
        let pattern_div = pattern_divs[i];
        let pattern_id = pattern_div.id;
        let pattern_name = pattern_div.innerText;
        let pattern = GeoPattern.generate(`${pattern_name}#${pattern_id}`);
        pattern_div.style.backgroundImage = pattern.toDataUrl();
        pattern_div.innerText = '';
    }
}

function enableTooltip() {
    let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });
}

function showTooltip(elementId) {
    let element = $("#" + elementId);
    new bootstrap.Tooltip(element).show();
}

function enableDrag(selector) {
    $(selector).draggable({
        handle: ".draggable"
    });
}

function enableDismissablePopover(sanitize = true) {
    let popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl, {
            trigger: 'focus',
            html: true,
            sanitize: sanitize,
        })
    });
}

function showPopover(selector) {
    let element = $("#" + elementId);
    let popover = new bootstrap.Popover(element, {
            trigger: 'focus',
            html: true,
            sanitize: true,
            customClass: element.attr('data-bs-custom-class'),
        });
    popover.show();
}

function registerDropdownToggle(selector) {
    let dropdownElementList = [].slice.call(document.querySelectorAll(selector))
    dropdownElementList.map(function (dropdownToggleEl) {
        return new bootstrap.Dropdown(dropdownToggleEl)
    })
}

function clearInnerAndShowSpinner(id, showToast = true) {
    if (showToast) {
        showProcessingToast();
    }
    let el = document.getElementById(id)
    el.innerHTML = `
    <div class="d-flex justify-content-center m-3">
        <div class="spinner-border text-secondary" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>`
}

let _toastTimeout = null;

function showToast(message, additionalClass = ["text-white"], timeout = 3000) {
    let toast = document.getElementById("generic-toast");
    toast.classList.add(...additionalClass);
    document.getElementById("toast-message").innerHTML = message;

    if (_toastTimeout) {
        // clear previous timeout
        clearTimeout(_toastTimeout);
        _toastTimeout = undefined;
    }

    let bsToast = new bootstrap.Toast(toast);
    bsToast.show();

    if (timeout > 0) {
        _toastTimeout = setTimeout(function () {
            bsToast.hide();
            toast.classList.remove(...additionalClass);
            _toastTimeout = undefined;
        }.bind(this), timeout);
    }
}

/**
 * Show tip toast.
 * Requires bootstrap-icons.
 * @param message
 */
function showTipToast(message) {
    showToast("<b class='lh-lg'><i class='bi bi-lightbulb-fill'></i> Tip:</b><br>" + message);
}

function showSuccessToast(message) {
    showToast("<i class='bi bi-check2-circle'></i>&nbsp;&nbsp;" + message);
}

function showErrorToast(message) {
    showToast(message, ['text-white', 'bg-danger']);
}

function showErrorToastAjax(error, defaultMessage) {
    let message = '';
    console.log(error.responseText);
    try {
        let err = JSON.parse(error.responseText);
        message = err.error;
    } catch (e) {
        console.log(e);
        message = defaultMessage;
    }
    showErrorToast(message);
}

function showProcessingToast(text = " Please wait...", timeout = 15000) {
    showToast('<div class="spinner-border spinner-border-sm" role="status"></div> ' + text, ['text-white', 'bg-dark'], timeout);
}


class DownloadIndication {
    DOWNLOAD_TOAST_TEMPLATE = `
    <div id="download-progress-toast{{filename}}" class="toast blur-background" role="alert" aria-live="assertive"
         aria-atomic="true" data-bs-autohide="false">
        <div class="d-flex">
            <div class="toast-body text-white d-flex align-items-center w-100">
                <div class="pt-2">
                    <div class="spinner-border spinner-border-sm" role="status"></div>
                </div>
                <div class="ps-2 w-100">
                    <span>Downloading: </span>
                    <span>{{filename}}</span>
                    <br>
                    <div class="progress bg-secondary" style="height: 1px">
                        <div class="progress-bar bg-info" role="progressbar" id="downloadProgressBar{{filename}}" style="width: 0"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    downloadToast;

    constructor(filename, percent) {
        this.filename = filename;
        this.percent = percent;

        let toastHtml = this.DOWNLOAD_TOAST_TEMPLATE.replaceAll('{{filename}}', filename);
        document.getElementById("toastContainer").insertAdjacentHTML('beforeend', toastHtml);
        let toastDiv = document.getElementById("download-progress-toast" + filename);
        this.downloadToast = new bootstrap.Toast(toastDiv);
        this.downloadToast.show();
    }

    hide() {
        // destroy the toast
        this.downloadToast.hide();
        setTimeout(function () {
            // remove the toast from the DOM
            document.getElementById("download-progress-toast" + this.filename).remove();
        }.bind(this), 1000);
    }

    updateProgress(percent) {
        // Must use native JS to update the progress bar
        let downloadProgressBar = document.getElementById("downloadProgressBar" + this.filename);
        if (isNaN(percent)) {
            // Indeterminate
            downloadProgressBar.style.width = "20%";
            if (!downloadProgressBar.classList.contains("indeterminate-progress")) {
                downloadProgressBar.classList.add("progress-bar-striped", "indeterminate-progress");
            }
        } else {
            downloadProgressBar.style.width = percent + "%";
        }
    }
}
let downloads = [];

function showDownloadingToast(filename, percent) {
    let download = downloads.find(d => d.filename === filename);
    if (!download) {
        download = new DownloadIndication(filename, percent);
        downloads.push(download);
    } else {
        download.updateProgress(percent);
    }
}

function hideDownloadingToast(filename) {
    let download = downloads.find(d => d.filename === filename);
    if (download) {
        download.hide();
        downloads.splice(downloads.indexOf(download), 1);
    }
}


function toggleButtonStatus(btnId, processing) {
    let btn = document.getElementById(btnId);
    if (processing) {
        btn.disabled = true;
        btn.querySelector('.processing-btn-content').classList.remove('d-none');
        btn.querySelector('.normal-btn-content').classList.add('d-none');
    } else {
        btn.disabled = false;
        btn.querySelector('.processing-btn-content').classList.add('d-none');
        btn.querySelector('.normal-btn-content').classList.remove('d-none');
    }
}

function registerEnterKeyEvent(selector, listener) {
    $(selector).keypress(function (e) {
        const key = e.which;
        if (key === 13) {
            listener();
            return false;
        }
    });
}

let _confirmableDefaultText = {}

function requireConfirm(elementId, onConfirm, defaultText, confirmText = "Confirm?", timeout = 2000) {
    let element = $("#" + elementId);
    let restoreText = function () {
        element.text(_confirmableDefaultText[elementId]);
        element.removeClass("text-white");
        element.removeClass("bg-danger");
    }
    if (element.text() === confirmText) {
        onConfirm();
        restoreText();
    } else {
        _confirmableDefaultText[elementId] = element.text();
        element.text(confirmText);
        element.addClass("bg-danger");
        element.addClass("text-white");

        setTimeout(function () {
            restoreText();
        }, timeout);
    }
}

/**
 * Remove .introduction-flashing class from all elements.
 */
function removeIntroductionFlashing() {
    let elements = document.querySelectorAll(".introduction-flashing");
    elements.forEach(function (element) {
        element.classList.remove("introduction-flashing");
    });
}