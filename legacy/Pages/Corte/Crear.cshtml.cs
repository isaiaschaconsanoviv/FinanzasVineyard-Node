using FinanzasVineyard.Data;
using MailKit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FinanzasVineyard.Pages.Corte
{
    public class CrearModel : PageModel
    {
        private readonly FinanzasVineyardContext _context;
        public CrearModel(FinanzasVineyardContext context)
        {
            _context = context;
        }

        [BindProperty]
        public Models.Corte Corte { get; set; }
        public async Task<IActionResult> OnGetAsync()
        {
            if (Corte == null) 
                Corte = new Models.Corte
                {
                    Fecha = DateTime.Now,
                };

            return Page();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            _context.Cortes.Add(Corte);
            await _context.SaveChangesAsync();

            return RedirectToPage("./Registrar", new { id = Corte.Id });
        }
    }
}
