using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using CloudRP.PlayerSystems.PlayerData;
using CloudRP.ServerSystems.Database;

namespace CloudRP.PlayerSystems.Character
{
    public class DbCharacter : BaseEntity
    {
        [Key]
        public int character_id { get; set; }

        [Required]
        public int owner_id { get; set; }
        public string character_name { get; set; }
        public float position_x { get; set; } = PlayersData.defaultSpawnPosition.X;
        public float position_y { get; set; } = PlayersData.defaultSpawnPosition.Y;
        public float position_z { get; set; } = PlayersData.defaultSpawnPosition.Z;
        public DateTime last_login { get; set; }
        public int character_health { get; set; }
        public double character_water { get; set; } = 100;
        public double character_hunger { get; set; } = 100;
        public ulong character_isbanned { get; set; }
        public long money_amount { get; set; } = 12000;
        public long cash_amount { get; set; } = 2000;
        public ulong play_time_seconds { get; set; }
        public uint player_dimension { get; set; }
        public ulong player_exp { get; set; }
        public int injured_timer { get; set; }

        [NotMapped]
        public bool voiceChatState { get; set; } = true;
        [NotMapped]
        public CharacterModel characterModel { get; set; }
        [NotMapped]
        public CharacterClothing characterClothing { get; set; }
        [NotMapped]
        public bool loggingOut { get; set; }
    }

}
