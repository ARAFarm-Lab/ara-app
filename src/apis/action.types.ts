import { ActionType } from "@/constants/action.types"

type ActionValue = boolean | number

export type DispatchActionRequest = {
    action_type: ActionType
    device_id: number
    value: ActionValue
}

export type LastActionResponse = {
    value: ActionValue
    action_at: string
}