import FluorescentIcon from '@mui/icons-material/Fluorescent';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WbIncandescentIcon from '@mui/icons-material/WbIncandescent';
import BoltIcon from '@mui/icons-material/Bolt';
import ForestIcon from '@mui/icons-material/Forest';

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

export enum ActionIcon {
    Water = "icon-water",
    LED = "icon-led",
    Lamp = "icon-lamp",
    Electric = "icon-electric",
    Trees = "icon-trees"
}

const actionIconMap: ({ [key in ActionIcon]: any }) = {
    [ActionIcon.Water]: WaterDropIcon,
    [ActionIcon.LED]: FluorescentIcon,
    [ActionIcon.Lamp]: WbIncandescentIcon,
    [ActionIcon.Electric]: BoltIcon,
    [ActionIcon.Trees]: ForestIcon
}

export const getActionIcon = (icon: ActionIcon) => actionIconMap[icon] || WaterDropIcon

export const ScheduleStatusNames: { [key in ScheduleStatus]: string } = {
    [ScheduleStatus.Pending]: "Menunggu Eksekusi",
    [ScheduleStatus.Running]: "Berjalan",
    [ScheduleStatus.Success]: "Sukses",
    [ScheduleStatus.Failed]: "Gagal",
}

export const ActionTypeValues: { [key in ActionType]: { [key: string]: string } } = {
    [ActionType.BuiltInLED]: {
        "0": "Mati",
        "1": "Nyala",
    },
    [ActionType.Relay]: {
        "0": "Mati",
        "1": "Nyala",
    }
}

export const getActionValueText = (type: ActionType, value: boolean): string => ActionTypeValues[type][value ? "1" : "0"] || ""

export type ActionValue = boolean

