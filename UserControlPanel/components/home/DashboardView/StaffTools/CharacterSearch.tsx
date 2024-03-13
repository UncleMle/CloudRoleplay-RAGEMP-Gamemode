import { factions, logTypes } from "@/sharedConstants";
import axios from "axios";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { FaSearch } from "react-icons/fa";
import { staffActions } from "../StaffToolPage";
import { DbVehicle, ServerLog } from "@/types";
import LoadingSpinner from "@/components/utilComponents/LoadingSpinner";
import { useRouter, useSearchParams } from "next/navigation";

const CharacterSearch = ({ staffAction, setStaffAction }: {
    staffAction: staffActions | undefined, setStaffAction: Dispatch<SetStateAction<staffActions | undefined>>
}) => {
    const [error, setError] = useState<string>("");
    const [cookies, setCookies] = useCookies();
    const [searched, setSearched] = useState<string>("");
    const [loading, setLoading] = useState<boolean>();
    const [searchObj, setSearchObj] = useState<any>();
    const seachParams = useSearchParams();
    const searchParamKey: string = "search";
    const router = useRouter();

    useEffect(() => {
        if (seachParams?.get(searchParamKey)) {
            searchCharacter(true, seachParams?.get(searchParamKey));
        }
    }, []);

    const searchCharacter = async (formSearch: boolean = true, param: string | null = null) => {
        if (searched.length < 2 && !param) return;

        setError("");
        setSearchObj({});
        setLoading(formSearch);

        let query: string = param ? param : searched;
        setSearched(query);
        router.push("/home?view=staff&staffview=charsearch&search=" + query);

        try {

            const options = {
                method: "GET",
                headers: {
                    "content-type": "application/json",
                    "x-auth-token": cookies['user-jwt-token'],
                    "x-search-character": query
                },
            };

            let getCharacter = await axios.get("/api/staff/character-search", options);

            setSearchObj(getCharacter.data);
        } catch {
            setError("Character not found");
        } finally {
            setLoading(false);
        }

    };

    return <div>

        <form onSubmit={(e: any) => {
            e.preventDefault();
            searchCharacter();
        }} className="flex justify-center">
            <div className="flex bg-black/30 rounded-xl"><input
                value={searched}
                onChange={(e: any) => setSearched(e.target.value)}
                type="text"
                maxLength={40}
                className="ml-8 p-2 bg-transparent block rounded-lg outline-none"
                placeholder={"Enter a characters name"}
            />

                <button className="pl-2 pr-6">
                    <FaSearch />
                </button>
            </div>
        </form>

        {searchObj?.char && error.length === 0 ?
            <div className="mt-10 lg:mr-[23%] lg:ml-[23%]">

                <div className="w-full border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                    <span className="float-left">Character Name</span>
                    <span className="float-right">{searchObj.char.character_name}</span>
                </div>

                <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                    <span className="float-left">Last Active</span>
                    <span className="float-right">{new Date(searchObj.char.UpdatedDate).toDateString()}</span>
                </div>


                <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                    <span className="float-left">Is Injured</span>
                    <span className="float-right">{
                        searchObj.char.injured_timer > 0 ? <span className="text-green-400">True</span> : <span className="text-red-400">False</span>
                    }</span>
                </div>

                <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                    <span className="float-left">Money Amount</span>
                    <span className="float-right text-green-400">${searchObj.char.money_amount.toLocaleString("en-US")}</span>
                </div>

                <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                    <span className="float-left">Cash Amount</span>
                    <span className="float-right text-green-400">${searchObj.char.cash_amount.toLocaleString("en-US")}</span>
                </div>

                <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                    <span className="float-left">Health</span>
                    <span className="float-right text-green-400">{searchObj.char.character_health}%</span>
                </div>

                <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                    <span className="float-left">Player Factions</span>
                    <span className="float-right text-ellipsis overflow-hidden whitespace-nowrap max-w-[50%]">{JSON.parse(searchObj.char.character_faction_data)?.map((f: number) => (
                        <span key={f}>{factions[f].replace("_", " ")} </span>
                    ))}</span>
                </div>

                <div className="w-full mt-4 border-2 p-3 rounded-xl border-gray-500 h-14 backdrop-blur-md">
                    <span className="float-left">Is Banned</span>
                    <span className="float-right">{searchObj.char.character_isbanned === 1 ? <span className="text-red-400">Banned</span> : <span className="text-green-400">Not Banned</span>}</span>
                </div>

                <div className="grid md:grid-cols-3 mt-10 md:space-x-4">

                    <button onClick={() => setStaffAction(staffActions.viewLogs)} className="relative border-2 p-4 rounded-xl border-gray-400/50 duration-300 hover:scale-105 backdrop-blur-md">
                        View Logs
                    </button>

                    <button onClick={() => setStaffAction(staffActions.viewVehicles)} className="relative md:mt-0 mt-4 border-2 p-4 rounded-xl border-gray-400/50 duration-300 hover:scale-105 backdrop-blur-md">
                        View Vehicles
                    </button>

                    <button onClick={() => setStaffAction(staffActions.viewDamageLogs)} className="relative md:mt-0 mt-4 border-2 p-4 rounded-xl border-gray-400/50 duration-300 hover:scale-105 backdrop-blur-md">
                        Damage Logs
                    </button>
                </div>

                {staffAction === staffActions.viewLogs && <div className="max-h-96 overflow-y-scroll mt-10">
                    {
                        searchObj.logs.length > 0 &&
                        <table className="w-full mt-10 ">
                            <tbody>
                                <tr className="border-b-4 border-gray-400/50">
                                    <th className="pb-4">Type</th>
                                    <th className="pb-4">Description</th>
                                    <th className="pb-4">Date</th>
                                </tr>
                                {
                                    searchObj.logs.map((log: ServerLog, idx: number) => (
                                        idx > 0 && <tr key={idx} className="pb-4 border-b-2 border-gray-400/50">
                                            <th className="pt-4 pb-4">{logTypes[log.log_type]}</th>
                                            <th className="rounded-xl">{log.server_log_description}</th>
                                            <th className="rounded-xl">{new Date(log.CreatedDate).toDateString()} ({new Date(log.CreatedDate).getHours()}:{new Date(log.CreatedDate).getMinutes()})</th>
                                            <th></th>
                                        </tr>
                                    ))
                                }</tbody>
                        </table>
                    }
                </div>}


                {staffAction === staffActions.viewVehicles && <div className="max-h-96 overflow-y-scroll mt-10">
                    {
                        searchObj.char.charactersVehicles.length > 0 &&
                        <table className="w-full mt-10 ">
                            <tbody>
                                <tr className="border-b-4 border-gray-400/50">
                                    <th className="pb-4">Name</th>
                                    <th className="pb-4">Plate</th>
                                    <th className="pb-4">Date</th>
                                </tr>
                                {
                                    searchObj.char.charactersVehicles.map((vehicle: DbVehicle) => (
                                        <tr key={vehicle.vehicle_id} className="pb-4 border-b-2 border-gray-400/50">
                                            <th className="pt-4 pb-4">{vehicle.vehicle_display_name}</th>
                                            <th className="rounded-xl">{vehicle.numberplate}</th>
                                            <th className="rounded-xl">{new Date(vehicle.CreatedDate).toDateString()} ({new Date(vehicle.CreatedDate).getHours()}:{new Date(vehicle.CreatedDate).getMinutes()})</th>
                                            <th></th>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    }
                </div>}

            </div>
            : loading ? <div className="mt-7"><LoadingSpinner /></div> : <p className="mt-4 font-medium text-lg">{error}</p>}
    </div>
}

export default CharacterSearch;