#nullable disable
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using FinanzasVineyard.Models;

namespace FinanzasVineyard.Data
{
    public class FinanzasVineyardContext : DbContext
    {
        public FinanzasVineyardContext (DbContextOptions<FinanzasVineyardContext> options)
            : base(options)
        {
        }

        public DbSet<FinanzasVineyard.Models.Entrada> Entradas { get; set; }
        public DbSet<FinanzasVineyard.Models.Registro> Registros { get; set; }
        public DbSet<FinanzasVineyard.Models.OtroRubro> OtrosRubros { get; set; }
        public DbSet<FinanzasVineyard.Models.Gasto> Gastos { get; set; }
        public DbSet<FinanzasVineyard.Models.Tesoreria> Tesoreria { get; set; }
        public DbSet<FinanzasVineyard.Models.Usuarios> Usuarios { get; set; }
        public DbSet<FinanzasVineyard.Models.RegistroGasto> RegistroGastos { get; set; }
        public DbSet<FinanzasVineyard.Models.Corte> Cortes { get; set; }
        public DbSet<FinanzasVineyard.Models.RegistroCorte> RegistrosCortes { get; set; }
    }
}
