import axios from "axios";
import { useCookies } from "react-cookie";
import useSWR from "swr";

export default function useEndpoint(endpoint: string) {
    const [cookies, setCookie] = useCookies();
    const token = cookies["user-jwt-token"];

    const options = {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "x-auth-token": token,
            "x-unix-sent": Math.round(Date.now() / 1000),
        },
    };

    const fetcher = () =>
        axios.get(endpoint, options).then((res) => res.data);

    const { data, error, mutate, isLoading } = useSWR("/api/data/roster", fetcher);


    if (!token) return { error: true };

    return {
        isLoading,
        data,
        mutate,
    };
}