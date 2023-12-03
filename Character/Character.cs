using CloudRP.Database;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Text;
using CloudRP.PlayerData;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace CloudRP.Character
{
    public class DbCharacter : BaseEntity
    {
        [Key]
        public int character_id { get; set; }

        [Required]
        public int owner_id { get; set; }

        [Required]
        public string character_name { get; set; }

        [Required]
        public float position_x { get; set; } = PlayersData.defaultSpawnPosition.X;

        [Required]
        public float position_y { get; set; } = PlayersData.defaultSpawnPosition.Y;

        [Required]
        public float position_z { get; set; } = PlayersData.defaultSpawnPosition.Z;

        [Required]
        public DateTime last_login { get; set; }

        [Required]
        public int character_health { get; set; }

        [Required]
        public int character_isbanned {  get; set; }

        [Required]
        public int money_amount { get; set; } = 12000;

        public ulong play_time_seconds { get; set; }

        public uint player_dimension { get; set; }

        public ulong player_exp {  get; set; }

        [NotMapped]
        public bool voiceChatState { get; set; } = true;

        [NotMapped]
        public CharacterModel characterModel { get; set; }
    }

}
