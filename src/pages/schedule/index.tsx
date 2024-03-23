import { Action, DispatchActionRequest } from "@/apis/action.types";
import schedulerAPI from '@/apis/scheduler';
import { CreateSchedulerRequest, ScheduledTask } from "@/apis/scheduler.types";
import { ActionType, ActionTypeValues, ScheduleStatusNames } from "@/constants/action";
import { SchedulerRecurringMode } from "@/constants/scheduler";
import { styled } from '@mui/material/styles';
import Add from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Button, Card, CardContent, Grid, LinearProgress, Option, Select, Tab, TabList, Tabs, Typography, tabClasses } from "@mui/joy";
import { TimePicker } from "@mui/x-date-pickers";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import dayjs, { Dayjs } from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import Modal from './modal';
import { Collapse, TextField } from "@mui/material";
import IconButton, { IconButtonProps } from '@mui/joy/IconButton';
import { defaultDateTimeFormat } from "@/constants/date";
import ConfirmationDialog from "../../components/confirmation-dialog"

import actionAPI from "@/apis/action"

const scheduleModeTabMap: { [key: number]: SchedulerRecurringMode } = {
    0: SchedulerRecurringMode.NONE,
    1: SchedulerRecurringMode.DAILY,
    2: SchedulerRecurringMode.HOURLY,
}

const scheduleModeIndexes: SchedulerRecurringMode[] = [
    SchedulerRecurringMode.NONE,
    SchedulerRecurringMode.DAILY,
    SchedulerRecurringMode.HOURLY,
]

const generateDefaultDateTime = () => dayjs(new Date()).add(1, 'minute')

