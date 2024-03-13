import LoadingSpinner from "@/components/utilComponents/LoadingSpinner";
import { PunishmentTypes, adminRanksColours, factions, logTypes } from "@/sharedConstants";
import { AdminPunishment, DbVehicle, ServerLog } from "@/types";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import useSWR from "swr";
import CharacterSearch from "./StaffTools/CharacterSearch";
import VehicleSearch from "./StaffTools/VehicleSearch";

export enum staffActions {
    none,
    viewLogs,
    viewVehicles,
    viewDamageLogs,
    banCharacter
}

const StaffToolPage = ({ adminLevel, serverLogs }: { adminLevel: number, serverLogs: AdminPunishment[] }) => {
    const [staffView, setStaffView] = useState<string>("");
    const [search, setSearchParams] = useState<string>("");
    const [staffAction, setStaffAction] = useState<staffActions>();
    const [error, setError] = useState<string>("");
    const [cookies, setCookies] = useCookies();
    const seachParams = useSearchParams();
    const paramKey: string = "staffview";
    const searchParamKey: string = "search";
    const router = useRouter();

    const views: string[] = [
        "quizview", "charsearch", "vehsearch", "accsearch"
    ]

    useEffect(() => {
        if (views.indexOf(staffView) === -1) setStaffView("none");
    }, [staffView]);

    useEffect(() => {
        if (adminLevel === 0) router.push("/");
    });

    useEffect(() => {
        setStaffAction(staffActions.none);

        if (typeof "window" !== undefined) {
            if (seachParams?.get(paramKey)) {
                setStaffView(seachParams?.get(paramKey) as string);
            } else setStaffView("none");
        }

    }, [seachParams]);

    useEffect(() => {
        if (typeof "window" !== undefined) {
            if (seachParams?.get(searchParamKey)) {
                setSearchParams(seachParams?.get(searchParamKey) as string);
            }
        }

    }, []);


    const setParam = (param: string) => {
        setSearchParams(param);
        setView();
    };

    const setView = (viewName: string = staffView) => {
        router.push(`/home?view=staff&${paramKey}=${viewName}&${searchParamKey}=${search}`);
    }

    return (
        <div>
            {staffView === "none" && <div className="font-medium">
                {adminLevel > 0 && < button onClick={() => setView(views[0])} className="w-full backdrop-blur-md border-2 border-gray-400/50 p-4 rounded-xl duration-300 hover:scale-90">
                    View active quizzes (<span style={{ color: adminRanksColours[1] }}>Support +</span>)
                </button>}

                {adminLevel >= 3 && <button onClick={() => setView(views[1])} className="w-full backdrop-blur-md mt-6 border-2 border-gray-400/50 p-4 rounded-xl duration-300 hover:scale-90">
                    Character Search (<span style={{ color: adminRanksColours[3] }}>Moderator +</span>)
                </button>}

                {adminLevel >= 3 && <button onClick={() => setView(views[2])} className="w-full backdrop-blur-md mt-6 border-2 border-gray-400/50 p-4 rounded-xl duration-300 hover:scale-90">
                    Vehicle Search (<span style={{ color: adminRanksColours[3] }}>Moderator +</span>)
                </button>}

                {adminLevel >= 7 && < button onClick={() => setView(views[3])} className="w-full backdrop-blur-md mt-6 border-2 border-gray-400/50 p-4 rounded-xl duration-300 hover:scale-90">
                    Account Search (<span style={{ color: adminRanksColours[7] }}>Head Administrator +</span>)
                </button>}


                <h2 className="text-left border-l-4 pl-3 text-xl bg-gray-500/20 w-fit pr-6 p-2 mt-4 border-purple-400/50">Recent Punishments</h2>
                <div className="border-l-4 w-full backdrop-blur-lg p-4 border-purple-400/50">

                    <table className="w-full mt-10 ">
                        <tbody>
                            <tr className="border-b-4 border-gray-400/50">
                                <th className="pb-4">Type</th>
                                <th className="pb-4">Reason</th>
                                <th className="pb-4">Date</th>
                            </tr>
                            {
                                serverLogs.map(log => (
                                    <tr key={log.admin_punishment_id} className="pb-4 border-b-2 border-gray-400/50">
                                        <th className="pt-4 pb-4">{PunishmentTypes[log.punishment_type]}</th>
                                        <th className="rounded-xl whitespace-normal">{log.punishment_reason}</th>
                                        <th className="rounded-xl">{new Date(log.CreatedDate).toDateString()} ({new Date(log.CreatedDate).getHours()}:{new Date(log.CreatedDate).getMinutes()})</th>
                                        <th></th>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
            }
            {
                staffView === views[0] && <div>quiz view</div>
            }
            {
                staffView === views[1] && <CharacterSearch setStaffAction={setStaffAction} staffAction={staffAction} />
            }
            {
                staffView === views[2] && <VehicleSearch searchParam={search} setSearch={setParam} />
            }
            {
                staffView === views[3] && <div>acc Search</div>
            }
        </div >
    )
};

export default StaffToolPage;