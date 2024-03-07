export enum ActionSource {
    User = 1,
    Scheduler = 2,
    Dispatcher = 3,
}

export enum ActionType {
    BuiltInLED = -1,
    Relay = 1,
}


export enum ScheduleStatus {
    Pending = 1,
    Running = 2,
    Success = 3,
    Failed = 4
}

export const ScheduleStatusNames: { [key in ScheduleStatus]: string } = {
    [ScheduleStatus.Pending]: "Menunggu Eksekusi",
    [ScheduleStatus.Running]: "Berjalan",
    [ScheduleStatus.Success]: "Sukses",
    [ScheduleStatus.Failed]: "Gagal",
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
