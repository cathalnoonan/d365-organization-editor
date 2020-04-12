const axios = require('axios').default;

var OrganizationEditor = {};
OrganizationEditor.Xrm = (function () {

    var Xrm = Xrm || window.top.Xrm || window.opener.Xrm;

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
        return getGlobalContext().getClientUrl();
    }

    function getGlobalContext() {
        if (!_globalContext) {
            var GetGlobalContext;
            _globalContext = (GetGlobalContext && GetGlobalContext()) || Xrm.Utility.getGlobalContext();
        }
        return _globalContext;
    }

    async function getEntityMetadata(entityName) {
        // Try memoize
        if (_entityMetadata[entityName]) {
            return _entityMetadata[entityName];
        }

        const url = getApiDataUrl() + "/EntityDefinitions(LogicalName='" + entityName + "')?$expand=Attributes";
        const response = await axios.get(url)
        const json = response.data;
        return _entityMetadata[entityName] = json; // Memoize, return
    }

    async function getEntitySetName(entityName) {
        // Try memoize
        if (_entitySets[entityName]) {
            return _entitySets[entityName];
        }

        const url = getApiDataUrl() + "/EntityDefinitions(LogicalName='" + entityName + "')?$select=EntitySetName";
        const response = await axios.get(url);
        const json = response.data;
        return _entitySets[entityName] = json.EntitySetName; // Memoize, return
    }

    async function getPicklistOptions(entityName, metadataId) {
        // Try memoized value
        if (_pickListOptions[metadataId]) {
            return _pickListOptions[metadataId];
        }

        const url = getApiDataUrl() + "/EntityDefinitions(LogicalName='" + entityName + "')/Attributes(" + metadataId + ")/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?$select=LogicalName&$expand=OptionSet,GlobalOptionSet";
        const response = await axios.get(url);
        const json = response.data;
        const options = resolvePicklist(json);
        return _pickListOptions[metadataId] = options; // Memoize, return
    }

    function resolvePicklist(json) {
        if (json.OptionSet && json.OptionSet.Options && json.OptionSet.Options.length > 0) {
            return json.OptionSet.Options;
        }
        return json.GlobalOptionSet.Options;
    }

    async function getBooleanOptions(entityName, metadataId) {
        // Try memoize
        if (_booleanOptions[metadataId]) {
            return _booleanOptions[metadataId];
        }

        const url = getApiDataUrl() + "/EntityDefinitions(LogicalName='" + entityName + "')/Attributes(" + metadataId + ")/Microsoft.Dynamics.CRM.BooleanAttributeMetadata?$select=LogicalName&$expand=OptionSet,GlobalOptionSet";
        const response = await axios.get(url);

        const json = response.data;
        const options = resolveOptionSet(json);
        return _booleanOptions[metadataId] = options; // Memoize, return
    }

    function resolveOptionSet(json) {
        if (json.OptionSet && json.OptionSet.Options && json.OptionSet.Options.length > 0) {
            return [
                json.OptionSet.TrueOption,
                json.OptionSet.FalseOption
            ];
        }
        return [
            json.GlobalOptionSet.TrueOption,
            json.GlobalOptionSet.FalseOption
        ];
    }

    async function retrieveMultipleRecords(entityLogicalName, options) {
        const entitySetName = await getEntitySetName(entityLogicalName);

        let url = getApiDataUrl() + entitySetName;
        if (options) {
            url += options;
        }

        const response = await axios.get(url);
        return response.data;
    }

    async function retrieveFirst(entityLogicalName, options, maxPageSize) {
        const response = await retrieveMultipleRecords(entityLogicalName, options, maxPageSize);
        if (response.value && response.value[0]) {
            return response.value[0];
        }
        throw {
            message: "No results found"
        };
    }

    async function updateRecord(entityLogicalName, id, data) {

        const metadata = await getEntityMetadata(entityLogicalName);

        id = id.replace("{", "").replace("}", "");
        const primaryIdAttribute = metadata.PrimaryIdAttribute;
        const entitySetName = metadata.EntitySetName;
        const url = getApiDataUrl() + entitySetName + "(" + id + ")";
        if (!data[primaryIdAttribute]) {
            data[primaryIdAttribute] = id;
        }

        const response = await axios(url, {
            method: "PATCH",
            data: data,
            headers: {
                "OData-MaxVersion": "4.0",
                "OData-Version": "4.0",
                "Accept": "application/json",
                "Content-Type": "application/json; charset=utf-8"
            },
        });

        const success = isSuccess(response);
        if (success) {
            return response;
        }
        throw {
            message: response.statusText
        };
    }

    function isSuccess(response) {
        // Axios:
        var statusCode = response && response.status;
        return statusCode && statusCode >= 200 && statusCode < 300;
    }

    function openAlertDialog(options) {
        return Xrm.Navigation.openAlertDialog(options);
    }

    function openErrorDialog(options) {
        return Xrm.Navigation.openErrorDialog(options);
    }

    function closeProgressIndicator() {
        return Xrm.Utility.closeProgressIndicator();
    }

    function showProgressIndicator(message) {
        return Xrm.Utility.showProgressIndicator(message);
    }

    // Public
    return {
        getEntityMetadata,
        retrieveMultipleRecords,
        retrieveFirst,
        updateRecord,
        openAlertDialog,
        openErrorDialog,
        getPicklistOptions,
        getBooleanOptions,
        getEntitySetName,
        closeProgressIndicator,
        showProgressIndicator,
    };

}());

export default OrganizationEditor;