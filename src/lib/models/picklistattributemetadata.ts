import { AttributeMetadata, Label } from '.'

export interface PicklistAttributeMetadata extends AttributeMetadata {
    OptionSet: PicklistOptions
    GlobalOptionSet: PicklistOptions
}

export interface PicklistOptions {
    Options: PicklistItem[]
}

export interface PicklistItem {
    Label: Label
    Value: number
}