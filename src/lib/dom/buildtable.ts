import { OrganizationAttributeUpdateOptions } from '..'
import { AttributeMetadata } from '../models'
import { WebApi } from '../services'
import { Dictionary } from '../utilities'
import { onClickEdit } from './onclickedit'

export function buildTable(options: BuildTableOptions): void {
    const { attributes } = options

    const tbody = document.getElementById('tbody')!

    for (const key in attributes) {
        const attribute = attributes[key]

        const tr = document.createElement('tr')
        tr.setAttribute('data-logicalname', attribute.LogicalName)
        tbody.appendChild(tr)

        const tdDisplayName = document.createElement('td')
        tdDisplayName.innerText = attribute.DisplayName?.UserLocalizedLabel?.Label ?? attribute.LogicalName
        tr.appendChild(tdDisplayName)

        const tdDescription = document.createElement('td')
        tdDescription.innerText = attribute.Description?.UserLocalizedLabel?.Label ?? ''
        tr.appendChild(tdDescription)

        const tdLogicalName = document.createElement('td')
        tdLogicalName.innerText = attribute.LogicalName
        tr.appendChild(tdLogicalName)

        const tdDataType = document.createElement('td')
        tdDataType.innerText = attribute.AttributeType
        tr.appendChild(tdDataType)

        const tdEdit = document.createElement('td')
        const btnEdit = document.createElement('button')
        btnEdit.innerText = 'Edit'
        btnEdit.className = 'btn btn-info btn-small'
        btnEdit.onclick = () => onClickEdit({ ...options, attribute })
        
        btnEdit.setAttribute('data-toggle', 'modal')
        btnEdit.setAttribute('data-target', '#modal')

        tdEdit.appendChild(btnEdit)
        tr.appendChild(tdEdit)
    }
}

export interface BuildTableOptions {
    attributes: Dictionary<AttributeMetadata>
    entity: any
    webApi: WebApi
    getAttributeValue: (attribute: AttributeMetadata) => any
    updateEntity: (options: OrganizationAttributeUpdateOptions) => Promise<void>
}
