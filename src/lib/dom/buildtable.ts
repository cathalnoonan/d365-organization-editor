import { OrganizationAttributeUpdateOptions } from '..'
import { AttributeMetadata } from '../models'
import { WebApi } from '../services'
import { onClickEdit } from './onclickedit'

export function buildTable(options: BuildTableOptions): void {
    const { attributes } = options

    const table = document.getElementById('t-body')!

    const columnClassNames = getColumnClassNames()

    for (const key in attributes) {
        const attribute = attributes[key]

        const row = document.createElement('div')
        row.className = 'd-flex'
        row.setAttribute('data-logicalname', attribute.LogicalName)
        table.appendChild(row)

        const displayName = document.createElement('div')
        displayName.className = columnClassNames.displayName
        displayName.innerText = attribute.DisplayName?.UserLocalizedLabel?.Label ?? attribute.LogicalName
        row.appendChild(displayName)

        const description = document.createElement('div')
        description.className = columnClassNames.description
        description.innerText = attribute.Description?.UserLocalizedLabel?.Label ?? ''
        row.appendChild(description)

        const logicalName = document.createElement('div')
        logicalName.className = columnClassNames.logicalName
        logicalName.innerText = attribute.LogicalName
        row.appendChild(logicalName)

        const dataType = document.createElement('div')
        dataType.className = columnClassNames.dataType
        dataType.innerText = attribute.AttributeType
        row.appendChild(dataType)

        const action = document.createElement('div')
        action.className = columnClassNames.action
        const btnEdit = document.createElement('button')
        btnEdit.innerText = 'Edit'
        btnEdit.className = 'btn btn-info btn-sm btn-w'
        btnEdit.onclick = () => onClickEdit({ ...options, attribute })

        btnEdit.setAttribute('data-toggle', 'modal')
        btnEdit.setAttribute('data-target', '#modal')

        action.appendChild(btnEdit)
        row.appendChild(action)
    }
}

export interface BuildTableOptions {
    attributes: Record<string, AttributeMetadata>
    entity: any
    webApi: WebApi
    getAttributeValue: (attribute: AttributeMetadata) => any
    updateEntity: (options: OrganizationAttributeUpdateOptions) => Promise<void>
}

function getColumnClassNames(): ColumnClassNames {
    return {
        displayName: document.getElementById('th-displayName')!.className,
        description: document.getElementById('th-description')!.className,
        logicalName: document.getElementById('th-logicalName')!.className,
        dataType: document.getElementById('th-dataType')!.className,
        action: document.getElementById('th-action')!.className,
    }
}

interface ColumnClassNames {
    displayName: string
    description: string
    logicalName: string
    dataType: string
    action: string
}