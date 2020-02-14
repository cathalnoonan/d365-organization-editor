import OrganizationEditor from './_organizationeditor_xrm';

(function (_public, Xrm, GetGlobalContext) {

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
            var attribute = entry[1];
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
            var attribute = mapMetadataAttribute(entry[1]);

            var tr = document.createElement("tr");
            tr.setAttribute("data-metadataid", attribute.metadataId);
            tr.setAttribute("data-logicalname", attribute.logicalName);
            tbody.appendChild(tr);

            var tdDisplayName = document.createElement("td");
            tdDisplayName.innerText = attribute.displayName;
            tr.appendChild(tdDisplayName);

            var tdDescription = document.createElement("td");
            tdDescription.innerText = attribute.description;
            tr.appendChild(tdDescription);

            var tdLogicalName = document.createElement("td");
            tdLogicalName.innerText = attribute.logicalName;
            tr.appendChild(tdLogicalName);

            var tdDataType = document.createElement("td");
            tdDataType.innerText = attribute.type;
            tr.appendChild(tdDataType);

            var tdEdit = document.createElement("td");
            var btnEdit = document.createElement("button");
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

    function editOnClick(evt) {
        var logicalName = evt.target.getAttribute("data-logicalname");
        if (logicalName) {
            var attributeMetadata = _attributeMetadata[logicalName];
            var value = undefined;
            if (_entity[logicalName] !== undefined) {
                value = _entity[logicalName]
            } else if (_entity["_" + logicalName + "_value"] !== undefined) {
                value = _entity["_" + logicalName + "_value"]
            }
            buildModal(attributeMetadata, value);
        }
    }

    function buildModal(attributeMetadata, value) {
        // Set logical name attribute
        var modal = document.getElementById("modal");
        modal.setAttribute("data-logicalname", attributeMetadata.LogicalName);
        modal.setAttribute("data-attributetype", attributeMetadata.AttributeType);

        // Set title
        var modalTitle = document.getElementById("modal-title");
        modalTitle.innerText = attributeMetadata.DisplayName.UserLocalizedLabel.Label;

        // Prepare content
        var description = document.getElementById("description");
        description.innerText = attributeMetadata.Description.UserLocalizedLabel.Label;
        var logicalName = document.getElementById("logicalname");
        logicalName.innerText = attributeMetadata.LogicalName;
        var type = document.getElementById("type");
        type.innerText = attributeMetadata.AttributeType;
        var inputContainer = document.getElementById("input-container");
        inputContainer.innerHTML = "";
        var input = createInputElement(attributeMetadata, value);
        inputContainer.appendChild(input);

        // Wire up the onclick of the Save button
        var modalSave = document.getElementById("btn-modal-save");
        modalSave.onclick = onModalSaveClick;
    }

    function createInputElement(attributeMetadata, value) {
        switch (attributeMetadata.AttributeType) {
            case "Boolean":
                var select = document.createElement("select");
                select.className = "form-control";
                OrganizationEditor.Xrm.getBooleanOptions("organization", attributeMetadata.MetadataId)
                    .then(function (options) {
                        var emptyOption = document.createElement("option");
                        emptyOption.text = "-- Select --";
                        emptyOption.value = "";
                        select.appendChild(emptyOption);
                        for (var i = 0; i < options.length; i++) {
                            var option = document.createElement("option");
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
                    })
                    .catch(OrganizationEditor.Xrm.openErrorDialog);
                return select;

            case "Integer":
                var input = document.createElement("input");
                input.type = "number";
                input.className = "form-control";
                input.value = value;
                input.onchange = function (ev) {
                    onInputChanged(ev, attributeMetadata);
                }
                return input;

            case "Picklist":
                var select = document.createElement("select");
                select.className = "form-control";
                OrganizationEditor.Xrm.getPicklistOptions("organization", attributeMetadata.MetadataId)
                    .then(function (options) {
                        var emptyOption = document.createElement("option");
                        emptyOption.text = "-- Select --";
                        emptyOption.value = "";
                        select.appendChild(emptyOption);
                        for (var i = 0; i < options.length; i++) {
                            var option = document.createElement("option");
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
                    })
                    .catch(OrganizationEditor.Xrm.openErrorDialog);
                return select;

            case "Lookup":
                var div = document.createElement("div");

                var inputId = document.createElement("input");
                inputId.id = "input-id";
                inputId.style.display = "inline-block";
                inputId.className = "form-control col-6";
                inputId.value = value;
                div.appendChild(inputId);

                var selectLogicalName = document.createElement("select");
                selectLogicalName.id = "select-logicalname";
                selectLogicalName.style.display = "inline-block";
                selectLogicalName.className = "form-control col-6";
                attributeMetadata.Targets.forEach(function (element) {
                    var option = document.createElement("option");
                    option.text = element;
                    option.value = element;
                    selectLogicalName.appendChild(option);
                });
                div.appendChild(selectLogicalName);

                inputId.onchange = function (ev) {
                    onLookupChanged(attributeMetadata);
                }
                return div;

            default:
                var textarea = document.createElement("textarea");
                textarea.setAttribute("rows", "4");
                textarea.onchange = function (evt) {
                    onInputChanged(evt, attributeMetadata);
                };
                textarea.className = "form-control";
                textarea.value = value || "";
                return textarea;
        }

        return input;
    }

    function onInputChanged(evt, attributeMetadata) {
        var input = evt.target;
        var entity = OrganizationEditor.getLocals().entity;
        var value = parseValue(input.value, attributeMetadata);
        entity[attributeMetadata.LogicalName] = value;
    }

    function onLookupChanged(attributeMetadata) {
        var inputId = document.getElementById("input-id");
        var selectLogicalName = document.getElementById("select-logicalname");
        var entity = OrganizationEditor.getLocals().entity;
        var id = inputId.value;
        var logicalName = selectLogicalName.value;
        if (!id || id === "" || !logicalName || logicalName === "") {
            entity[attributeMetadata.LogicalName] = null;
        } else {
            OrganizationEditor.Xrm.getEntitySetName(logicalName)
                .then(function (entitySetName) {
                    entity[attributeMetadata.LogicalName] = id;
                    entity[attributeMetadata.LogicalName + "@odata.bind"] = "/" + entitySetName + "(" + id + ")";
                })
                .catch();
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

    function onModalSaveClick() {
        OrganizationEditor.Xrm.showProgressIndicator("Saving ...");

        var modal = document.getElementById("modal");
        var logicalName = modal.getAttribute("data-logicalname");
        var attributeType = modal.getAttribute("data-attributetype");

        var data = {};
        if (attributeType && attributeType === "Lookup" && _entity[logicalName]) {
            logicalName = logicalName + "@odata.bind";
            data[logicalName] = _entity[logicalName];
        } else {
            data[logicalName] = _entity[logicalName];
        }

        OrganizationEditor.Xrm.updateRecord("organization", _entity.organizationid, data)
            .then(OrganizationEditor.Xrm.closeProgressIndicator)
            .catch(function (error) {
                OrganizationEditor.Xrm.closeProgressIndicator();
                OrganizationEditor.Xrm.openErrorDialog(error);
            });
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

    function getLocals() {
        return {
            entity: _entity,
            attributeMetadata: _attributeMetadata,
            metadata: _metadata
        };
    }

    // Polyfills
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function (fn, scope) {
            for (var i = 0, len = this.length; i < len; ++i) {
                fn.call(scope, this[i], i, this);
            }
        }
    }
    if (!Object.entries) {
        Object.entries = function (obj) {
            var ownProps = Object.keys(obj),
                i = ownProps.length,
                resArray = new Array(i); // preallocate the Array
            while (i--)
                resArray[i] = [ownProps[i], obj[ownProps[i]]];

            return resArray;
        };
    }

    OrganizationEditor.Xrm.showProgressIndicator("Loading ...");

    Promise.all([
            OrganizationEditor.Xrm.getEntityMetadata("organization").then(setMetadata),
            OrganizationEditor.Xrm.retrieveFirst("organization").then(setEntity)
        ])
        .then(buildTable)
        .then(OrganizationEditor.Xrm.closeProgressIndicator)
        .catch(OrganizationEditor.Xrm.openErrorDialog);

}(OrganizationEditor || {}, Xrm, GetGlobalContext));