import { AttributeMetadata } from '.'

export interface EntityMetadata {
    EntitySetName: string
    PrimaryIdAttribute: string

    Attributes: AttributeMetadata[]
}