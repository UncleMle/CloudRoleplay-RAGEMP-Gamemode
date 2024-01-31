using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Addedfirstlogincolumncharacterlicensedata : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "character_license_data",
                table: "characters",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "has_first_login",
                table: "accounts",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "character_license_data",
                table: "characters");

            migrationBuilder.DropColumn(
                name: "has_first_login",
                table: "accounts");
        }
    }
}
