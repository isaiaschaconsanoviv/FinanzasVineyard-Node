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

namespace FinanzasVineyard.Pages.Registro
{
    public class IndexModel : PageModel
    {
        private readonly FinanzasVineyard.Data.FinanzasVineyardContext _context;

        public IndexModel(FinanzasVineyard.Data.FinanzasVineyardContext context)
        {
            _context = context;
        }

        public IList<Models.Registro> Registro { get;set; }

        public async Task OnGetAsync()
        {
            Registro = await _context.Registros.ToListAsync();
        }
    }
}
