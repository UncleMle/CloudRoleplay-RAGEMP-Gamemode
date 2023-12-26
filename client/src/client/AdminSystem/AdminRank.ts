class AdminRank {
    public static readonly adminRanksList: string[] = ["None", "Support", "Senior Support", "Moderator", "Senior Moderator", "Administrator", "Senior Administrator", "Head Administrator", "Founder", "Developer"];
    public static readonly adminRanksColours: string[] = ["", "#ff00fa", "#9666ff", "#37db63", "#018a35", "#ff6363", "#ff0000", "#00bbff", "#c096ff", "#c096ff"];

    public static getAdminRankInfo(rankId: number): { rank: string, colour: string } | void {
        if(rankId > 0 && rankId <= AdminRank.adminRanksList.length) {
            return { rank: AdminRank.adminRanksList[rankId], colour: AdminRank.adminRanksColours[rankId] };
        }
    }
}

export default AdminRank;