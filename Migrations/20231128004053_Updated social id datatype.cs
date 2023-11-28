using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Updatedsocialiddatatype : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<ulong>(
                name: "social_club_id",
                table: "accounts",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "social_club_id",
                table: "accounts",
                type: "int",
                nullable: false,
                oldClrType: typeof(ulong));
        }
    }
}
