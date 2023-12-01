using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class DisconnectionTypecolumnincharlogs : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "character_join_logs",
                columns: table => new
                {
                    join_log_id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    join_unix = table.Column<ulong>(nullable: false),
                    disconnection_type = table.Column<string>(nullable: true),
                    leave_unix = table.Column<ulong>(nullable: false),
                    character_name = table.Column<string>(nullable: false),
                    character_id = table.Column<int>(nullable: false),
                    player_id = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_character_join_logs", x => x.join_log_id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "character_join_logs");
        }
    }
}
