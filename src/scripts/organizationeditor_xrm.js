var OrganizationEditor = OrganizationEditor || {};
OrganizationEditor.Xrm = (function (_public) {

  // Private
  var _globalContext = null;
  var _entitySets = {};
  var _entityMetadata = {};
  var _pickListOptions = {};
  var _booleanOptions = {};

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
      // Try memoize
      if (_entityMetadata[entityName]) {
        resolve(_entityMetadata[entityName]);
        return;
      }

      var url = getApiDataUrl() + "/EntityDefinitions(LogicalName='" + entityName + "')?$expand=Attributes";
      axios.get(url)
        .then(function (response) {
          var json = response.data;
          _entityMetadata[entityName] = json; // Memoize
          resolve(json);
        })
        .catch(reject);
    });
  }

  function getEntitySetName(entityName) {
    return new Promise(function (resolve, reject) {
      // Try memoize
      if (_entitySets[entityName]) {
        resolve(_entitySets[entityName]);
        return;
      }
      
      var url = getApiDataUrl() + "/EntityDefinitions(LogicalName='" + entityName + "')?$select=EntitySetName";
      axios.get(url)
        .then(function (response) {
          var json = response.data;
          _entitySets[entityName] = json.EntitySetName; // Memoize
          resolve(_entitySets[entityName]);
        })
        .catch(reject);
    });
  }

  function getPicklistOptions(entityName, metadataId) {
    return new Promise(function (resolve, reject) {
      // Try memoized value
      if (_pickListOptions[metadataId]) {
        resolve(_pickListOptions[metadataId]);
        return;
      }
      
      var url = getApiDataUrl() + "/EntityDefinitions(LogicalName='" + entityName + "')/Attributes(" + metadataId + ")/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?$select=LogicalName&$expand=OptionSet,GlobalOptionSet";
      axios.get(url)
        .then(function (response) {
          var json = response.data;
          var options = resolvePicklist(json);
          _pickListOptions[metadataId] = options; // Memoize
          resolve(options);
        })
        .catch(reject);
    });
  }

  function resolvePicklist(json) {
    if (json.OptionSet && json.OptionSet.Options && json.OptionSet.Options.length > 0) {
      return json.OptionSet.Options;
    } else {
      return json.GlobalOptionSet.Options;
    }
  }

  function getBooleanOptions(entityName, metadataId) {
    return new Promise(function (resolve, reject) {
      // Try memoize
      if (_booleanOptions[metadataId]) {
        resolve(_booleanOptions[metadataId]);
        return;
      }
      
      var url = getApiDataUrl() + "/EntityDefinitions(LogicalName='" + entityName + "')/Attributes(" + metadataId + ")/Microsoft.Dynamics.CRM.BooleanAttributeMetadata?$select=LogicalName&$expand=OptionSet,GlobalOptionSet";
      axios.get(url)
        .then(function (response) {
          var json = response.data;
          var options = resolveOptionSet(json);
          _booleanOptions[metadataId] = options; // Memoize
          resolve(options);
        })
        .catch(reject);
    });
  }

  function resolveOptionSet(json) {
    if (json.OptionSet && json.OptionSet.Options && json.OptionSet.Options.length > 0) {
      return [
        json.OptionSet.TrueOption,
        json.OptionSet.FalseOption
      ];
    } else {
      return [
        json.GlobalOptionSet.TrueOption,
        json.GlobalOptionSet.FalseOption
      ];
    }  
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