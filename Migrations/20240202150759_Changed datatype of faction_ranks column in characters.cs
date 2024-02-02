using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Changeddatatypeoffaction_rankscolumnincharacters : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "faction_rank",
                table: "characters");

            migrationBuilder.AddColumn<string>(
                name: "faction_ranks",
                table: "characters",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "faction_ranks",
                table: "characters");

            migrationBuilder.AddColumn<int>(
                name: "faction_rank",
                table: "characters",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
