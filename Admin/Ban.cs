using CloudRP.Database;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace CloudRP.Admin
{
    public class Ban : BaseEntity
    {
        [Key]
        public int ban_id { get; set; }

        [Required]
        public string ip_address { get; set; }

        [Required]
        public string client_serial { get; set; }

        [Required]
        public ulong social_club_id { get; set; }

        [Required]
        public string social_club_name { get; set; }

        public string username { get; set; }

        public int account_id { get; set; }

        [Required]
        public string ban_reason { get; set; }

        [Required]
        public string admin {  get; set; }

        [Required]
        public long lift_unix_time { get; set; }

        [Required]
        public long issue_unix_date { get; set; } 

    }
}
