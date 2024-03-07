import { Box, Button, Card, Chip, Grid, Typography } from '@mui/joy'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import action from '@/apis/action'
import report from '@/apis/report'
import { QUERY_GET_SENSOR_REPORT } from '@/apis/report.keys'
import { QUERY_KEY_GET_ACTION_HISTORIES, QUERY_KEY_GET_LAST_ACTION } from '@/apis/action.keys'
import { ActionSource, ActionType, ActionTypeNames, ActionTypeValues } from '@/constants/action'
import {
    ActionHistory,
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
import { defaultDateTimeFormat } from '@/constants/date'

const initialReportState = {
    [SensorType.SoilMoisture]: {
        data: [],
        max_number: 0,
        max_percentage: 0,
        min_number: 0,
        min_percentage: 0,
    },
}

const actionIconMap: ({ [key in ActionType]: any }) = {
    [ActionType.BuiltInLED]: FluorescentIcon,
    [ActionType.Relay]: WaterDropIcon
}

const actionSourceNameMap: ({ [key in ActionSource]: string }) = {
    [ActionSource.User]: "User",
    [ActionSource.Scheduler]: "Otomatis oleh Sistem",
    [ActionSource.Dispatcher]: "Oleh Sistem"
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

    const actionHistoriesQuery = useQuery<ActionHistory[]>({
        queryKey: [QUERY_KEY_GET_ACTION_HISTORIES],
        queryFn: () => action.getActionHistories(1)
    })

    const builtInLEDMutation = useMutation({
        mutationFn: (request: DispatchActionRequest) => action.dispatchAction(request),
        onMutate: async () => {
            const key = [QUERY_KEY_GET_LAST_ACTION, 1, ActionType.BuiltInLED]
            await queryClient.cancelQueries({ queryKey: key })
            return !queryClient.getQueryData(key)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY_GET_LAST_ACTION, 1, ActionType.BuiltInLED] })
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY_GET_ACTION_HISTORIES] })
        },
    })

    const relayMutation = useMutation({
        mutationFn: (request: DispatchActionRequest) => action.dispatchAction(request),
        onMutate: async () => {
            const key = [QUERY_KEY_GET_LAST_ACTION, 1, ActionType.Relay]
            await queryClient.cancelQueries({ queryKey: key })
            return !queryClient.getQueryData(key)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY_GET_LAST_ACTION, 1, ActionType.Relay] })
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY_GET_ACTION_HISTORIES] })
        }
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
                Icon={actionIconMap[ActionType.BuiltInLED]}
                on={builtInLEDState?.value || false}
                onText={ActionTypeValues[ActionType.BuiltInLED].find(v => v.value)?.text || "On"}
                offText={ActionTypeValues[ActionType.BuiltInLED].find(v => !v.value)?.text || "Off"}
                isLoading={builtInLEDQuery.isFetching || builtInLEDMutation.isPending}
                onClick={() => mutateState(ActionType.BuiltInLED, !(builtInLEDState?.value as boolean))} />
            <ButtonCard
                title={ActionTypeNames[ActionType.Relay]}
                Icon={actionIconMap[ActionType.Relay]}
                on={relayState?.value || false}
                onText={ActionTypeValues[ActionType.Relay].find(v => v.value == true)?.text || "On"}
                offText={ActionTypeValues[ActionType.Relay].find(v => !v.value)?.text || "Off"}
                isLoading={relayQuery.isFetching || relayMutation.isPending}
                onClick={() => mutateState(ActionType.Relay, !(relayState?.value as boolean))} />
        </Box>
        <Box sx={{ mt: 0 }}>
            <Typography sx={{ mt: 4 }} fontSize='1.2rem' fontWeight='600'>Riwayat Kontrol</Typography>
            {!actionHistoriesQuery.isLoading && (
                <Grid container direction='column' sx={{ mt: 2 }} gap={2}>
                    {actionHistoriesQuery.data?.map(history => {
                        const Icon = actionIconMap[history.action_type]
                        return (
                            <Card>
                                <Grid container justifyContent='space-between'>
                                    {/* Left section */}
                                    <Grid container alignItems='center' gap={2}>
                                        <Icon />
                                        <Grid>
                                            <Typography fontSize='sm' fontWeight='600'>{ActionTypeNames[history.action_type]}</Typography>
                                            <Chip color={history.value ? 'success' : 'danger'} size='sm' variant='solid' sx={{
                                                "--Chip-paddingInline": "1em"
                                            }}>{ActionTypeValues[history.action_type].find(v => v.value == history.value)?.text}</Chip>
                                        </Grid>
                                    </Grid>
                                    {/* Right Section */}
                                    <Grid container direction='column' alignItems='flex-end'>
                                        <Typography fontSize='sm' textColor={'primary.600'} fontWeight='600'>{dayjs(history.action_at).format(defaultDateTimeFormat)}</Typography>
                                        <Typography fontSize='sm'>{actionSourceNameMap[history.action_by]}</Typography>
                                    </Grid>
                                </Grid>
                            </Card>
                        )
                    })}
                </Grid>
            )}
        </Box>
    </Box>
}


const ButtonCard = ({ title, isLoading, on, Icon, onClick, onText, offText }: ButtonCardProps) => {
    return <Card variant='solid' sx={{
        cursor: 'pointer', userSelect: 'none',
        background: '#48435C'
    }} onClick={isLoading ? undefined : onClick}>
        {title && <Typography fontWeight='600' textColor='common.white' sx={{ mb: 2 }}>{title}</Typography>}
        <Icon sx={{ zIndex: 1, position: 'absolute', right: 20, opacity: .2 }} fontSize="large" />
        <Button loading={isLoading} variant='solid' sx={{ zIndex: 2, mt: 'auto', p: 0.5, pointerEvents: 'none', backgroundColor: on ? '#2479ff' : '#ff4250', mb: 1 }}>
            {on ? onText : offText}
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
    onText: string
    offText: string
    onClick?: () => void
}

export default Home