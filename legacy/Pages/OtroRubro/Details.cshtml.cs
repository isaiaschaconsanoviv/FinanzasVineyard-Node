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

namespace FinanzasVineyard.Pages.OtroRubro
{
    public class DetailsModel : PageModel
    {
        private readonly FinanzasVineyard.Data.FinanzasVineyardContext _context;

        public DetailsModel(FinanzasVineyard.Data.FinanzasVineyardContext context)
        {
            _context = context;
        }

        public Models.OtroRubro OtroRubro { get; set; }

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            OtroRubro = await _context.OtrosRubros.FirstOrDefaultAsync(m => m.Id == id);

            if (OtroRubro == null)
            {
                return NotFound();
            }
            return Page();
        }
    }
}
