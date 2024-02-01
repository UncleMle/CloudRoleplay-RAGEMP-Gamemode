using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Addedfactionfaction_ranktables : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "faction_ranks",
                columns: table => new
                {
                    faction_rank_id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    CreatedDate = table.Column<DateTime>(nullable: false),
                    UpdatedDate = table.Column<DateTime>(nullable: false),
                    faction_owner_id = table.Column<int>(nullable: false),
                    rank_salary = table.Column<int>(nullable: false),
                    rank_permissions = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_faction_ranks", x => x.faction_rank_id);
                });

            migrationBuilder.CreateTable(
                name: "factions",
                columns: table => new
                {
                    faction_id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    CreatedDate = table.Column<DateTime>(nullable: false),
                    UpdatedDate = table.Column<DateTime>(nullable: false),
                    faction_name = table.Column<string>(nullable: false),
                    owner_id = table.Column<int>(nullable: false),
                    faction_allowed_vehicles = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_factions", x => x.faction_id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "faction_ranks");

            migrationBuilder.DropTable(
                name: "factions");
        }
    }
}
