import { Box, Button, Card, Typography } from '@mui/joy'
import './index.css'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import action from '@/apis/action'
import report from '@/apis/report'
import { QUERY_GET_SENSOR_REPORT } from '@/apis/report.keys'
import { QUERY_KEY_GET_LAST_ACTION } from '@/apis/action.keys'
import { ActionType, ActionTypeNames } from '@/constants/action'
import {
    DispatchActionRequest,
    LastActionResponse
} from '@/apis/action.types'
import { useEffect, useMemo, useRef, useState } from 'react'
import { LineChart } from '@mui/x-charts/LineChart'
import { SensorReport } from '@/apis/report.types'
import dayjs, { Dayjs } from 'dayjs'
import { SensorType } from '@/constants/sensor'
import FluorescentIcon from '@mui/icons-material/Fluorescent';
import WaterDropIcon from '@mui/icons-material/WaterDrop';

import icon from '@/assets/icon.png'

const initialReportState = {
    [SensorType.SoilMoisture]: {
        data: [],
        max_number: 0,
        max_percentage: 0,
        min_number: 0,
        min_percentage: 0,
    },
}

const Home = () => {
    const queryClient = useQueryClient()
    const [reportData, setReportData] = useState<{ [key in SensorType]: SensorReport }>(initialReportState)
    const [reportStartTime, setReportStartTime] = useState<Dayjs>(createDateHourDayJSNow().add(-1, "hour"))

    const sensorReportCardRef = useRef<HTMLElement>()

    const builtInLEDQuery = useQuery<LastActionResponse>({
        queryKey: [QUERY_KEY_GET_LAST_ACTION, 1, ActionType.BuiltInLED],
        queryFn: () => action.getLastAction(1, ActionType.BuiltInLED),
    })

    const relayQuery = useQuery<LastActionResponse>({
        queryKey: [QUERY_KEY_GET_LAST_ACTION, 1, ActionType.Relay],
        queryFn: () => action.getLastAction(1, ActionType.Relay),
    })

    const soilMoistureSensorReportQuery = useQuery<SensorReport>({
        queryKey: [QUERY_GET_SENSOR_REPORT, reportStartTime.format()],
        queryFn: () => report.getSensorReport({
            start_time: reportStartTime.format(),
            end_time: createDateHourDayJSNow().format(),
            device_id: 1,
            sensor_type: SensorType.SoilMoisture
        }),
    })

    const builtInLEDMutation = useMutation({
        mutationFn: (request: DispatchActionRequest) => action.dispatchAction(request),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: [QUERY_KEY_GET_LAST_ACTION, 1, ActionType.BuiltInLED] }) },
        onMutate: async () => {
            const key = [QUERY_KEY_GET_LAST_ACTION, 1, ActionType.BuiltInLED]
            await queryClient.cancelQueries({ queryKey: key })
            return !queryClient.getQueryData(key)
        }
    })

    const relayMutation = useMutation({
        mutationFn: (request: DispatchActionRequest) => action.dispatchAction(request),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: [QUERY_KEY_GET_LAST_ACTION, 1, ActionType.Relay] }) }
    })

    const builtInLEDState = useMemo(() => builtInLEDQuery.data, [builtInLEDQuery.data])
    const relayState = useMemo(() => relayQuery.data, [relayQuery.data])

    const mutateState = (actionType: ActionType, state: boolean) => {
        const mutator = actionType === ActionType.BuiltInLED ? builtInLEDMutation : relayMutation
        const request: DispatchActionRequest = {
            action_type: actionType,
            device_id: 1,
            value: state,
        }
        mutator.mutate(request)
    }

    useEffect(() => {
        const timeout = setTimeout(() => {
            setReportStartTime(createDateHourDayJSNow().add(-1, "minutes"))
        }, 60 * 1000) // 1 minute

        return () => { clearTimeout(timeout) }
    }, [reportStartTime])

    useEffect(() => {
        if (soilMoistureSensorReportQuery.isLoading) return
        if (!soilMoistureSensorReportQuery.data?.data.length) return
        setReportData(prev => ({
            ...prev,
            [SensorType.SoilMoisture]: appendReportData(prev[SensorType.SoilMoisture], soilMoistureSensorReportQuery?.data)
        }))
    }, [soilMoistureSensorReportQuery.data, soilMoistureSensorReportQuery.isLoading])

    return <Box sx={{ p: 2 }}>
        <Card variant="solid" color='primary' sx={{ borderRadius: 16, gap: 0, p: 4, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
                <Typography textColor="common.white" fontSize="1.4rem" fontWeight='500'>{generateGreetingMessage()}</Typography>
                <Typography textColor="common.white" fontSize="xs">Admin</Typography>
            </Box>
            <img src={icon} width={80} height={80} />
        </Card>
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography fontSize='1.2rem' fontWeight='600'>Dashboard</Typography>
        </Box>
        <Card sx={{ mt: 2, gap: 0, pt: 3, overflow: 'hidden' }} variant='soft'>
            <Box ref={sensorReportCardRef}>
                <Typography fontSize="1rem">Kelembapan Tanah</Typography>
                <LineChart
                    xAxis={[{
                        dataKey: 'time',
                        scaleType: 'time',
                        min: new Date(reportData[SensorType.SoilMoisture].data[0]?.time),
                        max: new Date(reportData[SensorType.SoilMoisture].data[reportData[SensorType.SoilMoisture].data.length - 1]?.time),
                        valueFormatter: (date: Date) => dayjs(date).format("HH:mm"),
                    }]}
                    series={[
                        {
                            dataKey: "value_percentage",
                            label: "Percentage",
                            showMark: false,
                            area: true,
                            color: '#7EC0EE'
                        },
                    ]}
                    slotProps={{
                        legend: { hidden: true },
                    }}
                    // Need to parse the time to date object since LineChart can not accept string as input for the xAxis
                    dataset={reportData[SensorType.SoilMoisture].data?.map(data => ({
                        ...data,
                        time: new Date(data.time),
                    }))}
                    height={180}
                    margin={{
                        bottom: 20,
                        left: 30,
                        right: 20,
                        top: 20
                    }}
                    width={sensorReportCardRef?.current?.clientWidth || 0}
                />
            </Box>
        </Card>
        <Typography sx={{ mt: 4 }} fontSize='1.2rem' fontWeight='600'>Panel Kontrol</Typography>
        <Box sx={{ display: 'grid', gap: 2, mt: 2, gridTemplateColumns: '1fr 1fr' }}>
            <ButtonCard
                title={ActionTypeNames[ActionType.BuiltInLED]}
                Icon={FluorescentIcon}
                on={builtInLEDState?.value || false}
                isLoading={builtInLEDQuery.isFetching || builtInLEDMutation.isPending}
                onClick={() => mutateState(ActionType.BuiltInLED, !(builtInLEDState?.value as boolean))} />
            <ButtonCard
                title={ActionTypeNames[ActionType.Relay]}
                Icon={WaterDropIcon}
                on={relayState?.value || false}
                isLoading={relayQuery.isFetching || relayMutation.isPending}
                onClick={() => mutateState(ActionType.Relay, !(relayState?.value as boolean))} />
        </Box>
        <Typography sx={{ mt: 4 }} fontSize='1.2rem' fontWeight='600'>History Kontrol</Typography>
    </Box>
}


const ButtonCard = ({ title, isLoading, on, Icon, onClick }: ButtonCardProps) => {
    return <Card variant='solid' sx={{
        cursor: 'pointer', userSelect: 'none',
        background: '#48435C'
    }} onClick={isLoading ? undefined : onClick}>
        {title && <Typography fontWeight='600' textColor='common.white' sx={{ mb: 2 }}>{title}</Typography>}
        <Icon sx={{ zIndex: 1, position: 'absolute', right: 20, opacity: .2 }} fontSize="large" />
        <Button loading={isLoading} variant='solid' sx={{ zIndex: 2, mt: 'auto', p: 0.5, pointerEvents: 'none', backgroundColor: on ? '#2479ff' : '#ff4250', mb: 1 }}>
            {on ? "ON" : "OFF"}
        </Button>
    </Card>
}

const appendReportData = (prev: SensorReport, report?: SensorReport): SensorReport => {
    if (!report || !prev) {
        return prev
    }
    return {
        ...report,
        data: [...prev.data.slice(report.data.length), ...report.data]
    }
}
const createDateHourDayJSNow = () => {
    return dayjs()
        .set("second", 0)
}

const generateGreetingMessage = () => {
    const date = new Date()
    const hours = date.getHours()
    if (hours >= 0 && hours < 12) {
        return 'Selamat Pagi'
    } else if (hours >= 12 && hours < 18) {
        return 'Selamat Siang'
    } else {
        return 'Selamat Malam'
    }
}

type ButtonCardProps = {
    title?: string
    isLoading?: boolean
    children?: React.ReactNode
    on: boolean
    Icon: any
    onClick?: () => void
}

export default Home