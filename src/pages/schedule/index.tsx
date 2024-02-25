import { DispatchActionRequest } from "@/apis/action.types";
import schedulerAPI from '@/apis/scheduler';
import { QUERY_KEY_GET_UPCOMING_SCHEDULES } from "@/apis/scheduler.keys";
import { CreateSchedulerRequest } from "@/apis/scheduler.types";
import { ActionType, ActionTypeNames, ActionTypeValues } from "@/constants/action";
import { SchedulerRecurringMode } from "@/constants/scheduler";
import Add from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, Card, CardContent, Grid, IconButton, Input, Option, Select, Tab, TabList, Tabs, Textarea, Typography, tabClasses } from "@mui/joy";
import { TimePicker } from "@mui/x-date-pickers";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs, { Dayjs } from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import Modal from './modal';

const scheduleModeTabMap: { [key: number]: SchedulerRecurringMode } = {
    0: SchedulerRecurringMode.NONE,
    1: SchedulerRecurringMode.HOURLY,
    2: SchedulerRecurringMode.DAILY,
}

const defaultAddActionRequest = {
    action_type: ActionType.BuiltInLED,
    device_id: 1,
    value: ActionTypeValues[ActionType.BuiltInLED][0].value
}

const Schedule = () => {
    const queryClient = useQueryClient()
    const upcomingSchedulesQuery = useQuery({
        queryKey: [QUERY_KEY_GET_UPCOMING_SCHEDULES, 1],
        queryFn: schedulerAPI.getUpcomingSchedules
    })

    const addScheduleMutation = useMutation({
        mutationFn: (request: CreateSchedulerRequest) => schedulerAPI.createSchedule(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY_GET_UPCOMING_SCHEDULES, 1] })
            setIsModalOpen(false)
        },
    })

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [scheduleName, setScheduleName] = useState<string>("")
    const [duration, setScheduleDuration] = useState<number>(0)
    const [scheduleDescription, setScheduleDescription] = useState<string>("")
    const [scheduleModeIndex, setScheduleModeIndex] = useState<number>(0)
    const [scheduleTime, setScheduleTime] = useState<Dayjs>(dayjs(new Date()))
    const [actions, setActions] = useState<DispatchActionRequest[]>([])
    const upcomingSchedules = useMemo(() => upcomingSchedulesQuery.data, [upcomingSchedulesQuery.data])

    const handleSaveSchedule = useCallback(() => {
        const request: CreateSchedulerRequest = {
            name: scheduleName,
            description: scheduleDescription,
            actions: actions,
            recurring_mode: scheduleModeTabMap[scheduleModeIndex],
            scheduled_at: scheduleTime.format('YYYY-MM-DDTHH:mm:ssZ')
        }

        addScheduleMutation.mutate(request)
    }, [scheduleName, scheduleDescription, scheduleModeIndex, scheduleTime, actions, addScheduleMutation])

    const updateActionType = (index: number, value: ActionType) => {
        const newActions = [...actions]
        newActions[index].action_type = value
        setActions(newActions)
    }

    const updateActionValue = (index: number, value: string) => {
        const newActions = [...actions]
        if ([ActionType.BuiltInLED, ActionType.Relay].includes(newActions[index].action_type)) {
            newActions[index].value = value === 'true'
        }
        setActions(newActions)
    }

    // Dynamically switch between DateTimePicker and TimePicker based on schedule mode
    const PickerComponent = useMemo(() => scheduleModeTabMap[scheduleModeIndex] === SchedulerRecurringMode.NONE ? DateTimePicker : TimePicker, [scheduleModeIndex])

    // Reset schedule time when mode changes
    useEffect(() => {
        setScheduleTime(dayjs(new Date()))
    }, [scheduleModeIndex])

    return (
        <>
            <Box sx={{ px: 2 }}>
                <Typography sx={{ mt: 4 }} level="h2" fontWeight='500'>Penjadwalan</Typography>
                <Grid container direction='column' sx={{ mt: 2 }} gap={2} >
                    <Button
                        variant='solid'
                        size="md"
                        color='primary'
                        startDecorator={<Add />}
                        onClick={() => setIsModalOpen(true)}
                    >Tambah Jadwal</Button>
                    {!upcomingSchedules?.length && <Typography color="neutral" fontSize='sm'>Tidak ada Jadwal</Typography>}
                    {upcomingSchedules?.map((schedule) => (
                        <Card key={schedule.id} variant="soft">
                            <CardContent sx={{ gap: 1, display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography sx={{ m: 0 }} fontWeight='600'>{schedule.name}</Typography>
                                <Typography color="primary" fontSize='sm'>{dayjs(schedule.scheduled_at).format("DD-MM-YYYY HH:mm")}</Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Grid >
            </Box>
            <Modal
                title="Tambah Jadwal"
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                buttonActions={[
                    {
                        label: 'Simpan',
                        variant: 'solid',
                        color: 'primary',
                        loading: addScheduleMutation.isPending,
                        onClick: handleSaveSchedule,
                    },
                    {
                        label: 'Tutup',
                        variant: 'outlined',
                        color: 'danger',
                        onClick: () => setIsModalOpen(false)
                    },
                ]}
            >
                <Grid container direction='column' gap={2}>
                    <Input value={scheduleName} onChange={e => setScheduleName(e.currentTarget.value)} variant="soft" size="md" placeholder="Nama Jadwal" />
                    <Textarea value={scheduleDescription} onChange={e => setScheduleDescription(e.currentTarget.value)} variant="soft" size="md" minRows={2} placeholder="Deskripsi" />
                    <Tabs value={scheduleModeIndex} onChange={(_, val) => setScheduleModeIndex(val as number)} >
                        <TabList
                            disableUnderline
                            tabFlex={1}
                            sx={{
                                p: 0.5,
                                gap: 0.5,
                                borderRadius: 'xl',
                                bgcolor: 'background.level1',
                                [`& .${tabClasses.root}[aria-selected="true"]`]: {
                                    boxShadow: 'sm',
                                    bgcolor: 'background.surface',
                                },
                            }}>
                            <Tab disableIndicator sx={{ textAlign: 'center' }}>Sekali Waktu</Tab>
                            <Tab disableIndicator sx={{ textAlign: 'center' }}>Setiap Jam</Tab>
                            <Tab disableIndicator sx={{ textAlign: 'center' }}>Setiap Hari</Tab>
                        </TabList>
                    </Tabs>
                    <PickerComponent
                        value={scheduleTime}
                        onChange={date => setScheduleTime(date as Dayjs)}
                        format={`${scheduleModeTabMap[scheduleModeIndex] === SchedulerRecurringMode.NONE ? "DD-MM-YYYY " : ""}HH:mm`} // Show date for one time mode
                        label="Jadwal"
                        ampm={false}
                        viewRenderers={{
                            hours: renderTimeViewClock,
                            minutes: renderTimeViewClock,
                        }}
                    />
                    <Input value={duration} type="number" onChange={e => setScheduleDuration(Number(e.currentTarget.value))} variant="soft" size="md" placeholder="Durasi (Menit)" />
                    <Typography fontWeight='500'>Aksi</Typography>
                    {actions.map((action, index) => (
                        <Card key={`action-${index + 1}`} variant="soft">
                            <Grid container direction='row' gap={1}>
                                <Select value={action.action_type} onChange={(_, val) => updateActionType(index, val as ActionType)}>
                                    {(Object.values(ActionType).filter((v) => typeof v !== 'string')).map(key => <Option key={key} value={key}>{ActionTypeNames[key as ActionType]}</Option>)}
                                </Select>
                                <Select value={action.value.toString()} onChange={(_, val) => updateActionValue(index, val as string)}>
                                    {ActionTypeValues[action.action_type].map(value => <Option key={value.text} value={value.value.toString()}>{value.text}</Option>)}
                                </Select>
                                <IconButton sx={{ ml: 'auto' }} variant="plain" color="danger" onClick={() => setActions(prev => prev.filter((_, i) => i !== index))}><DeleteIcon /></IconButton>
                            </Grid>
                        </Card>
                    ))}
                    <Button variant="soft" startDecorator={<Add />} color="primary" onClick={() => setActions(prev => ([...prev, { ...defaultAddActionRequest }]))}>Tambah Aksi</Button>
                </Grid>
            </Modal>
        </>
    )
}

export default Schedule