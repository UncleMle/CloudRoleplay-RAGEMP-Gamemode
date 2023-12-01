using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Improvedconnectionlogging : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "character_join_logs");

            migrationBuilder.CreateTable(
                name: "server_connections",
                columns: table => new
                {
                    join_log_id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    unix = table.Column<ulong>(nullable: false),
                    connection_type = table.Column<string>(nullable: false),
                    character_name = table.Column<string>(nullable: false),
                    character_id = table.Column<int>(nullable: false),
                    player_id = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_server_connections", x => x.join_log_id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "server_connections");

            migrationBuilder.CreateTable(
                name: "character_join_logs",
                columns: table => new
                {
                    join_log_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    character_id = table.Column<int>(type: "int", nullable: false),
                    character_name = table.Column<string>(type: "longtext CHARACTER SET utf8mb4", nullable: false),
                    disconnection_type = table.Column<string>(type: "longtext CHARACTER SET utf8mb4", nullable: true),
                    join_unix = table.Column<ulong>(type: "bigint unsigned", nullable: false),
                    leave_unix = table.Column<ulong>(type: "bigint unsigned", nullable: false),
                    player_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_character_join_logs", x => x.join_log_id);
                });
        }
    }
}
