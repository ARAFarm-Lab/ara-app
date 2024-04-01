import { LinearProgress } from '@mui/joy';

const Loading = ({ loading, children }: LoadingProps) => {
    if (loading) {
        return <LinearProgress sx={{ mt: 2 }} />
    }

    return <>{children}</>
}

type LoadingProps = {
    loading: boolean,
    children: any
}

export default Loading