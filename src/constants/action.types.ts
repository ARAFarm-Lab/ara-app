export enum ActionType {
    BuiltInLED = -1,
    Relay = 1,
}

export const ActionTypeNames: { [key in ActionType]: string } = {
    [ActionType.BuiltInLED]: 'Built In LED',
    [ActionType.Relay]: 'Solenoid Valve',
}

type ActionTypeValue = {
    value: boolean
    text: string
}

export const ActionTypeValues: { [key in ActionType]: ActionTypeValue[] } = {
    [ActionType.BuiltInLED]: [
        { value: false, text: 'Off' }, { value: true, text: 'On' }
    ],
    [ActionType.Relay]: [
        { value: false, text: 'Off' }, { value: true, text: 'On' }
    ],
}

export type ActionValue = boolean
