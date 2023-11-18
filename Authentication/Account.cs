using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;



namespace CloudRP.Authentication
{
    public class Account
    {
        [Key]
        public int account_id { get; set; }

        public string username { get; set; }
        public string password { get; set; }
    }
}
