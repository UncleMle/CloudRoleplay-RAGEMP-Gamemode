using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Updatedcharacterstatsdatatype : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<ulong>(
                name: "character_water",
                table: "characters",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<ulong>(
                name: "character_hunger",
                table: "characters",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "character_water",
                table: "characters",
                type: "int",
                nullable: false,
                oldClrType: typeof(ulong));

            migrationBuilder.AlterColumn<int>(
                name: "character_hunger",
                table: "characters",
                type: "int",
                nullable: false,
                oldClrType: typeof(ulong));
        }
    }
}
