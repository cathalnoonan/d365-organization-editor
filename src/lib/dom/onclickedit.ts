import { buildModal } from '.'
import { OrganizationAttributeUpdateOptions } from '..'
import { AttributeMetadata } from '../models'
import { WebApi } from '../services'

export async function onClickEdit(options: OnClickEditOptions): Promise<void> {
    const { attribute, getAttributeValue, } = options

    const value = getAttributeValue(attribute)

    await buildModal({
        ...options,
        value,
    })
}

export interface OnClickEditOptions {
    attribute: AttributeMetadata
    webApi: WebApi
    updateEntity: (options: OrganizationAttributeUpdateOptions) => Promise<void>
    getAttributeValue: (attribute: AttributeMetadata) => any
}