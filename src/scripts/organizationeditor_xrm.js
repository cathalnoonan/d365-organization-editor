var OrganizationEditor = OrganizationEditor || {};
OrganizationEditor.Xrm = (function (_public) {

  // Private
  var _globalContext = null;
  var _entitySets = {};

  function getApiDataUrl() {
    return getClientUrl() + "/api/data/v9.1/";
  }

  function getClientUrl() {
    if (!_globalContext) {
      if (GetGlobalContext) {
        _globalContext = GetGlobalContext();
      }
    }

    return _globalContext.getClientUrl();
  }

  function getEntityMetadata(entityName) {
    return new Promise(function (resolve, reject) {
      var url = getApiDataUrl() + "/EntityDefinitions(LogicalName='" + entityName + "')?$expand=Attributes";

      axios.get(url)
        .then(function (response) {
          var json = response.data;
          resolve(json);
        })
        .catch(reject);
    });
  }

  function getEntitySetName(entityName) {
    return new Promise(function (resolve, reject) {
      var url = getApiDataUrl() + "/EntityDefinitions(LogicalName='" + entityName + "')?$select=EntitySetName";

      if (_entitySets[entityName]) {
        resolve(_entitySets[entityName]);
        return;
      }

      axios.get(url)
        .then(function (response) {
          var json = response.data;
          _entitySets[entityName] = json.EntitySetName;
          resolve(_entitySets[entityName]);
        })
        .catch(reject);
    });
  }

  function getPicklistOptions(entityName, metadataId) {
    return new Promise(function (resolve, reject) {
      var url = getApiDataUrl() + "/EntityDefinitions(LogicalName='" + entityName + "')/Attributes(" + metadataId + ")/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?$select=LogicalName&$expand=OptionSet,GlobalOptionSet";

      axios.get(url)
        .then(function (response) {
          var json = response.data;
          if (json.OptionSet && json.OptionSet.Options && json.OptionSet.Options.length > 0) {
            resolve(json.OptionSet.Options);
          } else {
            resolve(json.GlobalOptionSet.Options);
          }  
        })
        .catch(reject);
    });
  }

  function getBooleanOptions(entityName, metadataId) {
    return new Promise(function (resolve, reject) {
      var url = getApiDataUrl() + "/EntityDefinitions(LogicalName='" + entityName + "')/Attributes(" + metadataId + ")/Microsoft.Dynamics.CRM.BooleanAttributeMetadata?$select=LogicalName&$expand=OptionSet,GlobalOptionSet";

      axios.get(url)
        .then(function (response) {
          var json = response.data;
          if (json.OptionSet && json.OptionSet.Options && json.OptionSet.Options.length > 0) {
            resolve([
              json.OptionSet.TrueOption,
              json.OptionSet.FalseOption
            ]);
          } else {
            resolve([
              json.GlobalOptionSet.TrueOption,
              json.GlobalOptionSet.FalseOption
            ]);
          }  
        })
        .catch(reject);
    });
  }

  function retrieveMultipleRecords(entityLogicalName, options) {
    return new Promise(function (resolve, reject) {
      getEntitySetName(entityLogicalName)
        .then(function (entitySetName) {
          var url = getApiDataUrl() + entitySetName;
          if (options) {
            url += options;
          }
          return url;
        })
        .then(axios.get)
        .then(function (response) {
          resolve(response.data);
        })
        .catch(reject);
    });
  }

  function retrieveFirst(entityLogicalName, options, maxPageSize) {
    return new Promise(function (resolve, reject) {
      retrieveMultipleRecords(entityLogicalName, options, maxPageSize)
        .then(function (response) {
          if (response.value &&
              response.value[0]) {
                resolve(response.value[0]);
          } else {
            reject({ message: 'No results found' });
          }
        })
        .catch(reject);
    });
  }

  function updateRecord(entityLogicalName, id, data) {
    return new Promise(function (resolve, reject) {
      getEntityMetadata(entityLogicalName)
        .then(function (metadata) {
          id = id.replace('{', '').replace('}', '');
          var primaryIdAttribute = metadata.PrimaryIdAttribute;
          var entitySetName = metadata.EntitySetName;
          var url = getApiDataUrl() + entitySetName + '(' + id + ')';
          if (!data[primaryIdAttribute]) {
            data[primaryIdAttribute] = id;
          }
          return axios(url, {
            method: 'PATCH',
            data: data,
            headers: {
              "OData-MaxVersion": "4.0",
              "OData-Version": "4.0",
              "Accept": "application/json",
              "Content-Type": "application/json; charset=utf-8"
            },
          })
        })
        .then(function (response) {
          var success = isSuccess(response);
          if (success) {
            resolve(response);
          } else {
            reject({ message: response.statusText });
          }
        });
    });
  }

  function isSuccess(response) {
    // Axios:
    var statusCode = response.status;
    return statusCode >= 200 && statusCode < 300;
  }

  function openAlertDialog(options) {
    return Xrm.Navigation.openAlertDialog(options)
  }

  function openErrorDialog(options) {
    //return Xrm.Navigation.openErrorDialog(options)
    return new Promise(function (resolve, reject) {
      alert(options.message);
      resolve();
    });
  }

  // Public
  _public.getEntityMetadata = getEntityMetadata;
  _public.retrieveMultipleRecords = retrieveMultipleRecords;
  _public.retrieveFirst = retrieveFirst;
  _public.updateRecord = updateRecord;
  _public.openAlertDialog = openAlertDialog;
  _public.openErrorDialog = openErrorDialog;
  _public.getPicklistOptions = getPicklistOptions;
  _public.getBooleanOptions = getBooleanOptions;
  _public.getEntitySetName = getEntitySetName;
  return _public;

} (OrganizationEditor.Xrm || {}));