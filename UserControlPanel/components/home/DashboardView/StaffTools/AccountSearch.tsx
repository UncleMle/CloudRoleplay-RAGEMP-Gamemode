import LoadingSpinner from "@/components/utilComponents/LoadingSpinner";
import { getFormattedDateString } from "@/lib/Helpers/Helpers";
import { PunishmentTypes, adminRanksColours, adminRanksList, logTypes } from "@/sharedConstants";
import { AdminPunishment, DbCharacter, ServerLog, User } from "@/types";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { FaSearch } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";

enum StaffActions {
    none,
    viewingCharacters,
    viewingAdminLogs,
    viewingPunishments
}

const AccountSearch = () => {
    const [search, setSearched] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>();
    const [cookies, setCookies] = useCookies();
    const [searchData, setSearchData] = useState<{
        account: User,
        adminLogs: ServerLog[],
        punishments: AdminPunishment[],
        characters: DbCharacter[]
    } | null>();
    const [staffAction, setStaffAction] = useState<StaffActions>();
    const [modalActive, setModalActive] = useState<boolean>();

    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams?.get("search")) {
            searchAccount(searchParams?.get("search"));
        }
    }, []);

    const searchAccount = async (param: string | null = null) => {
        setError("");
        setSearchData(null);
        setLoading(true);

        let query: string = param ? param : search;
        setSearched(query);
        router.push("/home?view=staff&staffview=accsearch&search=" + query);

        try {

            const options = {
                method: "GET",
                headers: {
                    "content-type": "application/json",
                    "x-auth-token": cookies['user-jwt-token'],
                    "x-search-account": query
                },
            };

            let getAccount = await axios.get("/api/staff/account-search", options);

            setSearchData(getAccount.data);
        } catch {
            setError("Account not found");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>

            {staffAction === StaffActions.viewingAdminLogs && <div className="flex w-full h-screen justify-center items-center">
                <div className="bg-black/40 rounded-xl p-8 relative h-[75%]">
                    <button onClick={() => setStaffAction(StaffActions.none)} className="absolute top-2 right-4 duration-300 hover:scale-105"><IoMdCloseCircle className="text-3xl text-red-400" /></button>

                    <div className="max-h-[100%] overflow-y-scroll mt-4">
                        <table className="w-full mt-10">
                            <tbody>
                                <tr className="border-b-4 border-gray-400/50">
                                    <th className="pb-4">Date</th>
                                    <th className="pb-4">Description</th>
                                </tr>
                                {
                                    searchData?.adminLogs.map((log: ServerLog) => (
                                        <tr key={log.server_log_id} className="pb-4 border-b-2 border-gray-400/50">
                                            <th className="pt-4 pb-4">{getFormattedDateString(log.CreatedDate)}</th>
                                            <th className="rounded-xl">{log.server_log_description}</th>
                                            <th></th>
                                        </tr>
                                    ))
                                }</tbody>
                        </table>
                    </div>
                </div>
            </div>}

            {staffAction !== StaffActions.viewingAdminLogs && <form onSubmit={(e: any) => {
                e.preventDefault();
                searchAccount();
            }} className="flex justify-center">
                <div className="flex bg-black/30 rounded-xl"><input
                    value={search}
                    onChange={(e: any) => setSearched(e.target.value)}
                    type="text"
                    maxLength={40}
                    className="ml-8 p-2 bg-transparent block rounded-lg outline-none"
                    placeholder={"Username or account id"}
                />

                    <button className="pl-2 pr-6">
                        <FaSearch />
                    </button>
                </div>
            </form>
            }
            {loading && !error ? <div className="mt-10">
                <LoadingSpinner />
            </div> : <div>

                {
                    error && <div className="mt-4">{error}</div>
                }

                {
                    searchData && staffAction !== StaffActions.viewingAdminLogs && <div className="mt-10 lg:mr-[23%] lg:ml-[23%]">

                        <div className="w-full border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                            <span className="float-left">Account ID</span>
                            <span className="float-right">{searchData.account.account_id}</span>
                        </div>

                        <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                            <span className="float-left">Username</span>
                            <span className="float-right">{searchData.account.username}</span>
                        </div>

                        <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                            <span className="float-left">Social Club</span>
                            <span className="float-right">{searchData.account.social_club_name}</span>
                        </div>

                        <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                            <span className="float-left">IP</span>
                            <span className="float-right">{searchData.account.user_ip}</span>
                        </div>

                        <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                            <span className="float-left">Email Address</span>
                            <span className="float-right max-w-[40%] whitespace-nowrap text-ellipsis overflow-hidden">{searchData.account.email_address}</span>
                        </div>

                        <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                            <span className="float-left">VIP Status</span>
                            <span className="float-right">{searchData.account.vip_status === 1 ? <span className="text-green-400">Enabled</span> : <span className="text-red-400">Disabled</span>}</span>
                        </div>

                        <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                            <span className="float-left">Admin Level</span>
                            <span className="float-right" style={{ color: adminRanksColours[searchData.account.admin_status] }}>{
                                adminRanksList[searchData.account.admin_status]
                            }</span>
                        </div>

                        <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                            <span className="float-left">Created</span>
                            <span className="float-right">{getFormattedDateString(searchData.account.CreatedDate)}</span>
                        </div>



                        <div className="grid md:grid-cols-3 mt-10 md:space-x-4">

                            <button onClick={() => setStaffAction(StaffActions.viewingAdminLogs)} className="relative border-2 p-4 rounded-xl border-gray-400/50 duration-300 hover:scale-105 backdrop-blur-md">
                                Admin Logs
                            </button>

                            <button onClick={() => setStaffAction(StaffActions.viewingCharacters)} className="relative md:mt-0 mt-4 border-2 p-4 rounded-xl border-gray-400/50 duration-300 hover:scale-105 backdrop-blur-md">
                                Characters
                            </button>

                            <button onClick={() => setStaffAction(StaffActions.viewingPunishments)} className="relative md:mt-0 mt-4 border-2 p-4 rounded-xl border-gray-400/50 duration-300 hover:scale-105 backdrop-blur-md">
                                Punishments
                            </button>
                        </div>

                        {
                            staffAction === StaffActions.viewingCharacters && <div>
                                <table className="w-full mt-10">
                                    <tbody>
                                        <tr className="border-b-4 border-gray-400/50">
                                            <th className="pb-4">Name</th>
                                            <th className="pb-4">Cash Amount</th>
                                            <th className="pb-4">Money Amount</th>
                                            <th className="pb-4">Health</th>
                                        </tr>
                                        {
                                            searchData?.characters.map(char => (
                                                <tr key={char.character_id} className="pb-4 border-b-2 border-gray-400/50">
                                                    <th className="pt-4 pb-4">{char.character_name}</th>
                                                    <th className="rounded-xl">${char.cash_amount.toLocaleString("en-US")}</th>
                                                    <th className="rounded-xl">${char.money_amount.toLocaleString("en-uS")}</th>
                                                    <th className="">{char.character_health}%</th>
                                                </tr>
                                            ))
                                        }</tbody>
                                </table>
                            </div>
                        }

                        {
                            staffAction === StaffActions.viewingPunishments && <div>
                                <table className="w-full mt-10">
                                    <tbody>
                                        <tr className="border-b-4 border-gray-400/50">
                                            <th className="pb-4">Punishment</th>
                                            <th className="pb-4">Reason</th>
                                            <th className="pb-4">Admin</th>
                                            <th className="pb-4">Has expired</th>
                                        </tr>
                                        {
                                            searchData?.punishments.map((log, idx: number) => (
                                                <tr key={idx} className="pb-4 border-b-2 border-gray-400/50">
                                                    <th className="pt-4 pb-4">{PunishmentTypes[log.punishment_type]}</th>
                                                    <th className="rounded-xl">{log.punishment_reason}</th>
                                                    <th className="rounded-xl">{log.admin_name}</th>
                                                    <th className="rounded-xl">{log.unix_expires === -1 ? <span className="text-red-400">Permanent</span> : <span className="text-green-400">Unbanned</span>}</th>
                                                </tr>
                                            ))
                                        }</tbody>
                                </table>
                            </div>
                        }

                    </div>
                }

            </div>}
        </div >
    )
}

export default AccountSearch;