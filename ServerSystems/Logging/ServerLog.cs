using CloudRP.ServerSystems.Database;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace CloudRP.ServerSystems.Logging
{
    public class ServerLog : BaseEntity
    {
        [Key]
        public int server_log_id { get; set; }

        [Required]
        public string server_log_name { get; set; }
        public string server_log_description { get; set; }
        public int character_owner_id { get; set; }
        public int account_id { get; set; } = -1;
        public int log_type { get; set; }
    }
}
