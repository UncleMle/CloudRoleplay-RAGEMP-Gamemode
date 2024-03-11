"use client";

import { ServerDashboardData } from "@/types";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { RiCashFill } from "react-icons/ri";
import CharacterList from "./CharacterList";
import CreditsPage from "./CreditsPage";
import PunishmentPage from "./PunishmentPage";
import StaffRoster from "./StaffRoster";
import FactionsPage from "./FactionsPage";
import StaffToolPage from "./StaffToolPage";


const DashboardView = ({ data }: { data: ServerDashboardData }) => {
    const [viewState, setViewState] = useState<string>("");
    const [selectIndex, setCharacterIndex] = useState<number>(0);
    const seachParams = useSearchParams();

    const views: string[] = [
        "dash", "credits", "factions", "punishments", "staff", "roster"
    ]

    useEffect(() => {
        if (views.indexOf(viewState) === -1) setViewState("dash");
    }, [viewState])

    useEffect(() => {
        if (typeof "window" !== undefined) {
            const urlSearchString = window.location.search;

            const params = new URLSearchParams(urlSearchString);

            if (params.get("view")) {
                setViewState(seachParams?.get("view") as string);
            } else setViewState("dash");
        }

    }, [seachParams]);

    return (
        <div className="text-white text-center bg-black/50 rounded-2xl p-8 h-fit">

            {
                viewState === "dash" && (data.characters.length > 0 ? <CharacterList characters={data.characters} /> : <span className="text-lg">You do not have any characters</span>)
            }

            {
                viewState === "credits" && <CreditsPage />
            }

            {
                viewState === "punishments" && <PunishmentPage punishments={data.punishments} />
            }

            {
                viewState === "roster" && <StaffRoster staffMembers={data.staffMembers} />
            }

            {
                viewState === "factions" && <FactionsPage factions={data.factions} />
            }

            {
                viewState === "staff" && <StaffToolPage adminLevel={data.accountData.adminLevel} />
            }
        </div>
    )
};

export default DashboardView;