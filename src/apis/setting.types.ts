import { ActionIcon, ActionType } from '@/constants/action';

export type Actuator = {
    id: number,
    pin_number: number,
    action_type: ActionType,
    name: string,
    terminal_number: number,
    icon: ActionIcon,
    is_active: boolean
}