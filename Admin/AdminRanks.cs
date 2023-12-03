using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.Admin
{
    public class RankList
    {
        public static string[] adminRanksList = { "None", "Support", "Senior Support", "Moderator", "Senior Moderator", "Administrator", "Senior Administrator", "Head Administrator", "Founder" };
        public static string[] adminRanksColours = { "", "#ff00fa", "#9666ff", "#37db63", "#018a35", "#ff6363", "#ff0000", "#00bbff", "#c096ff" };
    }

    public enum AdminRanks
    {
        Admin_None = 0,
        Admin_Support = 1,
        Admin_SeniorSupport = 2,
        Admin_Moderator = 3,
        Admin_SeniorModerator = 4,
        Admin_Admin = 5,
        Admin_SeniorAdmin = 6,
        Admin_HeadAdmin = 7,
        Admin_Founder = 8
    }
}
