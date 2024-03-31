import { Button, CircularProgress, Link, Typography } from "@mui/joy"
import { Grid, TextField } from "@mui/material"
import { createLazyRoute, useNavigate } from "@tanstack/react-router"

import icon from '@/assets/icon.png'
import { useEffect, useState } from "react"
import authAPI from '@/apis/auth'
import { useMutation, useQuery } from "@tanstack/react-query"
import { AuthRequest } from "@/apis/auth.types"
import useAuthStore from "@/stores/auth"

const Auth = () => {
    const [isLoginState, setIsLoginState] = useState(true)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState({
        "name": false,
        "password": false,
        "email": false,
    })
    const auth = useAuthStore()
    const navigate = useNavigate()

    const authMutation = useMutation({
        mutationFn: (request: AuthRequest) => isLoginState ? authAPI.loginUser(request) : authAPI.registerUser(request),
        onSuccess: (data) => {
            auth.setAuth(data.token)
        }
    })

    const userInfoQuery = useQuery({
        enabled: auth.accessToken != "",
        queryFn: authAPI.getUserInfo,
        queryKey: [authAPI.QUERY_KEY_GET_USER_INFO]
    })

    const handleAuthSubmit = () => {
        if (!validateAuth()) return
        const payload = { email, password, name }
        authMutation.mutate(payload)
    }

    const handleChangeAuthMode = () => {
        setIsLoginState(prev => !prev)
        setName("")
        setEmail("")
        setPassword("")
        setError({
            "name": false,
            "password": false,
            "email": false,
        })
    }

    const validateAuth = (): boolean => {
        setError({
            name: name == "",
            email: email == "",
            password: password == "",
        })
        if (!isLoginState) {
            return name !== "" && email !== "" && password !== "";
        }

        return email !== "" && password !== "";
    }

    console.log(userInfoQuery.data)
    useEffect(() => {
        if (userInfoQuery.isLoading) return
        if (userInfoQuery.data?.is_active) {
            navigate({
                to: '/dashboard',
                replace: true,
            })
        }
    }, [userInfoQuery.data?.is_active, userInfoQuery.isLoading, navigate])

    return (
        <Grid container flexDirection='column' gap={2} sx={{ p: 2, height: '100vh' }} alignItems='center' justifyContent='center' className="fade">
            <img src={icon} width={120} height={120} />
            <Typography level="h2" fontWeight='500' sx={{ mb: 1 }}>ARA Farm IoT Panel</Typography>
            {auth.accessToken != "" ? (
                <>
                    {userInfoQuery.isLoading ? <CircularProgress /> : (
                        <Typography textAlign='center'>Akun belum aktif. Silahkan hubungi admin untuk aktivasi</Typography>
                    )}
                </>
            ) : (
                <>
                    {!isLoginState && (
                        <TextField
                            error={!!error["name"]}
                            helperText={error["name"] ? "Nama Tidak Boleh Kosong" : ""}
                            sx={{ width: '80%' }}
                            label="Nama"
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)} />
                    )}
                    <TextField
                        error={!!error["email"]}
                        helperText={error["email"] ? "Email Tidak Boleh Kosong" : ""}
                        sx={{ width: '80%' }}
                        label="Email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)} />
                    <TextField
                        error={!!error["password"]}
                        helperText={error["password"] ? "Password Tidak Boleh Kosong" : ""}
                        sx={{ width: '80%' }}
                        label="Password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)} />
                    <Button size='lg' sx={{ width: '80%' }} onClick={handleAuthSubmit} loading={authMutation.isPending}>{!isLoginState ? "Daftar" : "Masuk"}</Button>
                    <Typography>
                        {isLoginState ? "Belum" : "Sudah"} Punya Akun? <Link fontWeight='bold' onClick={handleChangeAuthMode}>{isLoginState ? "Daftar" : "Masuk"}</Link>
                    </Typography>
                </>
            )}
        </Grid>
    )
}

export const AuthRoute = createLazyRoute('/auth')({
    component: Auth
})