import { AdminPunishment } from "@/types";
import { useEffect } from "react";
import { ImCross } from "react-icons/im";
import { FaCheck } from "react-icons/fa";

const PunishmentPage = ({ punishments }: { punishments: AdminPunishment[] }) => {
    let punishmentNames: string[] = [
        "Jail", "Ban", "Warn", "Kick", "Back to quiz"
    ];

    enum PunishmentTypes {
        AdminJail,
        AdminBan,
        AdminWarn,
        AdminKick,
        AdminBackToQuiz
    }

    return (
        <div className="pb-10">

            <h2 className="text-left border-l-4 pl-3 text-xl bg-gray-500/20 w-fit pr-6 p-2 mt-10 border-purple-400/50 ">Admin Punishments</h2>
            <div className="backdrop-blur-lg border-l-4 border-purple-400/50 max-h-96 overflow-y-scroll">
                {
                    punishments.length > 0 ?
                        <table className="w-full">
                            <tr className="border-b-4 border-gray-400/50">
                                <th className="pb-4 relative">Admin Name</th>
                                <th className="pb-4">Type</th>
                                <th className="pb-4">Reason</th>
                                <th className="pb-4">Void</th>
                                <th className="pb-4">Length</th>
                            </tr>
                            {
                                punishments.map(punishment => (
                                    <tr key={punishment.admin_punishment_id} className="pb-4 border-b-2 border-gray-400/50">
                                        <th className="pt-4 pb-4">{punishment.admin_name}</th>
                                        <th>{punishmentNames[punishment.punishment_type]}</th>
                                        <th className="max-w-xl">{punishment.punishment_reason}</th>
                                        <th>{punishment.is_void === 0 ? <span className="text-red-400">No</span> : <span className="text-green-400">Yes</span>}</th>
                                        <th>{punishment.unix_expires === -1 ? <span className="text-red-400">Permanent</span> : punishment.unix_expires}</th>
                                    </tr>
                                ))
                            }
                        </table>
                        : <p>You do not have any punishments.</p>
                }
            </div>



        </div >


    )
};

export default PunishmentPage;