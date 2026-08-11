using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanzasVineyard.Migrations
{
    public partial class modRegistroGastos : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_RegistroGastos_RegistroId",
                table: "RegistroGastos",
                column: "RegistroId");

            migrationBuilder.AddForeignKey(
                name: "FK_RegistroGastos_Registros_RegistroId",
                table: "RegistroGastos",
                column: "RegistroId",
                principalTable: "Registros",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RegistroGastos_Registros_RegistroId",
                table: "RegistroGastos");

            migrationBuilder.DropIndex(
                name: "IX_RegistroGastos_RegistroId",
                table: "RegistroGastos");
        }
    }
}
