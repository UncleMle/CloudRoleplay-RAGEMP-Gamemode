using CloudRP.ServerSystems.Database;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace CloudRP.ServerSystems.Admin
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
        public string admin { get; set; }
        [Required]
        public long lift_unix_time { get; set; }
        [Required]
        public long issue_unix_date { get; set; }
        public bool is_active { get; set; } = true;

        public static async Task sendBanWebhookMessageAsync(string message)
        {
            string webhookUrl = Main._banWebhook;

            string jsonPayload = Newtonsoft.Json.JsonConvert.SerializeObject(new
            {
                content = message,
                username = "Cloud RP | Bans",
                avatar_url = "https://i.imgur.com/PAeaKFH.png"
            });

            using (var httpClient = new HttpClient())
            {
                try
                {
                    HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, webhookUrl)
                    {
                        Content = new StringContent(jsonPayload, Encoding.UTF8, "application/json")
                    };

                    HttpResponseMessage response = await httpClient.SendAsync(request);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"An error occurred whilst sending a ban webhook message: {ex.Message}");
                }
            }
        }
    }
}
