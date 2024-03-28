using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Addedtotaldeathskillstocharacteradminreporttotalforaccount : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "total_deaths",
                table: "characters",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "total_kills",
                table: "characters",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "total_times_jailed",
                table: "characters",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "admin_reports_completed",
                table: "accounts",
                nullable: false,
                defaultValue: 0L);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "total_deaths",
                table: "characters");

            migrationBuilder.DropColumn(
                name: "total_kills",
                table: "characters");

            migrationBuilder.DropColumn(
                name: "total_times_jailed",
                table: "characters");

            migrationBuilder.DropColumn(
                name: "admin_reports_completed",
                table: "accounts");
        }
    }
}
