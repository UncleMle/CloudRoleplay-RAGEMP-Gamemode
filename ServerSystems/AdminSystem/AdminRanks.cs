using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.ServerSystems.Admin
{
    public class RankList
    {
        public static string[] adminRanksList = { "None", "Support", "Senior Support", "Moderator", "Senior Moderator", "Administrator", "Senior Administrator", "Head Administrator", "Founder", "!{#DAB8FF}D!{#C0BAFC}e!{#B6BCFA}v!{#ACBEF8}e!{#A2C0F6}l!{#98C2F4}o!{#8EC4F2}p!{#84C6F0}e!{#7AC8EE}r" };
        public static string[] adminRanksColours = { "", "#ff00fa", "#9666ff", "#37db63", "#018a35", "#ff6363", "#ff0000", "#00bbff", "#c096ff", "" };
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
        Admin_Founder = 8,
        Admin_Developer = 9
    }
}
