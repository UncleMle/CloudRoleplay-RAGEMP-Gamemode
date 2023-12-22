using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Furtherworkonvehicleneons : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "neon_enabled",
                table: "vehicle_mods");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "neon_enabled",
                table: "vehicle_mods",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }
    }
}
