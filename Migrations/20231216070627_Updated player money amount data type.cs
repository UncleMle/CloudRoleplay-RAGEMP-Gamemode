using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Updatedplayermoneyamountdatatype : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<long>(
                name: "money_amount",
                table: "characters",
                nullable: false,
                oldClrType: typeof(ulong),
                oldType: "bigint unsigned");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<ulong>(
                name: "money_amount",
                table: "characters",
                type: "bigint unsigned",
                nullable: false,
                oldClrType: typeof(long));
        }
    }
}
