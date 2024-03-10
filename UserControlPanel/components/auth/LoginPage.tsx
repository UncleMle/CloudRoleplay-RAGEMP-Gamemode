"use client";

import React, { useEffect, useState } from 'react';
import { FaUser, FaLock } from "react-icons/fa";
import { useCookies } from "react-cookie";
import axios, { AxiosError } from 'axios';
import { EndpointRequestTypes } from '@/utilClasses';
import { useRouter } from 'next/navigation'
import LoadingSpinner from '../utilComponents/LoadingSpinner';
import ReCAPTCHA from 'react-google-recaptcha';

function LoginPage() {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [otp, setOtp] = useState<string>("");
    const [otpState, setOtpState] = useState<boolean>();
    const [loading, setLoading] = useState<boolean>(false);
    const [cookies, setCookies] = useCookies();
    const [captcha, setCaptcha] = useState<string | null>();

    const router = useRouter();

    const handleUsernameChange = (e: any) => {
        setUsername(e.target.value);
    };

    const handlePasswordChange = (e: any) => {
        setPassword(e.target.value);
    };

    const handleOtpChange = (e: any) => {
        setOtp(e.target.value);
    };

    useEffect(() => {
        if (typeof "window" !== undefined) {
            const params = new URLSearchParams(window.location.search);

            if (params.get("otp") && cookies["user-otp-token"]) setOtpState(true);

            if (cookies["user-jwt-token"]) router.push("/home");
        }
    }, []);

    const handleLogin = async () => {
        if (password.length === 0 || username.length === 0) {
            setError("Ensure all fields are filled.");
            return;
        }

        if (!captcha) return setError("Ensure captcha is completed.");

        setLoading(true);

        try {
            const login = await axios.post('/api/auth', {
                method: EndpointRequestTypes.post,
                payload: {
                    username: username,
                    password: password,
                    response: captcha
                },
                headers: {
                    'x-otp-token': cookies["user-otp-token"],
                }
            });

            if (login.status) router.push("/home");

        } catch (err) {
            switch ((err as AxiosError).response?.status) {
                case 511:
                    {
                        setOtpState(true);
                        break;
                    }
                default: {
                    setError("Incorrect account credentials.");

                    setTimeout(() => {
                        setError("");
                    }, 6500);
                }
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={"fixed inset-0 w-full text-white sm:text-lg text-md duration-300 font-medium bg-black/30 " + (loading ? "bg-black/70 h-screen" : "")}>

            <div className="duration-300 container flex items-center max-w-3xl mx-auto">
                <div className="flex justify-center w-full">
                    {!loading && <div className="sm:rounded-xl text-white w-full bg-black/60 backdrop-blur-xl border-b-4 border-t-4 shadow-2xl shadow-black border-purple-400/50 select-none duration-300 sm:p-8 p-4 mt-40">

                        <form onSubmit={(e: any) => {
                            e.preventDefault();
                            handleLogin();
                        }} className='duration-300'>

                            <div>
                                <label className="block">
                                    <span className="font-medium">Enter your username or email</span>
                                    <div className="relative mt-2 rounded-lg bg-gradient-to-r from-black/30 to-black/40">
                                        <FaUser className="absolute top-3 left-2 scale-110 fa-solid text-gray-400" />
                                        <input
                                            value={username}
                                            onChange={handleUsernameChange}
                                            type="text"
                                            maxLength={70}
                                            className="ml-8 p-2 block w-full rounded-lg bg-transparent outline-none"
                                        />
                                    </div>
                                </label>

                                <label className="block mt-3">
                                    <span className="font-medium">Enter your password</span>
                                    <div className="relative mt-2 rounded-lg bg-gradient-to-l from-black/30 to-black/40">
                                        <FaLock className="absolute top-3 left-2 scale-110 fa-solid text-gray-400" />
                                        <input
                                            value={password}
                                            onChange={handlePasswordChange}
                                            type="password"
                                            maxLength={70}
                                            className="ml-8 p-2 block w-full rounded-lg bg-transparent outline-none"
                                        />
                                    </div>
                                </label>

                                <div>
                                    <button className="font-medium text-sm mt-3 text-gray-300">Forgot your password?</button>
                                </div>

                            </div>


                            {error.length > 0 && <div className='flex justify-center bg-red-400/40 p-2 rounded-xl mt-2'>
                                {error}
                            </div>
                            }

                            {
                                username.length > 0 && password.length > 0 &&
                                <ReCAPTCHA sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!} onChange={setCaptcha} className='mt-4' />
                            }
                            <div className="inline-flex w-full mt-4 space-x-10 font-medium">
                                <button onClick={handleLogin} className="w-full rounded-xl p-3 bg-gradient-to-l from-black/30 to-black/40 duration-300 hover:bg-black/20">
                                    <span>
                                        {otpState ? "Login via OTP" : "Login"} <i className="fa-solid fa-right-to-bracket text-gray-400"></i>
                                    </span>
                                </button>
                            </div>

                        </form>

                    </div>}
                    {loading && <div className='mt-60'>
                        <LoadingSpinner />
                    </div>}
                </div>
            </div>
        </div>
    );
}

export default LoginPage;