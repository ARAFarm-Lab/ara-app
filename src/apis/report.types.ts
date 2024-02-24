import { SensorType } from "@/constants/sensor"

export type GetSensorReportRequest = {
    start_time: string
    end_time: string
    device_id: number
    sensor_type: SensorType
}

export type SensorReport = {
    data: SensorValue[]
    max_percentage: number
    max_number: number
    min_percentage: number
    min_number: number
}

export type SensorValue = {
    time: string
    value_percentage: number
    value: number
}
