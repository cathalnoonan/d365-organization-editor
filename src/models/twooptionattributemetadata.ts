import { AttributeMetadata, Label } from '.'

export interface TwoOptionAttributeMetadata extends AttributeMetadata {
    GlobalOptionSet: TwoOptionAttributeOptions
    OptionSet: TwoOptionAttributeOptions
}

export interface TwoOptionAttributeOptions {
    TrueOption: TwoOptionItem
    FalseOption: TwoOptionItem
}

export interface TwoOptionItem {
    Label: Label
    Value: boolean
}