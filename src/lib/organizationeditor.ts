import { AxiosResponse } from 'axios'
import { buildTable } from './dom'
import { EntityMetadata, AttributeMetadata } from './models'
import { WebApi, WebApiVersion } from './services'
import { Alerts, Dictionary } from './utilities'

export class OrganizationEditor {
    private readonly alerts: Alerts
    private readonly webApi: WebApi

    // @ts-ignore -- this will be assigned in `init()`
    private entityMetadata: EntityMetadata
    private attributeMetadata: Dictionary<AttributeMetadata> = {}
    private entity: Dictionary<any> = {}

    constructor(options: OrganizationEditorOptions) {
        const { xrm, apiVersion, } = options

        this.alerts = new Alerts({ xrm, })
        this.webApi = new WebApi({ xrm, apiVersion, })
    }

    public init = async (): Promise<void> => {
        this.alerts.showProgressIndicator('Loading ...')

        this.entity = await this.webApi.retrieveFirst('organization')
        this.entityMetadata = await this.webApi.getEntityMetadata('organization')

        this.mapMetadataAttributes()

        const self = this

        buildTable({
            attributes: self.attributeMetadata,
            webApi: self.webApi,
            entity: self.entity,
            updateEntity: self.updateOrganization,
            getAttributeValue: self.getAttributeValue,
        })

        this.alerts.closeProgressIndicator()
    }

    private mapMetadataAttributes = (): void => {
        this.entityMetadata.Attributes
            .filter(attr => attr.IsValidForUpdate && attr.AttributeType !== 'Virtual')
            .sort((a, b) => {
                if (a?.LogicalName < b?.LogicalName) return -1
                if (a?.LogicalName > b?.LogicalName) return 1
                return 0
            })
            .forEach(attr => this.attributeMetadata[attr.LogicalName] = attr)
    }

    private getAttributeValue = (attribute: AttributeMetadata): any => {
        if (attribute.AttributeType === 'Lookup') {
            const lookupValue: Xrm.LookupValue = {
                id: this.entity[`_${attribute.LogicalName}_value`],
                entityType: this.entity[`_${attribute.LogicalName}_value@Microsoft.Dynamics.CRM.lookuplogicalname`],
            }
            return lookupValue
        } else {
            return this.entity[attribute.LogicalName]
        }
    }

    private updateOrganization = async (options: OrganizationAttributeUpdateOptions): Promise<void> => {
        const id = this.entity.organizationid

        this.alerts.showProgressIndicator('Updating ...')

        try {
            switch (options.type) {
                case 'update': {
                    // Send update to dynamics
                    await this.webApi.updateRecord('organization', id, options.data!)

                    // Take update into the current object
                    let retrieveAttribute = options.attribute.LogicalName
                    if (options.attribute.AttributeType === 'Lookup') {
                        retrieveAttribute = `_${retrieveAttribute}_value`
                    }
                    const patch = await this.webApi.retrieveFirst('organization', `?$select=${retrieveAttribute}`)
                    this.entity = {
                        ...this.entity,
                        ...patch,
                    }

                    break
                }
                case 'unlink': {
                    // Send update to dynamics
                    await this.webApi.unlinkRecord('organization', id, options.attribute.LogicalName)

                    // Take update into the current object
                    this.entity[options.attribute.LogicalName] = null
                    this.entity[`_${options.attribute.LogicalName}_value`] = null
                    this.entity[`_${options.attribute.LogicalName}_value@Microsoft.Dynamics.CRM.lookuplogicalname`] = null

                    break
                }
                default: {
                    throw {
                        message: 'Unexpected update type attempted.',
                        options,
                    }
                }
            }

            this.alerts.closeProgressIndicator()

        } catch (exc) {

            this.alerts.closeProgressIndicator()

            if (exc.response) {
                const response = <AxiosResponse>(exc.response)

                this.alerts.openErrorDialog({
                    message: <string>(response?.data?.error?.message) ?? 'Unknown error - download the log file for more information',
                    errorCode: response.status,
                    details: JSON.stringify(exc),
                })

            } else {
                this.alerts.openErrorDialog({ message: 'Error saving the record', details: JSON.stringify(exc) })
            }
        }

    }
}

export interface OrganizationEditorOptions {
    apiVersion: WebApiVersion
    xrm: Xrm.XrmStatic
}

export interface OrganizationAttributeUpdateOptions {
    type: 'update' | 'unlink'
    attribute: AttributeMetadata
    data?: object
}