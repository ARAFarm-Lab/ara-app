import { Transition, TransitionStatus } from 'react-transition-group';

import {
    Button, ColorPaletteProp, DialogContent, DialogTitle, Modal as JoyModal, ModalDialog,
    VariantProp, Box
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

const Modal = ({ title, isOpen, onClose, children, buttonActions }: ModalProps) => {
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
                        onClose={onClose}
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
                            <DialogContent sx={{ pt: 2 }}>{children}</DialogContent>
                            {!!buttonActions?.length && (
                                <Box
                                    sx={{
                                        mt: 1,
                                        display: 'flex',
                                        gap: 1,
                                        flexDirection: { xs: 'column', sm: 'row-reverse' },
                                    }}
                                >
                                    {buttonActions.map((action, index) => (
                                        <Button
                                            key={index}
                                            variant={action.variant}
                                            color={action.color}
                                            onClick={action.loading ? () => {} : action.onClick}
                                            loading={action.loading}
                                        >
                                            {action.label}
                                        </Button>
                                    ))}
                                </Box>
                            )}
                        </ModalDialog>
                    </JoyModal >
                )}
            </Transition >
        </>
    )
}

type ModalProps = {
    title?: string,
    isOpen: boolean,
    children: React.ReactNode,
    onClose?: () => void,
    buttonActions?: {
        loading?: boolean
        label: string
        variant: VariantProp,
        color: ColorPaletteProp,
        onClick: () => void
    }[]
}

export default Modal