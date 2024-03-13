import { DbCharacter } from "@/types";
import { useEffect, useState } from "react";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { FaCar } from "react-icons/fa";
import { factionColours, factions } from "@/sharedConstants";

const CharacterList = ({ characters }: { characters: DbCharacter[] }) => {
    const [selectIndex, setCharacterIndex] = useState<number>(0);
    let baseStyle = "";

    useEffect(() => {
        let char = characters[selectIndex];

        baseStyle = "";

        if (char.character_faction_data) {
            baseStyle += `grid lg:grid-cols-3 md:grid-cols-2 grid-cols-${JSON.parse(char.character_faction_data).length}`;
        }
    }, [selectIndex]);

    return (
        <div>
            <ul className="space-x-4 text-xl">
                {
                    characters.map((char, idx) => (
                        <button key={idx} onClick={() => setCharacterIndex(idx)} className={"inline-block " + (idx === selectIndex ? "border-b text-purple-400/50 border-purple-400/50" : "")}>
                            {char.character_name.replace("_", " ").toUpperCase()}
                        </button>
                    ))
                }
            </ul>

            {characters[selectIndex].character_faction_data && <p className={"mt-8" + baseStyle}>
                {
                    JSON.parse(characters[selectIndex].character_faction_data)?.map((f: number) =>
                    (
                        <span key={f} style={{ backgroundColor: factionColours[f] }} className="mr-3 p-2 rounded-xl">{factions[f].replace("_", " ")}</span>
                    ))
                }
            </p>}

            {
                characters[selectIndex].character_isbanned === 1 &&
                <p className="mt-8 mr-16 ml-16 p-2 bg-red-400/50 rounded-xl text-red-400">
                    This character is banned
                </p>
            }

            <h2 className="text-left border-l-4 pl-3 text-xl bg-gray-500/20 w-fit pr-6 p-2 mt-4 border-purple-400/50">Character Data</h2>
            <div className="border-l-4 w-full backdrop-blur-lg p-4 border-purple-400/50">

                <div className="grid md:grid-cols-3 grid-cols-2 gap-8 text-left">
                    <div>
                        Cash Amount
                        ${characters[selectIndex].cash_amount.toLocaleString("en-US")}
                    </div>
                    <div>
                        Salary Amount
                        ${characters[selectIndex].salary_amount?.toLocaleString("en-US")}
                    </div>
                    <div>
                        Job Status -
                        {
                            !characters[selectIndex].freelance_job_data ? " Unemployed" : " " + JSON.parse(characters[selectIndex]?.freelance_job_data).jobName
                        }</div>
                    <div>
                        Health - {characters[selectIndex].character_health}%</div>
                    <div>Money Amount
                        ${characters[selectIndex].money_amount.toLocaleString("en-US")}
                    </div>
                    <div>
                        Last seen - {new Date(characters[selectIndex].last_login).toDateString()}
                    </div>
                    <div>
                        Play Time {Math.round(characters[selectIndex].play_time_seconds / 60).toLocaleString("en-US")} minutes
                    </div>
                    <div>
                        Exp - {characters[selectIndex].player_exp.toLocaleString("en-US")}
                    </div>
                    <div>
                        Water - {Math.round(characters[selectIndex].character_water)}% Hunger - {Math.round(characters[selectIndex].character_hunger)}%
                    </div>
                </div>

            </div>


            <h2 className="text-left border-l-4 pl-3 text-xl bg-gray-500/20 w-fit pr-6 p-2 mt-20 border-purple-400/50 ">Character&#39;s vehicles</h2>
            <div className="border-l-4 w-full backdrop-blur-lg p-4 border-purple-400/50 max-h-96 overflow-y-scroll">

                {characters[selectIndex].charactersVehicles.length > 0 &&
                    <table className="w-full">
                        <tbody>
                            <tr className="border-b-4 border-gray-400/50">
                                <th className="pb-4 relative">Vehicle Name</th>
                                <th className="pb-4">Numberplate</th>
                                <th className="pb-4">Dimension</th>
                                <th className="pb-4">Distance</th>
                                <th className="pb-4">Fuel Level</th>
                                <th className="pb-4">Health</th>
                            </tr>
                            {
                                characters[selectIndex].charactersVehicles.map((veh, idx: number) => (
                                    <tr key={idx} className="pb-4 border-b-2 border-gray-400/50">
                                        <th className="pt-4 pb-4">{veh.vehicle_display_name}</th>
                                        <th>{veh.numberplate}</th>
                                        <th>{veh.vehicle_dimension}</th>
                                        <th>{Math.round(veh.vehicle_distance / 1000)}KMH</th>
                                        <th>{Math.round(veh.vehicle_fuel)}L</th>
                                        <th>{veh.vehicle_health / 10}%</th>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                }

                {
                    characters[selectIndex].charactersVehicles.length == 0 && <p className="text-gray-400">This character doesn&apost have any vehicles.</p>
                }

            </div>
        </div>
    )
}

export default CharacterList;