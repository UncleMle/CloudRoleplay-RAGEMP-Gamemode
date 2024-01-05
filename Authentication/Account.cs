using System;
using System.ComponentModel.DataAnnotations;
using CloudRP.Database;
using System.ComponentModel.DataAnnotations.Schema;

namespace CloudRP.Authentication
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
        public string password { get; set; }
        public string email_address { get; set; }
        public string user_ip { get; set; }
        public string auto_login_key { get; set; }
        public int auto_login { get; set; }
        public int admin_status { get; set; }
        public int vip_status { get; set;}
        public string admin_name { get; set; }
        public string admin_ped { get; set; }
        public string client_serial { get; set; }
        public int ban_status { get; set; }
        public ulong social_club_id { get; set; }
        public int max_characters { get; set; }
        public bool admin_esp { get; set; }

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
    }
}
