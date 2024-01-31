using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Addedfactionsystemcolumns : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "character_faction_data",
                table: "characters",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "faction_duty_status",
                table: "characters",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "character_faction_data",
                table: "characters");

            migrationBuilder.DropColumn(
                name: "faction_duty_status",
                table: "characters");
        }
    }
}
