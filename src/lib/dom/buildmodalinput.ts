import { OrganizationAttributeUpdateOptions } from '..'
import { AttributeMetadata, LookupAttributeMetadata, PicklistAttributeMetadata, TwoOptionAttributeMetadata } from '../models'
import { WebApi } from '../services'
import { Dictionary } from '../utilities'

export async function buildModalInput(options: BuildModalInputOptions): Promise<ModalInput> {
    const { attribute } = options

    switch (attribute.AttributeType) {
        case 'Boolean': {
            return await buildTwoOptionInput(<BuildTwoInputOptions>options)
        }

        case 'Integer': {
            return await buildIntegerInput(<BuildIntegerInputOptions>options)
        }

        case 'Picklist': {
            return await buildPicklistOptionInput(<BuildPicklistOptions>options)
        }

        case 'Lookup': {
            return await buildLookupInput(<BuildLookupOptions>options)
        }

        default: {
            return await buildTextAreaInput(<BuildTextAreaOptions>options)
        }
    }
}

export interface ModalInput {
    element: HTMLElement
    getPatchUpdate: () => Promise<OrganizationAttributeUpdateOptions>
}

export interface BuildModalInputOptions<TAttributeMetadata = AttributeMetadata, TValue = any> {
    attribute: TAttributeMetadata
    webApi: WebApi
    value: TValue
}

type BuildTwoInputOptions = BuildModalInputOptions<TwoOptionAttributeMetadata, boolean | number | string>
type BuildIntegerInputOptions = BuildModalInputOptions<AttributeMetadata, number>
type BuildPicklistOptions = BuildModalInputOptions<PicklistAttributeMetadata>
type BuildLookupOptions = BuildModalInputOptions<LookupAttributeMetadata, Xrm.LookupValue>
type BuildTextAreaOptions = BuildModalInputOptions<AttributeMetadata, any>

async function buildTwoOptionInput(options: BuildTwoInputOptions): Promise<ModalInput> {
    const { attribute, webApi, value, } = options

    const select = document.createElement('select')
    select.className = 'form-control'

    const picklist = await webApi.getBooleanOptions('organization', attribute.MetadataId)

    const emptyOption = document.createElement('option')
    emptyOption.text = '-- Select --'
    emptyOption.value = ''
    select.appendChild(emptyOption)

    const parseBoolean = (checkValue: string | number | boolean): string => {
        if (checkValue !== null && checkValue !== undefined) {
            if (checkValue === 1 || checkValue === '1' || checkValue === true || checkValue.toString() === 'true') {
                return 'true'
            } else if (checkValue === 0 || checkValue === '0' || checkValue === false || checkValue.toString() === 'false') {
                return 'false'
            }
        }
        return ''
    }

    picklist.forEach(item => {
        const option = document.createElement('option')
        option.text = item.Label.UserLocalizedLabel.Label
        option.value = parseBoolean(item.Value)
        select.appendChild(option)
    })

    if (value !== null && value !== undefined) {
        select.value = parseBoolean(value)
    }

    const getPatchUpdate = async (): Promise<OrganizationAttributeUpdateOptions> => {
        const data: Dictionary<any> = {}
        data[attribute.LogicalName] = JSON.parse(select.value)
        return {
            type: 'update',
            attribute,
            data,
        }
    }

    return {
        element: select,
        getPatchUpdate,
    }
}

async function buildIntegerInput(options: BuildIntegerInputOptions): Promise<ModalInput> {
    const { attribute, value, } = options

    const input = document.createElement('input')
    input.type = 'number'
    input.className = 'form-control'

    input.value = value?.toString() ?? ''

    const getPatchUpdate = async (): Promise<OrganizationAttributeUpdateOptions> => {
        const data: Dictionary<any> = {}
        
        if (!isNaN(parseInt(input.value))) {
            data[attribute.LogicalName] = parseInt(input.value)
        } else {
            data[attribute.LogicalName] = null
        }
        
        return {
            type: 'update',
            attribute,
            data,
        }
    }

    return {
        element: input,
        getPatchUpdate,
    }
}

async function buildPicklistOptionInput(options: BuildPicklistOptions): Promise<ModalInput> {
    const { attribute, webApi, value, } = options

    const select = document.createElement('select')
    select.className = 'form-control'

    const picklist = await webApi.getPicklistOptions('organization', attribute.MetadataId)

    const emptyOption = document.createElement('option')
    emptyOption.text = '-- Select --'
    emptyOption.value = ''
    select.appendChild(emptyOption)

    picklist.forEach(item => {
        const option = document.createElement('option')
        option.text = item.Label.UserLocalizedLabel.Label
        option.value = item.Value.toString()
        select.appendChild(option)
    })

    if (value !== undefined) {
        select.value = value.toString()
    }

    const getPatchUpdate = async (): Promise<OrganizationAttributeUpdateOptions> => {
        const data: Dictionary<any> = {}
        data[attribute.LogicalName] = select.value
        return {
            type: 'update',
            attribute,
            data,
        }
    }

    return {
        element: select,
        getPatchUpdate,
    }
}

async function buildLookupInput(options: BuildLookupOptions): Promise<ModalInput> {

    const { attribute, webApi, value, } = options

    const div = document.createElement('div')

    const inputId = document.createElement('input')
    inputId.id = 'input-id'
    inputId.style.display = 'inline-block'
    inputId.className = 'form-control col-6'

    div.appendChild(inputId)

    const selectLogicalName = document.createElement('select')
    selectLogicalName.id = 'select-logicalname'
    selectLogicalName.style.display = 'inline-block'
    selectLogicalName.className = 'form-control col-6'

    const emptyOption = document.createElement('option')
    emptyOption.text = '--- Select ---'
    emptyOption.value = ''
    selectLogicalName.appendChild(emptyOption)

    attribute.Targets.forEach(entityName => {
        const option = document.createElement('option')
        option.text = entityName
        option.value = entityName
        selectLogicalName.appendChild(option)
    })

    div.appendChild(selectLogicalName)

    if (value) {
        inputId.value = value.id ?? ''
        selectLogicalName.value = value.entityType ?? ''
    }

    const getPatchUpdate = async (): Promise<OrganizationAttributeUpdateOptions> => {
        const id = inputId.value
        const logicalName = selectLogicalName.value
        
        if (id && logicalName) {
            const data: Dictionary<any> = {}
            const entitySetName = await webApi.getEntitySetName(logicalName)
            data[`${attribute.LogicalName}@odata.bind`] = `/${entitySetName}(${id})`
            return {
                type: 'update',
                attribute,
                data,
            }
        } else {
            return {
                type: 'unlink',
                attribute,
            }
        }
    }

    return {
        element: div,
        getPatchUpdate
    }
}

async function buildTextAreaInput(options: BuildTextAreaOptions): Promise<ModalInput> {
    const { attribute, value, } = options

    const textarea = document.createElement('textarea')
    textarea.setAttribute('rows', '4')
    textarea.className = 'form-control'

    textarea.value = value || ''

    const getPatchUpdate = async (): Promise<OrganizationAttributeUpdateOptions> => {
        const data: Dictionary<any> = {}
        data[attribute.LogicalName] = textarea.value
        return {
            type: 'update',
            attribute,
            data,
        }
    }

    return {
        element: textarea,
        getPatchUpdate,
    }
}