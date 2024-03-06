using CloudRP.ServerSystems.Database;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace CloudRP.ServerSystems.Admin
{
    public class AdminPunishments : BaseEntity
    {
        [Key]
        public int admin_punishment_id { get; set; }

        [Required]
        public int owner_account_id { get; set; }
        public int punishment_type { get; set; }
        public string admin_name { get; set; }
        public string punishment_reason { get; set; }
        public bool is_void { get; set; }
        public long unix_expires { get; set; }

        public static void addNewPunishment(int accountId, string reason, string adminName, PunishmentTypes adminPunishmentType, long unixExpires = -1)
        {
            using(DefaultDbContext dbContext = new DefaultDbContext())
            {
                dbContext.admin_punishments.Add(new AdminPunishments
                {
                    admin_name = adminName,
                    owner_account_id = accountId,
                    punishment_reason = reason,
                    unix_expires = unixExpires,
                    punishment_type = (int)adminPunishmentType
                });

                dbContext.SaveChanges();
            }
        }
    }

    public enum PunishmentTypes
    {
        AdminJail,
        AdminBan,
        AdminWarn,
        AdminKick,
        AdminBackToQuiz
    }
}
