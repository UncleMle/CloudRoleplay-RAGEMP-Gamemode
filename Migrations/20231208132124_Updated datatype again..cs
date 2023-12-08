using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Updateddatatypeagain : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<double>(
                name: "character_water",
                table: "characters",
                nullable: false,
                oldClrType: typeof(ulong),
                oldType: "bigint unsigned");

            migrationBuilder.AlterColumn<double>(
                name: "character_hunger",
                table: "characters",
                nullable: false,
                oldClrType: typeof(ulong),
                oldType: "bigint unsigned");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<ulong>(
                name: "character_water",
                table: "characters",
                type: "bigint unsigned",
                nullable: false,
                oldClrType: typeof(double));

            migrationBuilder.AlterColumn<ulong>(
                name: "character_hunger",
                table: "characters",
                type: "bigint unsigned",
                nullable: false,
                oldClrType: typeof(double));
        }
    }
}
