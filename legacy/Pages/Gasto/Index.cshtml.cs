using FinanzasVineyard.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace FinanzasVineyard.Pages.Gasto
{
    public class IndexModel : PageModel
    {
        private readonly FinanzasVineyardContext _context;
        public IndexModel(FinanzasVineyardContext context)
        {
            _context = context;
        }
        public IList<Models.Gasto> Gastos { get; set; } = new List<Models.Gasto>();
        public async Task<IActionResult> OnGetAsync()
        {
            Gastos = await _context.Gastos.ToListAsync();
            Gastos = Gastos.OrderBy(g => g.Fecha).ToList();

            return Page();
        }
    }
}
