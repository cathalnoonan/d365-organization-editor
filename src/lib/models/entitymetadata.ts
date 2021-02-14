import { AttributeMetadata } from '.'
import { Label } from './label'

export interface EntityMetadata {
    EntitySetName: string
    PrimaryIdAttribute: string
    PrimaryNameAttribute: string
    DisplayName: Label

    Attributes: AttributeMetadata[]
}