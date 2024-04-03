import { useEffect, useState } from 'react';

import settingAPI from '@/apis/setting';
import { Actuator } from '@/apis/setting.types';
import userAPI from '@/apis/user';
import ConfirmationDialog from '@/components/confirmation-dialog';
import Modal from '@/components/modal';
import { ActionIcon, getActionIcon } from '@/constants/action';
import useAuthStore from '@/stores/auth';
import useNotification from '@/stores/notification';
import {
    Box, Button, Card, Chip, Grid, LinearProgress, Option, Select, Typography
} from '@mui/joy';
import { TextField } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createLazyRoute, useNavigate } from '@tanstack/react-router';

const Setting = () => {
    const [selectedPanel, setSelectedPanel] = useState<Actuator | null>()
    const [isLogoutModalOpened, setLogoutModalOpened] = useState(false)
    const [isEditPanelModalOpened, setEditPanelModalOpened] = useState(false)
    const auth = useAuthStore()
    const navigate = useNavigate()
    const notification = useNotification()

    const queryClient = useQueryClient()
    const actuators = useQuery({
        queryKey: [settingAPI.QUERY_KEY_GET_ACTUATORS, 1],
        queryFn: () => settingAPI.getActuators(1),
    })
    const editPanelMutation = useMutation({
        mutationFn: (actuator: Actuator) => settingAPI.updateActuator(actuator),
        onSuccess: () => {
            setSelectedPanel(null)
            queryClient.invalidateQueries({ queryKey: [settingAPI.QUERY_KEY_GET_ACTUATORS, 1] })
            notification.fire("Berhasil mengubah panel")
        }
    })

    const handleEditPanel = () => {
        if (!selectedPanel) return
        editPanelMutation.mutate(selectedPanel as Actuator)
    }

    const handleLogout = () => {
        auth.clearAuth()
        queryClient.removeQueries({ queryKey: [userAPI.QUERY_KEY_GET_USER_INFO] })
        setLogoutModalOpened(false)
        navigate({ to: '/auth', replace: true })
        notification.fire('Berhasil Keluar Akun')
    }

    useEffect(() => {
        setEditPanelModalOpened(!!selectedPanel)
    }, [selectedPanel])

    return <>
        <Box sx={{ px: 2 }} className="fade">
            <Typography sx={{ mt: 4 }} level="h2" fontWeight='500'>Pengaturan</Typography>
            <Grid container sx={{ pt: 3 }} flexDirection='column' gap={2}>
                {actuators.isLoading && <LinearProgress />}
                {!actuators.isLoading && !actuators.data?.length && <Typography textAlign='center' color="neutral" fontSize='sm'>Panel tidak tersedia. Hubungi Ibrahimsyah Zairussalam untuk konfigurasi panel</Typography>}
                {actuators.data?.map(item => {
                    const Icon = getActionIcon(item.icon)
                    return <Card key={item.id} onClick={() => setSelectedPanel(item)}>
                        <Grid container width='100%' alignItems='center' gap={2}>
                            <Box>
                                <Box sx={{ display: 'flex', color: 'white', justifyContent: 'center', alignItems: 'center', borderRadius: 40, width: 40, height: 40, background: '#588658' }}>
                                    <Icon />
                                </Box>
                            </Box>
                            <Box>
                                <Typography>{item.name}</Typography>
                                <Chip size="sm" sx={{ mt: .1 }} color={item.is_active ? 'success' : 'danger'}>{item.is_active ? "Aktif" : "Non Aktif"}</Chip>
                            </Box>
                            <Typography sx={{ ml: 'auto' }} level="h4" fontWeight='400' textColor="#999">{item.terminal_number}</Typography>
                        </Grid>
                    </Card>
                })}
                <Button variant='outlined' color='danger' sx={{ mt: 2 }} onClick={() => setLogoutModalOpened(true)}>Keluar Akun</Button>
                <Typography textAlign='center' color="neutral" fontSize='sm'>Made with 🔥 by ARA Farm Lab</Typography>
            </Grid>
        </Box >
        <ConfirmationDialog
            cancelText="Batal"
            description="Anda harus masuk kembali untuk menggunakan aplikasi"
            okText="Keluar"
            title="Keluar Akun"
            isOpen={isLogoutModalOpened}
            onCancel={() => setLogoutModalOpened(false)}
            onOk={handleLogout}
        />
        <Modal
            title="Edit Panel"
            isOpen={isEditPanelModalOpened}
            onClose={() => { setEditPanelModalOpened(false) }}
            buttonActions={[
                {
                    label: 'Simpan',
                    variant: 'solid',
                    color: 'primary',
                    loading: editPanelMutation.isPending,
                    onClick: handleEditPanel,
                },
                {
                    label: 'Batal',
                    variant: 'outlined',
                    color: 'danger',
                    onClick: () => setEditPanelModalOpened(false)
                }
            ]}
        >
            <Grid container gap={2} flexDirection='column'>
                <Grid flexGrow={1}>
                    <TextField
                        sx={{ width: '100%' }}
                        size="small"
                        label="Nama"
                        value={selectedPanel?.name || ""}
                        onChange={e => setSelectedPanel({ ...(selectedPanel as Actuator), name: e.target.value })}
                        inputProps={{
                            maxLength: 20
                        }}
                    />
                </Grid>
                <Grid container justifyContent='space-between' gap={2}>
                    <Select
                        value={selectedPanel?.icon || ""}
                        onChange={(_, val) => {
                            if (!selectedPanel) {
                                return
                            }
                            const panel: Actuator = { ...selectedPanel }
                            panel.icon = val as ActionIcon
                            setSelectedPanel(panel)
                        }}
                        renderValue={(val) => {
                            const Icon = getActionIcon(val?.value as ActionIcon)
                            return <Icon />
                        }}>
                        {Object.values(ActionIcon).map(icon => {
                            const Icon = getActionIcon(icon)
                            return <Option key={icon} value={icon}><Icon /></Option>
                        })}
                    </Select>
                    <Select
                        value={selectedPanel?.is_active || false}
                        onChange={(_, val) => setSelectedPanel(({ ...(selectedPanel as Actuator), is_active: val || false }))}
                    >
                        {[true, false].map(item => <Option key={item.toString()} value={item}>{item ? "Aktif" : "Non Aktif"}</Option>)}
                    </Select>
                </Grid>
            </Grid>
        </Modal >
    </>
}

export const SettingRoute = createLazyRoute('/setting')({
    component: Setting
})