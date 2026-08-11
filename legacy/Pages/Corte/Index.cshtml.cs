using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using FinanzasVineyard.Models;
using FinanzasVineyard.Data;
using Microsoft.EntityFrameworkCore;

namespace FinanzasVineyard.Pages.Corte
{
    public class IndexModel : PageModel
    {
        private readonly FinanzasVineyardContext _context;
        public IndexModel(FinanzasVineyard.Data.FinanzasVineyardContext context)
        {
            _context = context;
        }
        public IList<Models.Corte> Cortes { get; set; }
        public async Task<IActionResult> OnGetAsync()
        {
            Cortes = await _context.Cortes.ToListAsync();

            return Page();
        }
    }
}
