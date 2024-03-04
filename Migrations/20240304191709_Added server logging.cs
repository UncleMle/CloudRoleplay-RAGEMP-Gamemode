using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Addedserverlogging : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "dealership_price",
                table: "vehicles",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.CreateTable(
                name: "server_logs",
                columns: table => new
                {
                    server_log_id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    CreatedDate = table.Column<DateTime>(nullable: false),
                    UpdatedDate = table.Column<DateTime>(nullable: false),
                    server_log_name = table.Column<string>(nullable: false),
                    server_log_description = table.Column<string>(nullable: true),
                    character_owner_id = table.Column<int>(nullable: false),
                    log_type = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_server_logs", x => x.server_log_id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "server_logs");

            migrationBuilder.AlterColumn<long>(
                name: "dealership_price",
                table: "vehicles",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(int));
        }
    }
}
