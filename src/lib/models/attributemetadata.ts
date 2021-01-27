import { Label } from '.'

export interface AttributeMetadata {
    AttributeType: AttributeType
    IsValidForUpdate: boolean
    LogicalName: string
    MetadataId: string
    DisplayName: Label
    Description: Label
}

export type AttributeType = 'Virtual' | 'Boolean' | 'Integer' | 'Picklist' | 'Lookup'