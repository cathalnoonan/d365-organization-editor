/// <reference path="./organizationeditor_xrm.js"/>

var OrganizationEditor = (function (_public) {

  // Private
  var _entity = {};
  var _attributeMetadata = {};
  var _metadata = {};

  function onLoad() {
    showProgressIndicator("Loading ...");

    Promise.all([
        OrganizationEditor.Xrm.getEntityMetadata('organization').then(setMetadata),
        OrganizationEditor.Xrm.retrieveFirst('organization').then(setEntity)
      ])
      .then(buildTable)
      .then(closeProgressIndicator)
      .catch(OrganizationEditor.Xrm.openErrorDialog);
  }

  function setEntity(json) {
    _entity = json;
  }

  function setMetadata(json) {
    _metadata = json;

    Object.entries(_metadata.Attributes).forEach(function (entry) {
      var attribute = entry[1];
      if (!attribute.IsValidForUpdate) {
        return;
      }
      if (attribute.AttributeType === 'Virtual') {
        return;
      }
      _attributeMetadata[attribute.LogicalName] = attribute;
    });
  }

  function buildTable() {
    const tbody = document.getElementById('tbody');

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

      var tr = document.createElement('tr');
      tr.setAttribute('data-metadataid', attribute.metadataId);
      tr.setAttribute('data-logicalname', attribute.logicalName);
      tbody.appendChild(tr);

      var tdDisplayName = document.createElement('td');
      tdDisplayName.innerText = attribute.displayName;
      tr.appendChild(tdDisplayName);

      var tdDescription = document.createElement('td');
      tdDescription.innerText = attribute.description;
      tr.appendChild(tdDescription);

      var tdLogicalName = document.createElement('td');
      tdLogicalName.innerText = attribute.logicalName;
      tr.appendChild(tdLogicalName);

      var tdDataType = document.createElement('td');
      tdDataType.innerText = attribute.type;
      tr.appendChild(tdDataType);

      var tdEdit = document.createElement('td');
      var btnEdit = document.createElement('button');
      btnEdit.innerText = 'Edit';
      btnEdit.className = 'btn btn-info btn-small';
      btnEdit.onclick = editOnClick;
      btnEdit.setAttribute('data-toggle', 'modal');
      btnEdit.setAttribute('data-target', '#modal');
      btnEdit.setAttribute('data-logicalname', attribute.logicalName);
      tdEdit.appendChild(btnEdit);
      tr.appendChild(tdEdit);
    });
  }

  function editOnClick(evt) {
    var logicalName = evt.target.getAttribute('data-logicalname');
    if (logicalName) {
      var attributeMetadata = _attributeMetadata[logicalName];
      var value = _entity[logicalName];
      buildModal(attributeMetadata, value);
    }
  }

  function buildModal(attributeMetadata, value) {
    // Set logical name
    var modal = document.getElementById('modal');
    modal.setAttribute('data-logicalname', attributeMetadata.LogicalName);

    // Set title
    var modalTitle = document.getElementById('modal-title');
    modalTitle.innerText = attributeMetadata.DisplayName.UserLocalizedLabel.Label;

    // Prepare content
    var description = document.getElementById('description');
    description.innerText = attributeMetadata.Description.UserLocalizedLabel.Label;
    var type = document.getElementById('type');
    type.innerText = attributeMetadata.AttributeType;
    var inputContainer = document.getElementById('input-container');
    inputContainer.innerHTML = '';
    var input = createInputElement(attributeMetadata, value);
    inputContainer.appendChild(input);

    // Wire up the onclick of the Save button
    var modalSave = document.getElementById('btn-modal-save');
    modalSave.onclick = onModalSaveClick;
  }

  function createInputElement(attributeMetadata, value) {

    switch (attributeMetadata.AttributeType) {
      case "Boolean":
        var select = document.createElement('select');
        select.className = "form-control";
        OrganizationEditor.Xrm.getBooleanOptions('organization', attributeMetadata.MetadataId)
          .then(function (options) {
            for (var i = 0; i < options.length; i++) {
              var option = document.createElement('option');
              option.text = options[i].Label.UserLocalizedLabel.Label;
              option.value = options[i].Value;
              select.appendChild(option);
            }
            if (value === 1 || value === '1' || value === true || value.toString() === 'true') {
              select.value = '1';
            } else if (value === 0 || value === '0' || value === false || value.toString() === 'false') {
              select.value = '0';
            }
            select.onchange = function (evt) {
              onInputChanged(evt, attributeMetadata);
            }
          })
          .catch(OrganizationEditor.Xrm.openErrorDialog);
        return select;

      case "Integer":
        var input = document.createElement('input');
        input.type = "number";
        input.className = "form-control";
        input.value = value;
        return input;

      case "Picklist":
        var select = document.createElement('select');
        select.className = "form-control";
        OrganizationEditor.Xrm.getPicklistOptions('organization', attributeMetadata.MetadataId)
          .then(function (options) {
            for (var i = 0; i < options.length; i++) {
              var option = document.createElement('option');
              option.text = options[i].Label.UserLocalizedLabel.Label;
              option.value = options[i].Value;
              select.appendChild(option);
            }
            select.value = value.toString();
            select.onchange = function (evt) {
              onInputChanged(evt, attributeMetadata);
            }
          })
          .catch(OrganizationEditor.Xrm.openErrorDialog);
        return select;

        //case "String":
      default:
        var textarea = document.createElement('textarea');
        textarea.setAttribute('rows', '4');
        textarea.onchange = function (evt) {
          onInputChanged(evt, attributeMetadata);
        };
        textarea.className = "form-control";
        textarea.value = value || '';
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

  function parseValue(value, attributeMetadata) {
    switch (attributeMetadata.AttributeType) {
      case "Boolean":
        return value === 'true' || value === 1 || value === '1';

      case "Integer":
        return parseInt(value);

        //case "String":
      default:
        return value;
    }
  }

  function onModalSaveClick() {
    showProgressIndicator("Saving ...");

    var modal = document.getElementById('modal');
    var logicalName = modal.getAttribute('data-logicalname');

    var data = {};
    data[logicalName] = _entity[logicalName];

    OrganizationEditor.Xrm.updateRecord('organization', _entity.organizationid, data)
      .then(closeProgressIndicator)
      .catch(function (error) {
        closeProgressIndicator();
        OrganizationEditor.Xrm.openErrorDialog(error);
      });
  }

  function mapMetadataAttribute(attribute) {
    if (!attribute.MetadataId) {
      attribute.MetadataId = '';
    }

    if (!attribute.DisplayName || !attribute.DisplayName.UserLocalizedLabel || !attribute.DisplayName.UserLocalizedLabel.Label) {
      attribute.DisplayName = {
        UserLocalizedLabel: {
          Label: ''
        }
      };
    }

    if (!attribute.Description || !attribute.Description.UserLocalizedLabel || !attribute.Description.UserLocalizedLabel.Label) {
      attribute.Description = {
        UserLocalizedLabel: {
          Label: ''
        }
      };
    }

    if (!attribute.LogicalName) {
      attribute.LogicalName = '';
    }

    if (!attribute.AttributeType) {
      attribute.AttributeType = '';
    }

    return {
      metadataId: attribute.MetadataId,
      displayName: attribute.DisplayName.UserLocalizedLabel.Label,
      description: attribute.Description.UserLocalizedLabel.Label,
      logicalName: attribute.LogicalName,
      type: attribute.AttributeType
    };
  }

  function closeProgressIndicator() {
    return Xrm.Utility.closeProgressIndicator();
  }

  function showProgressIndicator(message) {
    return Xrm.Utility.showProgressIndicator(message);
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

  // Public
  _public.onLoad = onLoad;
  _public.getLocals = getLocals;
  return _public;

}(OrganizationEditor || {}));