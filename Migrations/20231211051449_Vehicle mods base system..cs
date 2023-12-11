using Microsoft.EntityFrameworkCore.Migrations;

namespace CloudRP.Migrations
{
    public partial class Vehiclemodsbasesystem : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_characters_character_clothes_characterClothingclothing_id",
                table: "characters");

            migrationBuilder.DropForeignKey(
                name: "FK_characters_character_models_characterModelcharacter_model_id",
                table: "characters");

            migrationBuilder.DropIndex(
                name: "IX_characters_characterClothingclothing_id",
                table: "characters");

            migrationBuilder.DropIndex(
                name: "IX_characters_characterModelcharacter_model_id",
                table: "characters");

            migrationBuilder.DropColumn(
                name: "characterClothingclothing_id",
                table: "characters");

            migrationBuilder.DropColumn(
                name: "characterModelcharacter_model_id",
                table: "characters");

            migrationBuilder.AlterColumn<string>(
                name: "vehicle_name",
                table: "vehicles",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext CHARACTER SET utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "numberplate",
                table: "vehicles",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext CHARACTER SET utf8mb4");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "vehicle_name",
                table: "vehicles",
                type: "longtext CHARACTER SET utf8mb4",
                nullable: false,
                oldClrType: typeof(string),
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "numberplate",
                table: "vehicles",
                type: "longtext CHARACTER SET utf8mb4",
                nullable: false,
                oldClrType: typeof(string),
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "characterClothingclothing_id",
                table: "characters",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "characterModelcharacter_model_id",
                table: "characters",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_characters_characterClothingclothing_id",
                table: "characters",
                column: "characterClothingclothing_id");

            migrationBuilder.CreateIndex(
                name: "IX_characters_characterModelcharacter_model_id",
                table: "characters",
                column: "characterModelcharacter_model_id");

            migrationBuilder.AddForeignKey(
                name: "FK_characters_character_clothes_characterClothingclothing_id",
                table: "characters",
                column: "characterClothingclothing_id",
                principalTable: "character_clothes",
                principalColumn: "clothing_id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_characters_character_models_characterModelcharacter_model_id",
                table: "characters",
                column: "characterModelcharacter_model_id",
                principalTable: "character_models",
                principalColumn: "character_model_id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
