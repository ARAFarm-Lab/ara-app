import { Transition, TransitionStatus } from 'react-transition-group';

import {
    Button, DialogContent, DialogTitle, Modal as JoyModal, ModalDialog, Typography
} from '@mui/joy';

type ModalTransition = {
    [key in TransitionStatus]: React.CSSProperties;
};

const modalTransitionDelayMs = 292;
const modalBackdropTransition: Partial<ModalTransition> = {
    entering: { opacity: 1 },
    entered: { opacity: 1 },
    exiting: { opacity: 0 },
    exited: { opacity: 0 },

}
const modalTransition: Partial<ModalTransition> = {
    entering: { transform: `translateY(0)` },
    entered: { transform: `translateY(0)` },
    exiting: { transform: `translateY(100%)` },
    exited: { transform: `translateY(100%)` },
}

const ConfirmationDialog = ({ isOpen, title, description, onCancel, onOk, cancelText, okText }: ConfirmationDialogProps) => {
    return (
        <>
            <Transition in={isOpen} timeout={modalTransitionDelayMs}>
                {state => (
                    <JoyModal
                        keepMounted
                        open={state !== 'exited'}
                        slotProps={{
                            backdrop: {
                                sx: {
                                    maxWidth: '500px',
                                    margin: 'auto',
                                    transition: `opacity ${modalTransitionDelayMs}ms ease-in`,
                                    opacity: 0,
                                    ...modalBackdropTransition[state]
                                }
                            }
                        }}
                        onClose={onCancel}
                    >
                        <ModalDialog
                            sx={{
                                top: 'unset',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                borderRadius: 0,
                                maxWidth: '500px',
                                margin: 'auto',
                                transition: `transform ${modalTransitionDelayMs}ms ease-in-out`,
                                ...modalTransition[state]
                            }}
                        >
                            {title && <DialogTitle>{title}</DialogTitle>}
                            <DialogContent sx={{ pt: 2 }}>
                                <Typography>{description}</Typography>
                            </DialogContent>
                            <Button
                                variant='outlined'
                                color="danger"
                                onClick={onCancel}
                            >
                                {cancelText}
                            </Button>
                            <Button
                                variant='solid'
                                color="primary"
                                onClick={onOk}
                            >
                                {okText}
                            </Button>
                        </ModalDialog>
                    </JoyModal >
                )}
            </Transition >
        </>
    )
}

type ConfirmationDialogProps = {
    title?: string,
    isOpen: boolean,
    description: string,
    cancelText: string,
    okText: string,
    onCancel: () => void,
    onOk: () => void,
}

export default ConfirmationDialog