#nullable disable
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using FinanzasVineyard.Data;
using FinanzasVineyard.Models;
using System.Globalization;

namespace FinanzasVineyard.Pages.Entrada
{
    public class IndexModel : PageModel
    {
        private readonly FinanzasVineyard.Data.FinanzasVineyardContext _context;

        public IndexModel(FinanzasVineyard.Data.FinanzasVineyardContext context)
        {
            _context = context;
        }

        public IList<Models.Entrada> Entrada { get;set; }
        public CultureInfo ci = new CultureInfo("es-ES");

        public async Task OnGetAsync()
        {
            Entrada = await _context.Entradas.ToListAsync();
            Entrada = Entrada.OrderByDescending(e => e.Fecha).ToList();
        }
    }
}
