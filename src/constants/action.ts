export enum ActionType {
    BuiltInLED = -1,
    Relay = 1,
}

export const ActionTypeNames: { [key in ActionType]: string } = {
    [ActionType.BuiltInLED]: 'Lampu Alat',
    [ActionType.Relay]: 'Kran Air',
}

type ActionTypeValue = {
    value: boolean
    text: string
}

export const ActionTypeValues: { [key in ActionType]: ActionTypeValue[] } = {
    [ActionType.BuiltInLED]: [
        { value: false, text: 'Mati' }, { value: true, text: 'Nyala' }
    ],
    [ActionType.Relay]: [
        { value: false, text: 'Tutup' }, { value: true, text: 'Buka' }
    ],
}

export type ActionValue = boolean
