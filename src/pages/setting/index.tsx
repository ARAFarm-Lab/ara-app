import { Box, Card, Chip, Grid, LinearProgress, Select, Option, Typography } from "@mui/joy"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import settingAPI from '@/apis/setting'
import { ActionIcon, getActionIcon } from "@/constants/action"
import Modal from "../schedule/modal"
import { TextField } from "@mui/material"
import { useState } from "react"
import { Actuator } from "@/apis/setting.types"

const Setting = () => {
    const [selectedPanel, setSelectedPanel] = useState<Actuator | null>()

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
        }
    })

    const handleEditPanel = () => {
        if (!selectedPanel) return
        editPanelMutation.mutate(selectedPanel as Actuator)
    }

    return <>
        <Box sx={{ px: 2 }}>
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
                <Typography textAlign='center' color="neutral" fontSize='sm'>Made with 🔥 by ARA Farm Lab</Typography>
            </Grid>
        </Box >
        <Modal
            title="Edit Panel"
            isOpen={selectedPanel != null}
            onClose={() => { setSelectedPanel(null) }}
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
                    onClick: () => setSelectedPanel(null)
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

export default Setting