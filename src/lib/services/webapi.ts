import Axios, { AxiosResponse } from 'axios'

import { EntityMetadata, EntityReference, PicklistAttributeMetadata, PicklistItem, TwoOptionAttributeMetadata, TwoOptionItem } from '../models'
import { Dictionary } from '../utilities'

export class WebApi {
    private readonly xrm: Xrm.XrmStatic
    private readonly apiVersion: string
    private readonly globalContext: Xrm.GlobalContext
    private readonly entityMetadata: Dictionary<EntityMetadata> = {}
    private readonly entitySets: Dictionary<string> = {}
    private readonly picklistOptions: Dictionary<PicklistItem[]> = {}
    private readonly booleanOptions: Dictionary<[TwoOptionItem, TwoOptionItem]> = {}

    constructor(options: WebApiOptions) {
        this.xrm = options.xrm
        this.apiVersion = options.apiVersion
        this.globalContext = this.xrm!.Utility!.getGlobalContext() ?? window.GetGlobalContext()
    }

    private getApiDataUrl(): string {
        return `${this.getClientUrl()}/api/data/${this.apiVersion}/`
    }

    private getClientUrl(): string {
        return this.globalContext.getClientUrl()
    }

    public async getEntityMetadata(entityName: string): Promise<EntityMetadata> {
        // Try memoize
        if (typeof this.entityMetadata[entityName] !== 'undefined') {
            return this.entityMetadata[entityName]
        }

        const url = `${this.getApiDataUrl()}/EntityDefinitions(LogicalName='${entityName}')?$expand=Attributes`

        const response = await Axios.get<EntityMetadata>(url)
        const json = response.data
        return this.entityMetadata[entityName] = json // Memoize, return
    }

    public async getEntitySetName(entityName: string): Promise<string> {
        // Try memoize
        if (typeof this.entitySets[entityName] !== 'undefined') {
            return this.entitySets[entityName]
        }

        const url = `${this.getApiDataUrl()}/EntityDefinitions(LogicalName='${entityName}')?$select=EntitySetName`

        const response = await Axios.get<EntityMetadata>(url)
        const json = response.data
        return this.entitySets[entityName] = json.EntitySetName // Memoize, return
    }

    public async getPicklistOptions(entityName: string, metadataId: string): Promise<PicklistItem[]> {
        // Try memoized value
        if (this.picklistOptions[metadataId]) {
            return this.picklistOptions[metadataId]
        }

        const url = `${this.getApiDataUrl()}/EntityDefinitions(LogicalName='${entityName}')/Attributes(${metadataId})/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?$select=LogicalName&$expand=OptionSet,GlobalOptionSet`

        const response = await Axios.get<PicklistAttributeMetadata>(url)
        const json = response.data
        const options = this.resolvePicklist(json)
        return this.picklistOptions[metadataId] = options // Memoize, return
    }

    private resolvePicklist(json: PicklistAttributeMetadata): PicklistItem[] {
        if (json.OptionSet && json.OptionSet.Options && json.OptionSet.Options.length > 0) {
            return json.OptionSet.Options
        }
        return json.GlobalOptionSet.Options
    }

    public async getBooleanOptions(entityName: string, metadataId: string): Promise<[TwoOptionItem, TwoOptionItem]> {
        // Try memoize
        if (this.booleanOptions[metadataId]) {
            return this.booleanOptions[metadataId]
        }

        const url = `${this.getApiDataUrl()}/EntityDefinitions(LogicalName='${entityName}')/Attributes(${metadataId})/Microsoft.Dynamics.CRM.BooleanAttributeMetadata?$select=LogicalName&$expand=OptionSet,GlobalOptionSet`

        const response = await Axios.get<TwoOptionAttributeMetadata>(url)

        const json = response.data
        const options = this.resolveOptionSet(json)
        return this.booleanOptions[metadataId] = options // Memoize, return
    }

    private resolveOptionSet(json: TwoOptionAttributeMetadata): [TwoOptionItem, TwoOptionItem] {
        if (json.OptionSet && json.OptionSet.TrueOption) {
            return [
                json.OptionSet.TrueOption,
                json.OptionSet.FalseOption
            ]
        }
        return [
            json.GlobalOptionSet.TrueOption,
            json.GlobalOptionSet.FalseOption
        ]
    }

