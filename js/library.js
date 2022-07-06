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
            },
            error: (xhr, status, error) => {
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

    loadItem(name) {
        let item = this.items[name];
        let model = item.files.model;
        let gravityField = item.files.gravity_field;

        showProcessingToast("Downloading model...", 10000);
        // load model
        visualization.loadModel(model.url, name);

        showProcessingToast("Downloading gravity field...", 10000);

        // load gravity field
        $.ajax({
            url: gravityField.url,
            dataType: 'text',
            success: (data) => {
                visualization.parseAndLoadGravityField(data).then(r => {
                    showSuccessToast(`Successfully loaded${name}`);
                });
            }
        })
    }
}