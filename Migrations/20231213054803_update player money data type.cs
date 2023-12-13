using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class updateplayermoneydatatype : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<ulong>(
                name: "money_amount",
                table: "characters",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<ulong>(
                name: "character_isbanned",
                table: "characters",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "money_amount",
                table: "characters",
                type: "int",
                nullable: false,
                oldClrType: typeof(ulong));

            migrationBuilder.AlterColumn<int>(
                name: "character_isbanned",
                table: "characters",
                type: "int",
                nullable: false,
                oldClrType: typeof(ulong));
        }
    }
}
