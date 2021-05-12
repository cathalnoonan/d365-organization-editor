import { OrganizationAttributeUpdateOptions } from '../organizationeditor'
import { AttributeMetadata } from '../models'
import { WebApi } from '../services'
import { buildModalInput } from './'

export async function buildModal(options: BuildModalOptions): Promise<void> {
    const { attribute, webApi, updateEntity, value, } = options

    // Set title
    document.getElementById('modal-title')!.innerText = attribute.DisplayName.UserLocalizedLabel.Label
    
    // Prepare content
    document.getElementById('description')!.innerText = attribute.Description.UserLocalizedLabel.Label
    document.getElementById('logicalname')!.innerText = attribute.LogicalName
    document.getElementById('type')!.innerText = attribute.AttributeType
    
    // Reset input field
    const inputContainer = document.getElementById('input-container')!
    inputContainer.innerHTML = ''

    const { element, getPatchUpdate } = await buildModalInput({
        attribute,
        webApi,
        value,
    })

    inputContainer.appendChild(element)

    // Wire up the onclick of the Save button
    document.getElementById('btn-modal-save')!.onclick = async () => await updateEntity(await getPatchUpdate())
}

export interface BuildModalOptions {
    attribute: AttributeMetadata
    webApi: WebApi
    updateEntity: (options: OrganizationAttributeUpdateOptions) => Promise<void>
    value: any
}