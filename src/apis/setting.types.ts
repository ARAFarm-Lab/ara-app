import { ActionIcon, ActionType } from "@/constants/action"

export type Actuator = {
    id: number,
    pin_number: number,
    action_type: ActionType,
    name: string,
    icon: ActionIcon
}