    public async retrieveMultipleRecords(entityLogicalName: string, options?: string): Promise<RetrieveMultipleResponse> {
        const entitySetName = await this.getEntitySetName(entityLogicalName)

        let url = this.getApiDataUrl() + entitySetName
        if (options) {
            url += options
        }

        const response = await Axios.get<RetrieveMultipleResponse>(url, {
            headers: {
                'OData-MaxVersion': '4.0',
                'OData-Version': '4.0',
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
                'Prefer': 'odata.include-annotations=*'
            }
        })

        const success = this.isSuccess(response)

        if (success) {
            return response.data
        }
        throw {
            message: response.statusText
        }
    }

    public async retrieveFirst(entityLogicalName: string, options?: string): Promise<any> {
        const response = await this.retrieveMultipleRecords(entityLogicalName, options)
        if (response.value && response.value[0]) {
            return response.value[0]
        }
        throw {
            message: 'No results found'
        }
    }

    public async getAllEntityReferences(entityName: string): Promise<EntityReference[]> {
        const { EntitySetName, PrimaryIdAttribute, PrimaryNameAttribute, } = await this.getEntityMetadata(entityName)
        const references: EntityReference[] = []

        let url = `${this.getApiDataUrl()}/${EntitySetName}?$select=${PrimaryIdAttribute},${PrimaryNameAttribute}&$orderby=${PrimaryNameAttribute}`
        while (true) {
            const response = await Axios.get<RetrieveMultipleResponse>(url)
            const { data } = response
            const newReferences = data.value.map(x => ({ entityName, id: x[PrimaryIdAttribute], name: x[PrimaryNameAttribute] }))
            references.push(...newReferences)
            
            if (data["@odata.nextLink"]) {
                url = data["@odata.nextLink"]
            } else {
                break
            }
        }

        return references
    }

    public async updateRecord(entityLogicalName: string, id: string, data: Dictionary<any>): Promise<any> {

        const metadata = await this.getEntityMetadata(entityLogicalName)

        id = id.replace('{', '').replace('}', '')
        const primaryIdAttribute = metadata.PrimaryIdAttribute
        const entitySetName = metadata.EntitySetName
        const url = `${this.getApiDataUrl()}${entitySetName}(${id})`
        if (!data[primaryIdAttribute]) {
            data[primaryIdAttribute] = id
        }

        const response = await Axios(url, {
            method: 'PATCH',
            data: data,
            headers: {
                'OData-MaxVersion': '4.0',
                'OData-Version': '4.0',
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            },
        })

        const success = this.isSuccess(response)

        if (success) {
            return response.data
        }
        throw {
            message: response.statusText
        }
    }

    public async unlinkRecord(entityLogicalName: string, id: string, attributeName: string): Promise<void> {
        id = id.replace('{', '').replace('}', '')

        const entitySetName = await this.getEntitySetName(entityLogicalName)
        const url = `${this.getApiDataUrl()}${entitySetName}(${id})/${attributeName}/$ref`

        const response = await Axios(url, {
            method: 'DELETE',

            headers: {
                'OData-MaxVersion': '4.0',
                'OData-Version': '4.0',
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
            },
        })

        const success = this.isSuccess(response)

        if (!success) {
            throw {
                message: response.statusText
            }
        }
    }

    public async publishCustomizations(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const url = `${this.getApiDataUrl()}/PublishAllXml`

            const response = await Axios.post(url, null, {
                headers: {
                    'OData-MaxVersion': '4.0',
                    'OData-Version': '4.0',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json; charset=utf-8',
                }
            })
            
            if (this.isSuccess(response)) 
                return resolve()
            else 
                return reject()
        })
    }

    private isSuccess(response: AxiosResponse): boolean {
        // Axios
        const { status } = response
        return status >= 200 && status < 300
    }
}

export type WebApiVersion = 'v8.0' | 'v8.1' | 'v8.2' | 'v9.0' | 'v9.1' | 'v9.2'

export interface WebApiOptions {
    apiVersion: WebApiVersion
    xrm: Xrm.XrmStatic
}

export interface RetrieveMultipleResponse {
    value: any[]
    "@odata.nextLink"?: string
}