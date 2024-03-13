import LoadingSpinner from "@/components/utilComponents/LoadingSpinner";
import { getFormattedDateString } from "@/lib/Helpers/Helpers";
import { adminRanksColours } from "@/sharedConstants";
import { DbCharacter, DbVehicle, User } from "@/types";
import axios from "axios";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { FaSearch, FaVuejs } from "react-icons/fa";
import { GiCarWheel } from "react-icons/gi";
import Image from "next/image";
import { staffActions } from "../StaffToolPage";
import { useSearchParams, useRouter } from "next/navigation";

const VehicleSearch = ({ searchParam, setSearch }: {
    searchParam: string, setSearch: any
}) => {
    const [error, setError] = useState<string>();
    const [cookies, setCookies] = useCookies();
    const [loading, setLoading] = useState<boolean>();
    const [viewingOwner, setViewingOwner] = useState<boolean>();
    const [numberPlateOrId, setNumberPlateOrId] = useState<string>("");
    const [vehicle, setVehicle] = useState<DbVehicle | null>(null);
    const [owner, setOwner] = useState<User | null>(null);
    const [ownerChar, setOwnerChar] = useState<DbCharacter | null>(null);
    const [search, setSearchParams] = useState<string>("");
    const seachParams = useSearchParams();
    const router = useRouter();
    const searchParamKey: string = "search";

    useEffect(() => {
        if (seachParams?.get(searchParamKey)) {
            searchVehicle(seachParams?.get(searchParamKey));
            setNumberPlateOrId(seachParams?.get(searchParamKey) as string);
        }
    }, []);

    const searchVehicle = async (param: string | null = null) => {
        if (numberPlateOrId.length === 0 && !param) return;

        let query: string = param ? param : numberPlateOrId;

        router.push("/home?view=staff&staffview=vehsearch&search=" + query);

        setLoading(true);
        setError("");
        try {
            const options = {
                method: "GET",
                headers: {
                    "content-type": "application/json",
                    "x-auth-token": cookies['user-jwt-token'],
                    "x-search-vehicle": query
                },
            };

            let getVehicle = await axios.get("/api/staff/vehicle-search", options);

            setVehicle(getVehicle.data.veh);
            setOwner(getVehicle.data.acc);
            setOwnerChar(getVehicle.data.char);
        } catch {
            setError("Vehicle not found.");
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (vehicleName: string) => {
        return `/images/cars/${vehicleName}.png`
    }

    return (
        <div>
            <form onSubmit={(e: any) => {
                e.preventDefault();
                searchVehicle();
            }} className="flex justify-center">
                <div className="flex bg-black/30 rounded-xl"><input
                    value={numberPlateOrId}
                    onChange={(e: any) => setNumberPlateOrId(e.target.value)}
                    type="text"
                    maxLength={40}
                    className="ml-8 p-2 bg-transparent block rounded-lg outline-none"
                    placeholder={"Enter a vehicles ID or plate"}
                />

                    <button className="pl-2 pr-6">
                        <FaSearch />
                    </button>
                </div>
            </form>

            {
                loading && <LoadingSpinner />
            }

            {!loading && error ? <div>{error}</div> : <div>
                <div className="mt-10 lg:mr-[23%] lg:ml-[23%]">

                    {vehicle &&
                        <>
                            <div className="flex justify-center">
                                <Image
                                    className="w-80 h-40 rounded-xl"
                                    src={getImageUrl(vehicle.vehicle_name)}
                                    alt="Img"
                                    width={200}
                                    height={200}
                                    priority
                                />
                            </div>
                            <div className="w-full border-2 mt-12 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                                <span className="float-left">Vehicle ID</span>
                                <span className="float-right">{vehicle.vehicle_id}</span>
                            </div>

                            <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                                <span className="float-left">Vehicle Plate</span>
                                <span className="float-right">{vehicle.numberplate}</span>
                            </div>

                            <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                                <span className="float-left">Vehicle Name</span>
                                <span className="float-right">{vehicle.vehicle_display_name}</span>
                            </div>

                            <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                                <span className="float-left">Tyre States</span>
                                <span className="float-right">{
                                    JSON.parse(vehicle.tyre_states).map((tyre: boolean, idx: number) => (
                                        <span key={idx} className={"inline-block " + (tyre ? "text-red-400" : "text-green-400")}>
                                            <GiCarWheel className="mr-3 scale-150 mt-2" />
                                        </span>
                                    ))
                                }</span>
                            </div>

                            <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                                <span className="float-left">Dimension</span>
                                <span className="float-right">{vehicle.vehicle_dimension[0].toUpperCase() + vehicle.vehicle_dimension.substring(1)}</span>
                            </div>

                            <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                                <span className="float-left">Distance</span>
                                <span className="float-right">{Math.round(vehicle.vehicle_distance / 1000)}KMH</span>
                            </div>

                            <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                                <span className="float-left">Fuel Level</span>
                                <span className="float-right">{Math.round(vehicle.vehicle_fuel)}L</span>
                            </div>

                            <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                                <span className="float-left">Health</span>
                                <span className="float-right">{Math.round(vehicle.vehicle_health / 10)}%</span>
                            </div>

                            <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                                <span className="float-left">Created At</span>
                                <span className="float-right">{getFormattedDateString(vehicle.CreatedDate)}</span>
                            </div>

                            <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                                <span className="float-left">Last Seen</span>
                                <span className="float-right">{getFormattedDateString(vehicle.UpdatedDate)}</span>
                            </div>

                            {vehicle.owner_id != -1 && < div className="flex justify-center mt-10">
                                <button onClick={() => setViewingOwner(!viewingOwner)} className="relative md:mt-0 mt-4 border-2 p-4 rounded-xl border-gray-400/50 duration-300 hover:scale-105 backdrop-blur-md">
                                    {viewingOwner ? "Close" : "View"} Owner
                                </button>
                            </div>}

                            {
                                viewingOwner && owner && <div>

                                    <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                                        <span className="float-left">Account ID</span>
                                        <span className="float-right">{owner.account_id}</span>
                                    </div>

                                    <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                                        <span className="float-left">Username</span>
                                        <span className="float-right">{owner.username}</span>
                                    </div>

                                    <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                                        <span className="float-left">Email Address</span>
                                        <span className="float-right">{owner.email_address ? <span>{owner.email_address}</span> : <span className="text-lg" style={{
                                            color: adminRanksColours[7]
                                        }}>HA +</span>}</span>
                                    </div>

                                    {ownerChar &&
                                        <>
                                            <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                                                <span className="float-left">Character ID</span>
                                                <span className="float-right">{ownerChar.character_id}</span>
                                            </div>

                                            <div className="w-full mt-4 border-2 p-3 rounded-xl h- border-gray-500 h-14 backdrop-blur-md">
                                                <span className="float-left">Character Name</span>
                                                <span className="float-right">{ownerChar.character_name}</span>
                                            </div>

                                        </>
                                    }
                                </div>
                            }
                        </>
                    }
                </div>
            </div>}
        </div >
    )

};

export default VehicleSearch;