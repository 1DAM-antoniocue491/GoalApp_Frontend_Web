import { Link, useNavigate } from "react-router";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa6";
import { FaSpinner } from "react-icons/fa";
import foco from '../../../assets/foco-auth.jpeg'
import { useState, FormEvent } from "react";
import { login, saveToken } from "../services/authApi";

export default function LoginPage() {
    const [email, setEmail] = useState<string>('')
    const [passwd, setPasswd] = useState<string>('')
    const [passwdType, setPasswdType] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>('')

    const navigate = useNavigate()

    // Validar email
    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    // Validar formulario
    const isValidForm = (): boolean => {
        if (!email.trim()) {
            setError('El correo es obligatorio')
            return false
        }
        if (!isValidEmail(email)) {
            setError('Introduce un correo válido')
            return false
        }
        if (!passwd.trim()) {
            setError('La contraseña es obligatoria')
            return false
        }
        if (passwd.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres')
            return false
        }
        return true
    }

    // Manejar submit
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')

        if (!isValidForm()) return

        setIsLoading(true)

        try {
            // Llamar a la API
            const response = await login(email, passwd)

            // Guardar token
            saveToken(response.access_token)

            // Redirigir al dashboard
            navigate('/dashboard')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
        <div className="bg-zinc-950 min-h-screen flex justify-center md:justify-start items-center ">
            <div className="hidden md:block relative w-1/2">
                <img
                    src={foco}
                    alt="Logo del proyecto"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-950 from-30%"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950 from-30%"></div>
            </div>

            <div className="bg-zinc-950 flex justify-center items-center h-full w-full md:w-1/2">
                <div className="bg-zinc-800 p-3 sm:p-10 rounded-xl flex flex-col justify-center gap-9 sm:w-3/5">
                    <div>
                        <Link to={'/'} className="text-lime-300 font-semibold mb-3">GoalApp</Link>
                        <h2 className="text-white text-2xl font-semibold">Bienvenido</h2>
                    </div>

                    <div className="flex bg-zinc-700 text-sm rounded-sm">
                        <Link to={'/login'} className="w-1/2 text-center m-0.5 mr-0 rounded-sm text-white py-1 bg-zinc-800">Iniciar Sesión</Link>
                        <Link to={'/register'} className="w-1/2 text-center m-0.5 ml-0 rounded-sm text-white py-1">Registrarse</Link>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div>
                            <p className="text-sm text-zinc-400 font-semibold">Correo Electrónico</p>
                            <input
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                    setError('')
                                }}
                                disabled={isLoading}
                                className="focus:outline-none focus:border-transparent w-full bg-zinc-700 p-2 text-sm rounded-sm placeholder:text-zinc-400 text-zinc-400 disabled:opacity-50"
                            />

                            <p className="text-sm text-zinc-400 font-semibold mt-3">Contraseña</p>
                            <div className="relative">
                                <input
                                    type={passwdType ? "text" : "password"}
                                    placeholder="**********"
                                    value={passwd}
                                    onChange={(e) => {
                                        setPasswd(e.target.value)
                                        setError('')
                                    }}
                                    disabled={isLoading}
                                    className="focus:outline-none focus:border-transparent w-full bg-zinc-700 p-2 text-sm rounded-sm placeholder:text-zinc-400 text-zinc-400 disabled:opacity-50"
                                />
                                <div
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 rounded-full cursor-pointer"
                                    onClick={() => setPasswdType(!passwdType)}
                                >
                                    {passwdType ? (
                                        <FaEyeSlash className="text-zinc-400"/>
                                    ) : (
                                        <FaEye className="text-zinc-400"/>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Mensaje de error */}
                        {error && (
                            <p className="text-red-500 text-sm mt-3 text-center bg-red-500/10 p-2 rounded">
                                {error}
                            </p>
                        )}

                        <div className="mt-6">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-2 text-sm bg-lime-300 rounded-full font-semibold hover:bg-lime-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        Cargando...
                                    </>
                                ) : (
                                    'Acceder'
                                )}
                            </button>
                            <Link to={'/send-email'} className="block text-center text-[13px] text-blue-500 hover:underline mt-2">Olvidé mi contraseña</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        </>
    )
}