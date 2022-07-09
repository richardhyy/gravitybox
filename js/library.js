class Library {
    ITEM_TEMPLATE = `
        <li class="d-flex justify-content-between p-1 mb-1" onclick="library.loadItem('{{name}}')">
            <img src="{{thumbnail}}" class="library-item-thumbnail m-2" alt="Thumbnail of {{name}}">
            <div class="library-item-detail ms-1 mt-1">
                <div class="fs-5">{{name}}</div>
                <div>
                    <span class="text-muted">File info:</span>
                    <br>
                    <span class="text-muted"><i class="bi bi-box"></i> {{model_size}}</span>
                    &nbsp;
                    <span class="text-muted"><i class="bi bi-bullseye"></i> {{gravity_field_size}}</span>
                </div>
            </div>
        </li>`;
    INDEX_URL = '/resources/samples/list.json';
    LIBRARY_LIST_ID = 'library-items';
    items = [];
    selected = null;

    constructor() {
        this.fetchItems();
    }

    fetchItems() {
        clearInnerAndShowSpinner(this.LIBRARY_LIST_ID, false);

        $.ajax({
            url: this.INDEX_URL,
            dataType: 'json',
            success: (data) => {
                this.items = data;
                this.render();

                // Check if there is a selected item in url
                let selected = this.getItemFromUrlParam();
                if (selected) {
                    this.loadItem(selected);
                }
            },
            error: (xhr, status, error) => {
                $('#' + this.LIBRARY_LIST_ID).html(`<div class="text-center">
                    <i class="fs-4 bi bi-cloud-slash"></i><br>
                    Samples currently not available<br>
                    <span class="text-muted small">${error}</span>
                    </div>`);
                console.log(error);
            }
        });
    }

    render() {
        let libraryItemList = document.getElementById(this.LIBRARY_LIST_ID);
        libraryItemList.innerHTML = '';

        // items is a dictionary of {name: data}
        for (let name in this.items) {
            let item = this.items[name];
            let itemTemplate = this.ITEM_TEMPLATE;
            itemTemplate = itemTemplate.replace('{{thumbnail}}', item.thumbnail);
            itemTemplate = itemTemplate.replaceAll('{{name}}', name);
            itemTemplate = itemTemplate.replace('{{model_size}}', item.files.model.size);
            itemTemplate = itemTemplate.replace('{{gravity_field_size}}', item.files.gravity_field.size);
            libraryItemList.innerHTML += itemTemplate;
        }
    }

    /**
     * Set url parameter to target at currently selected item
     */
    setUrlParam() {
        let url = new URL(window.location.href);
        url.searchParams.set('s', this.selected);
        window.history.pushState({}, '', url.href);
    }

    /**
     * Get library item from url parameter
     * @returns {string}
     */
    getItemFromUrlParam() {
        let url = new URL(window.location.href);
        return url.searchParams.get('s');
    }

    loadItem(name) {
        this.selected = name;
        this.setUrlParam();

        let item = this.items[name];
        let model = item.files.model;
        let gravityField = item.files.gravity_field;

        // load model
        fetchFile(model.url, 'blob', (data) => {
            visualization.loadModelFromLocal(data);
        }, (error) => {
            showErrorToast(`Failed to load model (${name})`);
        });

        // load gravity field
        fetchFile(gravityField.url, 'text', (data) => {
            visualization.parseAndLoadGravityField(data).then(r => {
                showSuccessToast(`Successfully loaded ${name}`);
            });
        }, (error) => {
            showErrorToast(`Failed to load gravity field (${name})`);
        });

        // hide library offcanvas
        libraryOffcanvas.hide();
        showToast(`Loading ${name}, this may take a while.`);
    }
}