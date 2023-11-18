using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using GTANetworkAPI;


namespace CloudRP.Authentication
{
    internal class Account : Script
    {
        [Table("accounts")]
        public class account
        {
            [Key]
            [Column("id")]
            public int account_id { get; set;}

            [Column("username")]
            public string username { get; set;}
        }
    }
}
