using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinanzasVineyard.Migrations
{
    public partial class Corte : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Cortes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Fecha = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Notas = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ElaboradoPor = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cortes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RegistrosCortes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CorteId = table.Column<int>(type: "int", nullable: false),
                    Concepto = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Importe = table.Column<double>(type: "float", nullable: false),
                    Diferencia = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RegistrosCortes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RegistrosCortes_Cortes_CorteId",
                        column: x => x.CorteId,
                        principalTable: "Cortes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosCortes_CorteId",
                table: "RegistrosCortes",
                column: "CorteId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RegistrosCortes");

            migrationBuilder.DropTable(
                name: "Cortes");
        }
    }
}
