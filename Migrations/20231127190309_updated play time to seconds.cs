using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class updatedplaytimetoseconds : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "play_time_minutes",
                table: "characters");

            migrationBuilder.AddColumn<int>(
                name: "play_time_seconds",
                table: "characters",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "play_time_seconds",
                table: "characters");

            migrationBuilder.AddColumn<int>(
                name: "play_time_minutes",
                table: "characters",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
