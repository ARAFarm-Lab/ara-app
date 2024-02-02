import { Button, Card, Grid, Typography, Box } from "@mui/joy"
import Add from '@mui/icons-material/Add';
import { useState } from "react";
import Modal from "./modal";


const Schedule = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    return (
        <>
            <Box sx={{ px: 2 }}>
                <Typography sx={{ mt: 4 }} level="h2" fontWeight='500'>Schedules</Typography>
                <Grid container direction='column' sx={{ mt: 2 }} gap={2} >
                    <Button
                        variant='solid'
                        size="md"
                        color='primary'
                        startDecorator={<Add />}
                        onClick={() => setIsModalOpen(true)}
                    >New Schedule</Button>
                    <Card variant="soft">Card 1</Card>
                    <Card variant="soft">Card 2</Card>
                    <Card variant="soft">Card 3</Card>
                    <Card variant="soft">Card 4</Card>
                </Grid >
            </Box>
            <Modal
                title="Modal Title"
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                buttonActions={[
                    {
                        label: 'Save',
                        variant: 'solid',
                        color: 'primary',
                        onClick: () => setIsModalOpen(false)
                    },
                    {
                        label: 'Cancel',
                        variant: 'outlined',
                        color: 'danger',
                        onClick: () => setIsModalOpen(false)
                    },
                ]}
            >
                <Typography level='body-md'>Modal Content</Typography>
            </Modal>
        </>
    )
}

export default Schedule