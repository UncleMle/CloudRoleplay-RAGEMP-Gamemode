using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using CloudRP.ServerSystems.Database;
using Microsoft.EntityFrameworkCore.Diagnostics.Internal;
using Newtonsoft.Json;

namespace CloudRP.ServerSystems.Authentication
{
    public class Account : BaseEntity
    {
        [Key]
        public int account_id { get; set; }

        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public string account_uuid { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public string username { get; set; }

        [Required]
        public string redeem_code { get; set; }
        public string password { get; set; }
        public string email_address { get; set; }
        public string user_ip { get; set; }
        public string auto_login_key { get; set; }
        public int auto_login { get; set; }
        public int admin_status { get; set; }
        public bool vip_status { get; set; }
        public string admin_name { get; set; }
        public string admin_ped { get; set; }
        public string client_serial { get; set; }
        public int ban_status { get; set; }
        public ulong social_club_id { get; set; }
        public string social_club_name { get; set; }
        public int max_characters { get; set; }
        public bool admin_esp { get; set; }
        public bool has_first_login { get; set; }
        public long vip_unix_expires { get; set; }
        public int admin_jail_time { get; set; }
        public string admin_jail_reason { get; set; }
        public bool has_passed_quiz { get; set; }
        public long quiz_fail_unix { get; set; }
        public string ucp_otp { get; set; }
        public string ucp_image_url { get; set; }
        public long vip_credits_amount { get; set; }
        public long admin_reports_completed { get; set; }

        [NotMapped]
        public bool adminDuty { get; set; }
        [NotMapped]
        public bool isFlying { get; set; }
        [NotMapped]
        public bool isFrozen { get; set; }
        [NotMapped]
        public bool isOnCharacterCreation { get; set; }
        [NotMapped]
        public bool showAdminPed { get; set; }

        public static User getById(int id)
        {
            User findAccount = null;

            using(DefaultDbContext dbContext = new DefaultDbContext())
            {
                Account find = dbContext.accounts.Where(ac => ac.account_id == id).FirstOrDefault();
            
                if(find != null)
                {
                    findAccount = JsonConvert.DeserializeObject<User>(JsonConvert.SerializeObject(find));
                }
            }

            return findAccount;
        }
    }
}
