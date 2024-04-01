import Modal from "@/components/modal"
import { Card, Chip, Grid, Option, Select, Typography } from "@mui/joy"
import { Box, TextField } from "@mui/material"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createLazyRoute } from "@tanstack/react-router"

import settingAPI from '@/apis/setting'
import userAPI from '@/apis/user'
import { useState } from "react"
import { Actuator } from "@/apis/setting.types"
import { UserInfo } from "@/stores/auh.types"
import useNotification from "@/stores/notification"

type itemState = Actuator | UserInfo | null

const isUserInfo = (item: itemState): boolean => !item || "user_id" in item

const renderModalTitle = (item: itemState): string => {
    if (!item) return "Empty"
    if (isUserInfo(item)) return "Edit User"
    return "Edit Panel"
}

const renderModalBody = (item: itemState, mutator: (item: itemState) => void): JSX.Element => {
    if (!item) return <></>
    if (isUserInfo(item)) {
        const user = item as UserInfo
        return (
            <Grid container justifyContent='space-between' flexDirection='column' gap={2}>
                <TextField label="Name" value={item.name} onChange={e => mutator({ ...item, name: e.target.value })} />
                <Select value={user.is_active ? "true" : "false"} onChange={(_, val) => mutator({ ...item, is_active: (val as string) == "true" })}>
                    <Option key="true" value="true">Active</Option>
                    <Option key="false" value="false">Not Active</Option>
                </Select>
                <Select value={user.role} onChange={(_, val) => mutator({ ...item, role: Number(val) })}>
                    <Option key={2} value={2}>User</Option>
                    <Option key={99} value={99}>Admin</Option>
                </Select>
            </Grid>
        )
    }

    const actuator = item as Actuator
    return (
        <Grid container flexDirection='column' gap={2}>
            <TextField label="Name" value={actuator.name} onChange={e => mutator({ ...item, name: e.target.value })} />
            <Grid container justifyContent='space-between' direction='row' >
                <TextField label="Pin Number" value={actuator.pin_number} onChange={e => mutator({ ...item, pin_number: Number(e.target.value) })} />
                <TextField label="Terminal Number" value={actuator.terminal_number} onChange={e => mutator({ ...item, terminal_number: Number(e.target.value) })} />
            </Grid>
        </Grid >
    )
}

const Admin = () => {
    const queryClient = useQueryClient()
    const notification = useNotification()
    const usersQuery = useQuery({
        queryKey: [userAPI.QUERY_KEY_GET_USER_LIST],
        queryFn: userAPI.getUserList
    })

    const actuatorsQuery = useQuery({
        queryKey: [settingAPI.QUERY_KEY_GET_ACTUATORS],
        queryFn: () => settingAPI.getActuators(1)
    })

    const userMutation = useMutation({
        mutationFn: (request: UserInfo) => userAPI.updateUser(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [userAPI.QUERY_KEY_GET_USER_LIST] })
            notification.fire("User Updated")
            resetModal()
        }
    })

    const actuatorMutation = useMutation({
        mutationFn: (request: Actuator) => settingAPI.updateActuator(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [settingAPI.QUERY_KEY_GET_ACTUATORS] })
            notification.fire("Panel Updated")
            resetModal()
        }
    })

    const [selectedItem, setSelectedItem] = useState<itemState>(null)
    const [isModalOpened, setIsModalOpened] = useState(false)
    const resetModal = () => {
        setSelectedItem(null)
        setIsModalOpened(false)
    }

    const handleCardClick = (item: Actuator | UserInfo) => {
        setSelectedItem(item)
        setIsModalOpened(true)
    }

    const handleUpdateItem = () => {
        if (isUserInfo(selectedItem)) {
            userMutation.mutate(selectedItem as UserInfo)
            return
        }

        actuatorMutation.mutate(selectedItem as Actuator)
    }

    return (
        <>
            <Box sx={{ px: 2 }} className="fade">
                <Typography sx={{ mt: 4 }} level="h2" fontWeight='500'>Admin Panel</Typography>
                <Typography sx={{ mt: 2 }} level="h4">Users</Typography>
                <Grid container sx={{ mt: 1 }} flexDirection='column' gap={2}>
                    {usersQuery.data?.map(user => (
                        <Card key={user.user_id} onClick={() => handleCardClick(user)}>
                            <Box display='flex' justifyContent='space-between'>
                                <Box>
                                    {user.name}
                                    {user.role == 99 && <Chip sx={{ ml: 2 }} color="danger">Admin</Chip>}
                                </Box>
                                <Chip color={user.is_active ? 'success' : 'danger'}>{user.is_active ? "Active" : "Not Active"}</Chip>
                            </Box>
                        </Card>
                    ))}
                </Grid>
                <Typography sx={{ mt: 2 }} level="h4">Panels</Typography>
                <Grid container sx={{ mt: 1 }} flexDirection='column' gap={2}>
                    {actuatorsQuery.data?.map(actuator => (
                        <Card key={actuator.id} onClick={() => handleCardClick(actuator)}>
                            <Box display='flex' justifyContent='space-between'>
                                {actuator.name}
                                <Grid container gap={1}>
                                    <Chip color="primary">Pin: {actuator.pin_number}</Chip>
                                    <Chip color="warning">{actuator.terminal_number}</Chip>
                                </Grid>
                            </Box>
                        </Card>
                    ))}
                </Grid>
            </Box >
            <Modal
                title={renderModalTitle(selectedItem)}
                isOpen={!!isModalOpened}
                onClose={() => setIsModalOpened(false)}
                buttonActions={[
                    {
                        label: 'Save',
                        variant: 'solid',
                        color: 'primary',
                        loading: false,
                        onClick: handleUpdateItem,
                    },
                    {
                        label: 'Cancel',
                        variant: 'outlined',
                        color: 'danger',
                        onClick: () => setIsModalOpened(false)
                    }
                ]}
            >{renderModalBody(selectedItem, setSelectedItem)}</Modal >
        </>
    )
}

export const AdminRoute = createLazyRoute('/admin')({
    component: Admin
})