using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Init : Migration
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
                    social_club_id = table.Column<ulong>(nullable: false)
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
                    username = table.Column<string>(nullable: false),
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
                    character_isbanned = table.Column<int>(nullable: false),
                    money_amount = table.Column<int>(nullable: false),
                    play_time_seconds = table.Column<ulong>(nullable: false),
                    player_dimension = table.Column<uint>(nullable: false),
                    player_exp = table.Column<ulong>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_characters", x => x.character_id);
                });

            migrationBuilder.CreateTable(
                name: "vehicles",
                columns: table => new
                {
                    vehicle_id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    CreatedDate = table.Column<DateTime>(nullable: false),
                    UpdatedDate = table.Column<DateTime>(nullable: false),
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
                    vehicle_garage_id = table.Column<int>(nullable: false)
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
                name: "characters");

            migrationBuilder.DropTable(
                name: "vehicles");
        }
    }
}