const Schedule = () => {
    const queryClient = useQueryClient()
    const upcomingSchedulesQuery = useQuery({
        queryKey: [schedulerAPI.QUERY_KEY_GET_UPCOMING_SCHEDULES, 1],
        queryFn: schedulerAPI.getUpcomingSchedules
    })

    const availableActions = useQuery({
        queryKey: [actionAPI.QUERY_KEY_GET_ACTIONS, 1],
        queryFn: () => actionAPI.getActions(1)
    })

    const addScheduleMutation = useMutation({
        mutationFn: (request: CreateSchedulerRequest) => schedulerAPI.createSchedule(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [schedulerAPI.QUERY_KEY_GET_UPCOMING_SCHEDULES, 1] })
            setIsAddModalOpen(false)
        },
    })

    const deleteScheduleMutation = useMutation({
        mutationFn: (id: number) => schedulerAPI.deleteSchedule(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [schedulerAPI.QUERY_KEY_GET_UPCOMING_SCHEDULES, 1] })
            setIsDeleteConfirmationOpen(false)
        },
    })

    const updateScheduleMutation = useMutation({
        mutationFn: (schedule: ScheduledTask) => schedulerAPI.updateSchedule(schedule),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [schedulerAPI.QUERY_KEY_GET_UPCOMING_SCHEDULES, 1] })
            setIsAddModalOpen(false)
            setExpandedSchedule({
                id: -1,
            })
        },
    })

    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false)
    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState<boolean>(false)
    const [scheduleName, setScheduleName] = useState<string>("")
    const [duration, setScheduleDuration] = useState<number>(0)
    const [scheduleDescription, setScheduleDescription] = useState<string>("")
    const [scheduleModeIndex, setScheduleModeIndex] = useState<number>(0)
    const [scheduleTime, setScheduleTime] = useState<Dayjs>(generateDefaultDateTime())
    const [actions, setActions] = useState<DispatchActionRequest[]>([])
    const [expandedSchedule, setExpandedSchedule] = useState<Partial<ScheduledTask>>({
        id: -1,
    })
    const upcomingSchedules = useMemo(() => upcomingSchedulesQuery.data, [upcomingSchedulesQuery.data])
    const availableActionList: Action[] = useMemo(() => {
        if (availableActions.isLoading || availableActions.data?.length == 0) {
            return []
        }
        return availableActions.data?.map((item) => {
            return { ...item }
        }) as Action[]
    }, [availableActions.data, availableActions.isLoading])
    const defaultAddActionRequest: Partial<DispatchActionRequest> = useMemo(() => {
        if (availableActions.isLoading || availableActions.data?.length == 0) {
            return {}
        }
        const action = (availableActions?.data as Action[])[0]
        return {
            actuator_id: action.id,
            device_id: 1,
            value: false
        }
    }, [availableActions])

    const handleAddNewSchedule = () => {
        setScheduleName("")
        setScheduleDescription("")
        setScheduleDuration(0)
        setScheduleModeIndex(0)
        setScheduleTime(generateDefaultDateTime())
        setActions([])
        setExpandedSchedule({ id: -1 })
        setIsAddModalOpen(true)
    }

    const handleSaveSchedule = useCallback(() => {
        const request: CreateSchedulerRequest = {
            name: scheduleName,
            description: scheduleDescription,
            actions: actions,
            duration: duration > 0 ? duration : null,
            recurring_mode: scheduleModeTabMap[scheduleModeIndex],
            scheduled_at: scheduleTime.format('YYYY-MM-DDTHH:mm:ssZ')
        }

        addScheduleMutation.mutate(request)
    }, [scheduleName, scheduleDescription, scheduleModeIndex, scheduleTime, actions, duration, addScheduleMutation])

    const handleExpandSchedule = (schedule: ScheduledTask) => {
        setExpandedSchedule(currentSchedule => schedule.id == currentSchedule.id ? { id: -1 } : schedule)
    }

    const handleDeleteSchedule = () => {
        if (!expandedSchedule.id) return
        deleteScheduleMutation.mutate(expandedSchedule.id as number)
    }

    const handleEditSchedule = () => {
        if (!expandedSchedule.id) return
        // console.log(scheduleModeTabMap[scheduleModeIndex])
        updateScheduleMutation.mutate({
            ...expandedSchedule as ScheduledTask,
            name: scheduleName,
            description: scheduleDescription,
            duration: duration > 0 ? duration : null,
            scheduled_at: scheduleTime.format('YYYY-MM-DDTHH:mm:ssZ'),
            recurring_mode: scheduleModeTabMap[scheduleModeIndex],
            actions: actions
        })
    }

    const handleEditScheduleAction = () => {
        setScheduleName(expandedSchedule.name || "")
        setScheduleDescription(expandedSchedule.description || "")
        setScheduleDuration(expandedSchedule.duration || 0)
        setScheduleModeIndex(scheduleModeIndexes.indexOf(expandedSchedule.recurring_mode || 0))
        setScheduleTime(dayjs(expandedSchedule.scheduled_at || generateDefaultDateTime()))
        setActions(expandedSchedule.actions || [])
        setIsAddModalOpen(true)
    }

    const updateActionActuator = (index: number, actuator_id: number) => {
        const newActions = [...actions]
        newActions[index].actuator_id = actuator_id
        setActions(newActions)
    }

    const updateActionValue = (index: number, value: string) => {
        const newActions = [...actions]
        newActions[index].value = value === '1'
        setActions(newActions)
    }

    // Dynamically switch between DateTimePicker and TimePicker based on schedule mode
    const PickerComponent = useMemo(() => scheduleModeTabMap[scheduleModeIndex] === SchedulerRecurringMode.NONE ? DateTimePicker : TimePicker, [scheduleModeIndex])

    // Reset schedule time when mode changes
    useEffect(() => {
        if ((expandedSchedule.id || 0) > 0) return
        setScheduleTime(generateDefaultDateTime())
    }, [scheduleModeIndex, expandedSchedule])

    return (
        <>
            <Box sx={{ px: 2 }}>
                <Typography sx={{ mt: 4 }} level="h2" fontWeight='500'>Penjadwalan</Typography>
                <Grid key="main-grid" container direction='column' sx={{ mt: 2 }} gap={2} >
                    <Button
                        variant='solid'
                        size="md"
                        color='primary'
                        startDecorator={<Add />}
                        onClick={handleAddNewSchedule}
                    >Tambah Jadwal</Button>
                    {upcomingSchedulesQuery.isLoading && <LinearProgress />}
                    {!upcomingSchedulesQuery.isLoading && !upcomingSchedules?.length && <Typography color="neutral" fontSize='sm'>Tidak ada Jadwal</Typography>}
                    {upcomingSchedules?.map((schedule) => (
                        <Card key={schedule.id} variant="soft">
                            <Grid container width='100%' justifyContent='space-between'>
                                <Box>
                                    <Typography sx={{ m: 0 }} fontWeight='600'>{schedule.name}</Typography>
                                    <Typography color="primary" fontSize='sm'>{dayjs(schedule.next_run_at).format(defaultDateTimeFormat)}</Typography>
                                </Box>
                                <ExpandMore
                                    expand={expandedSchedule.id === schedule.id}
                                    onClick={() => handleExpandSchedule(schedule)}>
                                    <ExpandMoreIcon />
                                </ExpandMore>
                            </Grid>
                            <Collapse in={expandedSchedule.id == schedule.id} timeout="auto" unmountOnExit>
                                <CardContent>
                                    {schedule.description && <Box sx={{ mt: 2 }}>
                                        <Typography fontSize='sm' fontWeight={600}>Deskripsi</Typography>
                                        <Typography fontSize='sm'>{schedule.description}</Typography>
                                    </Box>}
                                    <Box sx={{ mt: 2 }}>
                                        <Typography fontSize='sm' fontWeight={600}>Waktu Eksekusi Terakhir</Typography>
                                        <Typography fontSize='sm'>{dayjs(schedule.last_run_at).format(defaultDateTimeFormat)}</Typography>
                                    </Box>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography fontSize='sm' fontWeight={600}>Status Terakhir</Typography>
                                        <Typography fontSize='sm'>{ScheduleStatusNames[schedule.last_run_status]}</Typography>
                                    </Box>
                                    <Box alignSelf='flex-end' gap={1} display='flex'>
                                        <Button onClick={handleEditScheduleAction}>Ubah</Button>
                                        <Button color="danger" onClick={() => setIsDeleteConfirmationOpen(true)}>Hapus</Button>
                                    </Box>
                                </CardContent>
                            </Collapse>
                        </Card>
                    ))}
                </Grid >
            </Box>

            {/* Add / Update Schedule Dialog */}
            <Modal
                title={(expandedSchedule.id || 0) > 0 ? "Ubah Jadwal" : "Tambah Jadwal"}
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                buttonActions={[
                    {
                        label: 'Simpan',
                        variant: 'solid',
                        color: 'primary',
                        loading: addScheduleMutation.isPending,
                        onClick: (expandedSchedule.id || 0) > 0 ? handleEditSchedule : handleSaveSchedule,
                    },
                    {
                        label: 'Tutup',
                        variant: 'outlined',
                        color: 'danger',
                        onClick: () => setIsAddModalOpen(false)
                    },
                ]}
            >
                <Grid container direction='column' gap={2}>
                    <form style={{
                        display: 'grid',
                        gap: '1em'
                    }}>
                        <TextField size="small" label="Nama" value={scheduleName} onChange={e => setScheduleName(e.target.value)} />
                        <TextField size="small" multiline minRows={2} label="Deskripsi" value={scheduleDescription} onChange={e => setScheduleDescription(e.target.value)} />
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
                                <Tab disableIndicator sx={{ textAlign: 'center' }}>Setiap Hari</Tab>
                                <Tab disableIndicator sx={{ textAlign: 'center' }}>Setiap Jam</Tab>
                            </TabList>
                        </Tabs>
                        <PickerComponent
                            disablePast
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
                        <TextField size="small" label="Durasi (Menit)" type="number" value={duration <= 0 ? "" : duration} onChange={e => setScheduleDuration(Number(e.target.value))} />
                        <Typography fontWeight='500'>Aksi</Typography>
                        {actions.map((action, index) => {
                            const selectedAction = availableActions.data?.find(item => item.id = action.actuator_id)
                            const values = ActionTypeValues[selectedAction?.type as ActionType]
                            return <Card key={`action-${index + 1}`} variant="soft">
                                <Grid container direction='row' gap={1}>
                                    <Select value={action.actuator_id} onChange={(_, val) => updateActionActuator(index, val as number)}>
                                        {availableActionList.map(item => <Option key={`actuator-item-${index}-${item.id}`} value={item.id}>{item.name}</Option>)}
                                    </Select>
                                    <Select value={action.value ? "1" : "0"} onChange={(_, val) => updateActionValue(index, val as string)}>
                                        {Object.keys(values).map(key => <Option key={`actuator-value-${index}-${key}`} value={key}>{values[key]}</Option>)}
                                    </Select>
                                    <IconButton sx={{ ml: 'auto' }} variant="plain" color="danger" onClick={() => setActions(prev => prev.filter((_, i) => i !== index))}><DeleteIcon /></IconButton>
                                </Grid>
                            </Card>
                        })}
                        {defaultAddActionRequest.actuator_id && <Button variant="soft" startDecorator={<Add />} color="primary" onClick={() => setActions(prev => ([...prev, { ...defaultAddActionRequest as DispatchActionRequest }]))}>Tambah Aksi</Button>}
                    </form>
                </Grid>
            </Modal >

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                description={`Apakah anda yakin untuk menghapus jadwal ${expandedSchedule.name} ? Anda perlu membuat jadwal baru jika ingin mengembalikan`}
                isOpen={isDeleteConfirmationOpen}
                cancelText="Batalkan"
                okText="Hapus"
                onCancel={() => setIsDeleteConfirmationOpen(false)}
                onOk={handleDeleteSchedule}
                title={`Hapus jadwal ${expandedSchedule.name}`}
            />
        </>
    )
}

interface ExpandMoreProps extends IconButtonProps {
    expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { expand, ...rest } = props
    return <IconButton {...rest} />;
})(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));


export default Schedule