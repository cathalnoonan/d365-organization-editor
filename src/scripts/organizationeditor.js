import "core-js/stable";
import "regenerator-runtime/runtime";

import OrganizationEditor from './organizationeditor.xrm';
import polyFills from './organizationeditor.polyfills.js'

polyFills();

(async function (_public) {

    // Private
    var _entity = {};
    var _attributeMetadata = {};
    var _metadata = {};

    function setEntity(json) {
        _entity = json;
    }

    function setMetadata(json) {
        _metadata = json;

        Object.entries(_metadata.Attributes).forEach(function (entry) {
            let attribute = entry[1];
            if (!attribute.IsValidForUpdate || attribute.AttributeType === "Virtual") {
                return;
            }
            _attributeMetadata[attribute.LogicalName] = attribute;
        });
    }

    function buildTable() {
        const tbody = document.getElementById("tbody");

        Object.entries(_attributeMetadata).sort(function (a, b) {
            if (a[0] < b[0]) {
                return -1;
            }
            if (a[0] > b[0]) {
                return 1;
            }

            // names must be equal
            return 0;
        }).forEach(function (entry) {
            const attribute = mapMetadataAttribute(entry[1]);

            const tr = document.createElement("tr");
            tr.setAttribute("data-metadataid", attribute.metadataId);
            tr.setAttribute("data-logicalname", attribute.logicalName);
            tbody.appendChild(tr);

            const tdDisplayName = document.createElement("td");
            tdDisplayName.innerText = attribute.displayName;
            tr.appendChild(tdDisplayName);

            const tdDescription = document.createElement("td");
            tdDescription.innerText = attribute.description;
            tr.appendChild(tdDescription);

            const tdLogicalName = document.createElement("td");
            tdLogicalName.innerText = attribute.logicalName;
            tr.appendChild(tdLogicalName);

            const tdDataType = document.createElement("td");
            tdDataType.innerText = attribute.type;
            tr.appendChild(tdDataType);

            const tdEdit = document.createElement("td");
            const btnEdit = document.createElement("button");
            btnEdit.innerText = "Edit";
            btnEdit.className = "btn btn-info btn-small";
            btnEdit.onclick = editOnClick;
            btnEdit.setAttribute("data-toggle", "modal");
            btnEdit.setAttribute("data-target", "#modal");
            btnEdit.setAttribute("data-logicalname", attribute.logicalName);
            tdEdit.appendChild(btnEdit);
            tr.appendChild(tdEdit);
        });
    }

    async function editOnClick(evt) {
        const logicalName = evt.target.getAttribute("data-logicalname");
        if (logicalName) {
            const attributeMetadata = _attributeMetadata[logicalName];
            let value = undefined;
            if (_entity[logicalName] !== undefined) {
                value = _entity[logicalName]
            } else if (_entity["_" + logicalName + "_value"] !== undefined) {
                value = _entity["_" + logicalName + "_value"]
            }
            try {
                await buildModal(attributeMetadata, value);
            } catch (err) {
                OrganizationEditor.Xrm.openErrorDialog(err);
            }
        }
    }

    async function buildModal(attributeMetadata, value) {
        // Set logical name attribute
        const modal = document.getElementById("modal");
        modal.setAttribute("data-logicalname", attributeMetadata.LogicalName);
        modal.setAttribute("data-attributetype", attributeMetadata.AttributeType);

        // Set title
        const modalTitle = document.getElementById("modal-title");
        modalTitle.innerText = attributeMetadata.DisplayName.UserLocalizedLabel.Label;

        // Prepare content
        const description = document.getElementById("description");
        description.innerText = attributeMetadata.Description.UserLocalizedLabel.Label;
        const logicalName = document.getElementById("logicalname");
        logicalName.innerText = attributeMetadata.LogicalName;
        const type = document.getElementById("type");
        type.innerText = attributeMetadata.AttributeType;
        const inputContainer = document.getElementById("input-container");
        inputContainer.innerHTML = "";
        const input = await createInputElement(attributeMetadata, value);
        inputContainer.appendChild(input);

        // Wire up the onclick of the Save button
        const modalSave = document.getElementById("btn-modal-save");
        modalSave.onclick = onModalSaveClick;
    }

    async function createInputElement(attributeMetadata, value) {
        switch (attributeMetadata.AttributeType) {
            case "Boolean": {
                const select = document.createElement("select");
                select.className = "form-control";
                const options = await OrganizationEditor.Xrm.getBooleanOptions("organization", attributeMetadata.MetadataId);
                const emptyOption = document.createElement("option");
                emptyOption.text = "-- Select --";
                emptyOption.value = "";
                select.appendChild(emptyOption);
                for (let i = 0; i < options.length; i++) {
                    const option = document.createElement("option");
                    option.text = options[i].Label.UserLocalizedLabel.Label;
                    option.value = options[i].Value;
                    select.appendChild(option);
                }
                if (value !== undefined) {
                    if (value === 1 || value === "1" || value === true || value.toString() === "true") {
                        select.value = "1";
                    } else if (value === 0 || value === "0" || value === false || value.toString() === "false") {
                        select.value = "0";
                    }
                }
                select.onchange = function (evt) {
                    onInputChanged(evt, attributeMetadata);
                }
                return select;
            }

            case "Integer": {
                const input = document.createElement("input");
                input.type = "number";
                input.className = "form-control";
                input.value = value;
                input.onchange = function (ev) {
                    onInputChanged(ev, attributeMetadata);
                }
                return input;
            }

            case "Picklist": {
                const select = document.createElement("select");
                select.className = "form-control";
                const options = await OrganizationEditor.Xrm.getPicklistOptions("organization", attributeMetadata.MetadataId);
                const emptyOption = document.createElement("option");
                emptyOption.text = "-- Select --";
                emptyOption.value = "";
                select.appendChild(emptyOption);
                for (let i = 0; i < options.length; i++) {
                    const option = document.createElement("option");
                    option.text = options[i].Label.UserLocalizedLabel.Label;
                    option.value = options[i].Value;
                    select.appendChild(option);
                }
                if (value !== undefined) {
                    select.value = value.toString();
                }
                select.onchange = function (evt) {
                    onInputChanged(evt, attributeMetadata);
                }
                return select;
            }

            case "Lookup": {
                const div = document.createElement("div");

                const inputId = document.createElement("input");
                inputId.id = "input-id";
                inputId.style.display = "inline-block";
                inputId.className = "form-control col-6";
                inputId.value = value;
                div.appendChild(inputId);

                const selectLogicalName = document.createElement("select");
                selectLogicalName.id = "select-logicalname";
                selectLogicalName.style.display = "inline-block";
                selectLogicalName.className = "form-control col-6";
                attributeMetadata.Targets.forEach(function (element) {
                    const option = document.createElement("option");
                    option.text = element;
                    option.value = element;
                    selectLogicalName.appendChild(option);
                });
                div.appendChild(selectLogicalName);

                inputId.onchange = function (ev) {
                    onLookupChanged(attributeMetadata);
                }
                return div;
            }

            default: {
                const textarea = document.createElement("textarea");
                textarea.setAttribute("rows", "4");
                textarea.onchange = function (evt) {
                    onInputChanged(evt, attributeMetadata);
                };
                textarea.className = "form-control";
                textarea.value = value || "";
                return textarea;
            }
        }

        return input;
    }

    function onInputChanged(evt, attributeMetadata) {
        const input = evt.target;
        const entity = _entity;
        const value = parseValue(input.value, attributeMetadata);
        entity[attributeMetadata.LogicalName] = value;
    }

    async function onLookupChanged(attributeMetadata) {
        const inputId = document.getElementById("input-id");
        const selectLogicalName = document.getElementById("select-logicalname");
        const entity = _entity;
        const id = inputId.value;
        const logicalName = selectLogicalName.value;
        if (!id || id === "" || !logicalName || logicalName === "") {
            entity[attributeMetadata.LogicalName] = null;
        } else {
            const entitySetName = await OrganizationEditor.Xrm.getEntitySetName(logicalName);
            entity[attributeMetadata.LogicalName] = id;
            entity[attributeMetadata.LogicalName + "@odata.bind"] = "/" + entitySetName + "(" + id + ")";
        }
    }

    function parseValue(value, attributeMetadata) {
        switch (attributeMetadata.AttributeType) {
            case "Boolean":
                if (value === undefined || value === null || value === "") {
                    return null;
                }
                return value === "true" || value === 1 || value === "1";

            case "Picklist":
                if (value === undefined || value === null || value === "") {
                    return null;
                }
                return value;

            case "Integer":
                return parseInt(value);

                //case "String":
            default:
                return value;
        }
    }

    async function onModalSaveClick() {
        OrganizationEditor.Xrm.showProgressIndicator("Saving ...");

        const modal = document.getElementById("modal");
        const logicalName = modal.getAttribute("data-logicalname");
        const attributeType = modal.getAttribute("data-attributetype");

        const data = {};
        if (attributeType && attributeType === "Lookup" && _entity[logicalName]) {
            logicalName = logicalName + "@odata.bind";
            data[logicalName] = _entity[logicalName];
        } else {
            data[logicalName] = _entity[logicalName];
        }

        await OrganizationEditor.Xrm.updateRecord("organization", _entity.organizationid, data)
        OrganizationEditor.Xrm.closeProgressIndicator();
    }

    function mapMetadataAttribute(attribute) {
        if (!attribute.MetadataId) {
            attribute.MetadataId = "";
        }

        if (!attribute.DisplayName || !attribute.DisplayName.UserLocalizedLabel || !attribute.DisplayName.UserLocalizedLabel.Label) {
            attribute.DisplayName = {
                UserLocalizedLabel: {
                    Label: ""
                }
            };
        }

        if (!attribute.Description || !attribute.Description.UserLocalizedLabel || !attribute.Description.UserLocalizedLabel.Label) {
            attribute.Description = {
                UserLocalizedLabel: {
                    Label: ""
                }
            };
        }

        if (!attribute.LogicalName) {
            attribute.LogicalName = "";
        }

        if (!attribute.AttributeType) {
            attribute.AttributeType = "";
        }

        return {
            metadataId: attribute.MetadataId,
            displayName: attribute.DisplayName.UserLocalizedLabel.Label,
            description: attribute.Description.UserLocalizedLabel.Label,
            logicalName: attribute.LogicalName,
            type: attribute.AttributeType
        };
    }

    // Initialization code

    OrganizationEditor.Xrm.showProgressIndicator("Loading ...");

    await Promise.all([
        OrganizationEditor.Xrm.getEntityMetadata("organization").then(setMetadata),
        OrganizationEditor.Xrm.retrieveFirst("organization").then(setEntity)
    ]);

    buildTable();
    OrganizationEditor.Xrm.closeProgressIndicator();

}(OrganizationEditor || {}));