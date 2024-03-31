import { Box, Button, Card, Chip, CircularProgress, Grid, LinearProgress, Link, Typography } from '@mui/joy'
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import actionAPI from '@/apis/action'
import authAPI from '@/apis/auth'
import reportAPI from '@/apis/report'
import { ActionSource, getActionIcon, getActionValueText } from '@/constants/action'
import {
    Action,
    ActionHistory,
    DispatchActionRequest,
} from '@/apis/action.types'
import React, { useEffect, useRef, useState } from 'react'
import { LineChart } from '@mui/x-charts/LineChart'
import { SensorReport } from '@/apis/report.types'
import dayjs, { Dayjs } from 'dayjs'
import { SensorType } from '@/constants/sensor'

import icon from '@/assets/icon.png'
import useTabStore from '@/stores/tab'
import { createLazyRoute } from '@tanstack/react-router'

const initialReportState = {
    [SensorType.SoilMoisture]: {
        data: [],
        max_number: 0,
        max_percentage: 0,
        min_number: 0,
        min_percentage: 0,
    },
}

const actionSourceNameMap: ({ [key in ActionSource]: string }) = {
    [ActionSource.User]: "User",
    [ActionSource.Scheduler]: "Otomatis oleh Sistem",
    [ActionSource.Dispatcher]: "Oleh Sistem"
}

