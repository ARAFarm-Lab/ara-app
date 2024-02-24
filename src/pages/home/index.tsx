import { Box, Card, Typography } from '@mui/joy'
import './index.css'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import action from '@/apis/action'
import report from '@/apis/report'
import { QUERY_GET_SENSOR_REPORT } from '@/apis/report.keys'
import { QUERY_KEY_GET_LAST_ACTION } from '@/apis/action.keys'
import { ActionType } from '@/constants/action'
import {
    DispatchActionRequest,
    LastActionResponse
} from '@/apis/action.types'
import { useEffect, useMemo, useState } from 'react'
import { LineChart } from '@mui/x-charts/LineChart'
import { SensorReport, SensorValue } from '@/apis/report.types'
import dayjs, { Dayjs } from 'dayjs'
import { SensorType } from '@/constants/sensor'

const Home = () => {
    const queryClient = useQueryClient()
    const [reportData, setReportData] = useState<{ [key in SensorType]: SensorValue[] }>({
        [SensorType.SoilMoisture]: [],
    })
    const [reportStartTime, setReportStartTime] = useState<Dayjs>(createDateHourDayJSNow().add(-1, "hour"))

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
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: [QUERY_KEY_GET_LAST_ACTION, 1, ActionType.BuiltInLED] }) }
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
        setReportData(prev => ({
            ...prev,
            [SensorType.SoilMoisture]: appendReportData(prev[SensorType.SoilMoisture], soilMoistureSensorReportQuery.data?.data)
        }))
    }, [soilMoistureSensorReportQuery.data, soilMoistureSensorReportQuery.isLoading])

    return <>
        <Box sx={{ p: 2 }}>
            <Typography fontSize="1.2rem" fontWeight='600'>{generateGreetingMessage()}</Typography>
            <Typography fontSize="sm">Admin</Typography>
        </Box>
        <LineChart
            xAxis={[{
                dataKey: 'time',
                scaleType: 'time',
                min: new Date(reportData[SensorType.SoilMoisture][0]?.time),
                max: new Date(reportData[SensorType.SoilMoisture][reportData[SensorType.SoilMoisture].length - 1]?.time),
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
            yAxis={[{ label: '%' }]}
            slotProps={{
                legend: { hidden: true }
            }}
            // Need to parse the time to date object since LineChart can not accept string as input for the xAxis
            dataset={reportData[SensorType.SoilMoisture].map(data => ({
                ...data,
                time: new Date(data.time),
            }))}
            height={200}
        />
        <Box sx={{ display: 'grid', gap: 2, margin: 2, gridTemplateColumns: '1fr 1fr' }}>
            <ButtonCard title='Built In LED' isLoading={builtInLEDQuery.isFetching || builtInLEDMutation.isPending} onClick={() => mutateState(ActionType.BuiltInLED, !(builtInLEDState?.value as boolean))}>
                <StatusChip on={builtInLEDState?.value as boolean} />
                <Typography textColor='#aaa' fontStyle='italic' fontSize='.8em'>Last Update {convertTimeToFulldate(new Date(builtInLEDState?.action_at as string))}</Typography>
            </ButtonCard>
            <ButtonCard title='Solenoid Valve' isLoading={relayQuery.isFetching || relayMutation.isPending} onClick={() => mutateState(ActionType.Relay, !(relayState?.value as boolean))}>
                <StatusChip on={relayState?.value as boolean} />
                <Typography textColor='#aaa' fontStyle='italic' fontSize='.8em'>Last Update {convertTimeToFulldate(new Date(relayState?.action_at as string))}</Typography>
            </ButtonCard>
        </Box>
    </>
}


const ButtonCard = ({ title, isLoading, children, onClick }: ButtonCardProps) => {
    return <Card variant='soft' sx={{
        cursor: 'pointer', userSelect: 'none', ":active": {
            backgroundColor: "#f8f8f8",
        }
    }} onClick={isLoading ? undefined : onClick}>
        {title && <Typography fontWeight='600'>{title}</Typography>}
        {isLoading ? <p>Loading...</p> : (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {children}
            </Box>
        )}
    </Card>
}
const StatusChip = ({ on }: { on: boolean }) => {
    return <Card
        variant='solid'
        sx={{ p: 0.5, backgroundColor: on ? '#7EC0EE' : '#FF8C94', mb: 1 }}
    >
        <Typography textAlign='center' textColor='white'>{on ? 'ON' : 'OFF'}</Typography>
    </Card>
}

const appendReportData = (prev: SensorValue[], data?: SensorValue[]): SensorValue[] => {
    if (!data || !prev) {
        return prev
    }
    return [...prev.slice(data.length), ...data]
}

const convertTimeToFulldate = (time: Date) => {
    const year = time.getFullYear()
    const month = time.getMonth() + 1
    const day = time.getDate()
    const hours = time.getHours()
    const minutes = time.getMinutes()
    const seconds = time.getSeconds()
    return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day} ${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`
}

const createDateHourDayJSNow = () => {
    return dayjs()
        .set("second", 0)
}

const generateGreetingMessage = () => {
    const date = new Date()
    const hours = date.getHours()
    if (hours >= 0 && hours < 12) {
        return 'Good Morning'
    } else if (hours >= 12 && hours < 18) {
        return 'Good Afternoon'
    } else {
        return 'Good Evening'
    }
}

type ButtonCardProps = {
    title?: string
    isLoading?: boolean
    children?: React.ReactNode
    onClick?: () => void
}

export default Home