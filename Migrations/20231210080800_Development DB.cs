using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class DevelopmentDB : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "accounts",
                columns: table => new
                {
                    account_id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    CreatedDate = table.Column<DateTime>(nullable: false),
                    UpdatedDate = table.Column<DateTime>(nullable: false),
                    account_uuid = table.Column<string>(nullable: true),
                    username = table.Column<string>(nullable: false),
                    password = table.Column<string>(nullable: false),
                    email_address = table.Column<string>(nullable: true),
                    user_ip = table.Column<string>(nullable: true),
                    auto_login_key = table.Column<string>(nullable: true),
                    auto_login = table.Column<int>(nullable: false),
                    admin_status = table.Column<int>(nullable: false),
                    vip_status = table.Column<int>(nullable: false),
                    admin_name = table.Column<string>(nullable: true),
                    admin_ped = table.Column<string>(nullable: true),
                    client_serial = table.Column<string>(nullable: true),
                    ban_status = table.Column<int>(nullable: false),
                    social_club_id = table.Column<ulong>(nullable: false),
                    max_characters = table.Column<int>(nullable: false),
                    admin_esp = table.Column<bool>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_accounts", x => x.account_id);
                });

            migrationBuilder.CreateTable(
                name: "bans",
                columns: table => new
                {
                    ban_id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    CreatedDate = table.Column<DateTime>(nullable: false),
                    UpdatedDate = table.Column<DateTime>(nullable: false),
                    ip_address = table.Column<string>(nullable: false),
                    client_serial = table.Column<string>(nullable: false),
                    social_club_id = table.Column<ulong>(nullable: false),
                    social_club_name = table.Column<string>(nullable: false),
                    username = table.Column<string>(nullable: true),
                    account_id = table.Column<int>(nullable: false),
                    ban_reason = table.Column<string>(nullable: false),
                    admin = table.Column<string>(nullable: false),
                    lift_unix_time = table.Column<long>(nullable: false),
                    issue_unix_date = table.Column<long>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_bans", x => x.ban_id);
                });

            migrationBuilder.CreateTable(
                name: "character_clothes",
                columns: table => new
                {
                    clothing_id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    CreatedDate = table.Column<DateTime>(nullable: false),
                    UpdatedDate = table.Column<DateTime>(nullable: false),
                    character_id = table.Column<int>(nullable: false),
                    mask = table.Column<int>(nullable: false),
                    mask_texture = table.Column<int>(nullable: false),
                    torso = table.Column<int>(nullable: false),
                    torso_texture = table.Column<int>(nullable: false),
                    leg = table.Column<int>(nullable: false),
                    leg_texture = table.Column<int>(nullable: false),
                    bags = table.Column<int>(nullable: false),
                    bag_texture = table.Column<int>(nullable: false),
                    shoes = table.Column<int>(nullable: false),
                    shoes_texture = table.Column<int>(nullable: false),
                    access = table.Column<int>(nullable: false),
                    access_texture = table.Column<int>(nullable: false),
                    undershirt = table.Column<int>(nullable: false),
                    undershirt_texture = table.Column<int>(nullable: false),
                    armor = table.Column<int>(nullable: false),
                    armor_texture = table.Column<int>(nullable: false),
                    decals = table.Column<int>(nullable: false),
                    decals_texture = table.Column<int>(nullable: false),
                    top = table.Column<int>(nullable: false),
                    top_texture = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_character_clothes", x => x.clothing_id);
                });

            migrationBuilder.CreateTable(
                name: "character_models",
                columns: table => new
                {
                    character_model_id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    owner_id = table.Column<int>(nullable: false),
                    rotation = table.Column<int>(nullable: false),
                    firstHeadShape = table.Column<int>(nullable: false),
                    secondHeadShape = table.Column<int>(nullable: false),
                    firstSkinTone = table.Column<int>(nullable: false),
                    secondSkinTone = table.Column<int>(nullable: false),
                    headMix = table.Column<int>(nullable: false),
                    skinMix = table.Column<int>(nullable: false),
                    sex = table.Column<bool>(nullable: false),
                    noseWidth = table.Column<int>(nullable: false),
                    noseLength = table.Column<int>(nullable: false),
                    noseTip = table.Column<int>(nullable: false),
                    browHeight = table.Column<int>(nullable: false),
                    cheekBoneHeight = table.Column<int>(nullable: false),
                    cheeksWidth = table.Column<int>(nullable: false),
                    lips = table.Column<int>(nullable: false),
                    lipstick = table.Column<int>(nullable: false),
                    jawHeight = table.Column<int>(nullable: false),
                    chinPosition = table.Column<int>(nullable: false),
                    chinShape = table.Column<int>(nullable: false),
                    noseHeight = table.Column<int>(nullable: false),
                    noseBridge = table.Column<int>(nullable: false),
                    noseBridgeShift = table.Column<int>(nullable: false),
                    browWidth = table.Column<int>(nullable: false),
                    cheekBoneWidth = table.Column<int>(nullable: false),
                    eyes = table.Column<int>(nullable: false),
                    jawWidth = table.Column<int>(nullable: false),
                    chinLength = table.Column<int>(nullable: false),
                    chinWidth = table.Column<int>(nullable: false),
                    neckWidth = table.Column<int>(nullable: false),
                    eyeColour = table.Column<int>(nullable: false),
                    blemishes = table.Column<int>(nullable: false),
                    ageing = table.Column<int>(nullable: false),
                    facialHairStyle = table.Column<int>(nullable: false),
                    facialHairColour = table.Column<int>(nullable: false),
                    chestHairStyle = table.Column<int>(nullable: false),
                    hairStyle = table.Column<int>(nullable: false),
                    hairColour = table.Column<int>(nullable: false),
                    hairHighlights = table.Column<int>(nullable: false),
                    eyebrowsStyle = table.Column<int>(nullable: false),
                    eyebrowsColour = table.Column<int>(nullable: false),
                    complexion = table.Column<int>(nullable: false),
                    sunDamage = table.Column<int>(nullable: false),
                    molesFreckles = table.Column<int>(nullable: false),
                    blushStyle = table.Column<int>(nullable: false),
                    makeup = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_character_models", x => x.character_model_id);
                });

            migrationBuilder.CreateTable(
                name: "characters",
                columns: table => new
                {
                    character_id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    CreatedDate = table.Column<DateTime>(nullable: false),
                    UpdatedDate = table.Column<DateTime>(nullable: false),
                    owner_id = table.Column<int>(nullable: false),
                    character_name = table.Column<string>(nullable: false),
                    position_x = table.Column<float>(nullable: false),
                    position_y = table.Column<float>(nullable: false),
                    position_z = table.Column<float>(nullable: false),
                    last_login = table.Column<DateTime>(nullable: false),
                    character_health = table.Column<int>(nullable: false),
                    character_water = table.Column<double>(nullable: false),
                    character_hunger = table.Column<double>(nullable: false),
                    character_isbanned = table.Column<int>(nullable: false),
                    money_amount = table.Column<int>(nullable: false),
                    play_time_seconds = table.Column<ulong>(nullable: false),
                    player_dimension = table.Column<uint>(nullable: false),
                    player_exp = table.Column<ulong>(nullable: false),
                    injured_timer = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_characters", x => x.character_id);
                });

            migrationBuilder.CreateTable(
                name: "nicknames",
                columns: table => new
                {
                    nickname_id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    CreatedDate = table.Column<DateTime>(nullable: false),
                    UpdatedDate = table.Column<DateTime>(nullable: false),
                    owner_id = table.Column<int>(nullable: false),
                    target_character_id = table.Column<int>(nullable: false),
                    nickname = table.Column<string>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_nicknames", x => x.nickname_id);
                });

            migrationBuilder.CreateTable(
                name: "server_connections",
                columns: table => new
                {
                    join_log_id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    unix = table.Column<long>(nullable: false),
                    connection_type = table.Column<int>(nullable: false),
                    character_name = table.Column<string>(nullable: false),
                    character_id = table.Column<int>(nullable: false),
                    player_id = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_server_connections", x => x.join_log_id);
                });

            migrationBuilder.CreateTable(
                name: "vehicles",
                columns: table => new
                {
                    vehicle_id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    CreatedDate = table.Column<DateTime>(nullable: false),
                    UpdatedDate = table.Column<DateTime>(nullable: false),
                    vehicle_uuid = table.Column<string>(nullable: true),
                    owner_id = table.Column<int>(nullable: false),
                    vehicle_name = table.Column<string>(nullable: false),
                    vehicle_locked = table.Column<bool>(nullable: false),
                    vehicle_spawn_hash = table.Column<uint>(nullable: false),
                    numberplate = table.Column<string>(nullable: false),
                    position_x = table.Column<float>(nullable: false),
                    position_y = table.Column<float>(nullable: false),
                    position_z = table.Column<float>(nullable: false),
                    rotation = table.Column<float>(nullable: false),
                    vehicle_dimension = table.Column<string>(nullable: true),
                    vehicle_insurance_id = table.Column<int>(nullable: false),
                    vehicle_garage_id = table.Column<int>(nullable: false),
                    vehicle_fuel = table.Column<double>(nullable: false),
                    vehicle_distance = table.Column<ulong>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vehicles", x => x.vehicle_id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "accounts");

            migrationBuilder.DropTable(
                name: "bans");

            migrationBuilder.DropTable(
                name: "character_clothes");

            migrationBuilder.DropTable(
                name: "character_models");

            migrationBuilder.DropTable(
                name: "characters");

            migrationBuilder.DropTable(
                name: "nicknames");

            migrationBuilder.DropTable(
                name: "server_connections");

            migrationBuilder.DropTable(
                name: "vehicles");
        }
    }
}
