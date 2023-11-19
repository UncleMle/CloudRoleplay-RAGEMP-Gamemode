using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
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
        public string account_uuid { get; set; }

        [Required]
        public string username { get; set; }

        [Required]
        public string password { get; set; }

        public string email_address { get; set; }

        public int auto_login { get; set; }

        public int admin_status { get; set; }

        public int vip_status { get; set;}

        public string admin_name { get; set; }

        public string client_serial { get; set; }

        public int ban_status { get; set; }

        public int social_club_id { get; set; }
    }
}