const Dashboard = () => {
    const queryClient = useQueryClient()
    const [reportData, setReportData] = useState<{ [key in SensorType]: SensorReport }>(initialReportState)
    const [mutationLoading, setMutationLoading] = useState<{ [key: string]: boolean }>({})
    const [reportStartTime, setReportStartTime] = useState<Dayjs>(createDateHourDayJSNow().add(-1, "hour"))
    const sensorReportCardRef = useRef<HTMLElement>()
    const { setTab } = useTabStore()

    const userInfoQuery = useQuery({
        queryFn: authAPI.getUserInfo,
        queryKey: [authAPI.QUERY_KEY_GET_USER_INFO]
    })

    const actions = useQuery<Action[]>({
        queryKey: [actionAPI.QUERY_KEY_GET_ACTIONS],
        queryFn: () => actionAPI.getActions(1)
    })

    const actionStates = useQueries({
        queries: actions.data?.map(action => ({
            queryKey: [actionAPI.QUERY_KEY_GET_ACTION_VALUE, 1, action.id],
            queryFn: () => actionAPI.getActionValue(1, action.id)
        })) || []
    })

    const actionMutation = useMutation({
        mutationFn: (request: DispatchActionRequest) => actionAPI.dispatchAction(request),
        onMutate: async (request) => {
            setMutationLoading(prev => ({ ...prev, [request.actuator_id]: true }))
            await queryClient.cancelQueries({ queryKey: [actionAPI.QUERY_KEY_GET_ACTION_VALUE, 1, request.actuator_id] })
            return !queryClient.getQueryData([actionAPI.QUERY_KEY_GET_ACTION_VALUE, 1, request.actuator_id])
        },
        onSuccess: (_, request) => {
            queryClient.invalidateQueries({ queryKey: [actionAPI.QUERY_KEY_GET_ACTION_VALUE, 1, request.actuator_id] })
            queryClient.invalidateQueries({ queryKey: [actionAPI.QUERY_KEY_GET_ACTION_HISTORIES] })
            setMutationLoading(prev => ({ ...prev, [request.actuator_id]: false }))
        }
    })

    const soilMoistureSensorReportQuery = useQuery<SensorReport>({
        queryKey: [reportAPI.QUERY_GET_SENSOR_REPORT, reportStartTime.format()],
        queryFn: () => reportAPI.getSensorReport({
            start_time: reportStartTime.format(),
            end_time: createDateHourDayJSNow().format(),
            device_id: 1,
            sensor_type: SensorType.SoilMoisture
        }),
    })

    const actionHistoriesQuery = useQuery<ActionHistory[]>({
        queryKey: [actionAPI.QUERY_KEY_GET_ACTION_HISTORIES],
        queryFn: () => actionAPI.getActionHistories(1)
    })


    const mutateState = (actuator_id: number, value: boolean) => {
        if (mutationLoading[actuator_id]) {
            return
        }
        const request: DispatchActionRequest = {
            actuator_id,
            device_id: 1,
            value: value,
        }
        actionMutation.mutate(request)
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

    return <Box sx={{ p: 2 }} className='fade'>
        <Card variant="solid" color='primary' sx={{ borderRadius: 16, gap: 0, p: 4, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
                <Typography textColor="common.white" fontSize="1.4rem" fontWeight='500'>{generateGreetingMessage()}</Typography>
                <Typography textColor="common.white" fontSize="xs">{userInfoQuery.data?.name}</Typography>
            </Box>
            <img src={icon} width={80} height={80} />
        </Card>
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography fontSize='1.2rem' fontWeight='600'>Dashboard</Typography>
        </Box>
        <Card sx={{ mt: 2, gap: 0, pt: 3, overflow: 'hidden' }} variant='soft'>
            <Box ref={sensorReportCardRef}>
                <Typography fontSize="1rem">Kelembapan Tanah</Typography>
                {soilMoistureSensorReportQuery.isLoading ? (
                    <Grid container justifyContent='center'>
                        <CircularProgress />
                    </Grid>
                ) : (
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
                )}
            </Box>
        </Card>
        <Typography sx={{ mt: 4 }} fontSize='1.2rem' fontWeight='600'>Panel Kontrol</Typography>
        {actions.isLoading ? <LinearProgress sx={{ mt: 2 }} /> :
            (actions.data?.length || 0) == 0 ? (
                <Typography color="neutral" fontSize="sm" textAlign="center" sx={{ mt: 2 }}>
                    Panel aktif tidak ditemukan. Pastikan panel di halaman <Link onClick={() => setTab(3)} fontWeight='600'>pengaturan</Link> telah aktif
                </Typography>
            ) :
                <Box sx={{ display: 'grid', gap: 2, mt: 2, gridTemplateColumns: '1fr 1fr' }}>
                    {actions.data?.map((action, index) => {
                        const state = actionStates[index]
                        return <ButtonCard
                            key={index}
                            id={index}
                            title={action.name}
                            Icon={getActionIcon(action.icon)}
                            on={state.data?.value || false}
                            onText={getActionValueText(action.type, true)}
                            offText={getActionValueText(action.type, false)}
                            isLoading={state?.isLoading || mutationLoading[action.id]}
                            onClick={() => mutateState(action.id, !state.data?.value)} />
                    })}
                </Box>
        }
        <Box sx={{ mt: 0 }}>
            <Typography sx={{ mt: 4 }} fontSize='1.2rem' fontWeight='600'>Riwayat Kontrol</Typography>
            {actionHistoriesQuery.isLoading ? <LinearProgress sx={{ mt: 2 }} /> : (
                <Grid container direction='column' sx={{ mt: 2 }} gap={2}>
                    {actionHistoriesQuery.data?.map(history => {
                        const Icon = getActionIcon(history.action.icon)
                        return (
                            <Card key={`${history.action.id}-${history.action_at}`}>
                                <Grid container justifyContent='space-between'>
                                    <Grid container alignItems='center' gap={2}>
                                        <Icon />
                                        <Grid>
                                            <Typography fontSize='sm' fontWeight='600'>{history.action.name}</Typography>
                                            <Chip color={history.value ? 'success' : 'danger'} size='sm' variant='solid' sx={{
                                                "--Chip-paddingInline": "1em"
                                            }}>{getActionValueText(history.action.type, history.value)}</Chip>
                                        </Grid>
                                    </Grid>
                                    <Grid container direction='column' alignItems='flex-end'>
                                        <Typography fontSize='xs' textColor={'primary.600'} fontWeight='600'>{dayjs(history.action_at).format("DD-MM-YYYY")}</Typography>
                                        <Typography fontSize='xs' textColor={'primary.600'} fontWeight='600'>{dayjs(history.action_at).format("HH:mm")}</Typography>
                                        <Typography fontSize='xs'>{actionSourceNameMap[history.action_by]}</Typography>
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


const ButtonCard = (props: ButtonCardProps) => {
    const { title, isLoading, on, Icon, onClick, onText, offText } = props
    return <Card key={props.id} variant='solid' sx={{
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
    id: number,
    title?: string
    isLoading?: boolean
    children?: React.ReactNode
    on: boolean
    Icon: any
    onText: string
    offText: string
    onClick?: () => void
}

export const DashboardRoute = createLazyRoute('/dashboard')({
    component: Dashboard
})