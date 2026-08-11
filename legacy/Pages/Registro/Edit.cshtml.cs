#nullable disable
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using FinanzasVineyard.Data;
using FinanzasVineyard.Models;

namespace FinanzasVineyard.Pages.Registro
{
    public class EditModel : PageModel
    {
        private readonly FinanzasVineyard.Data.FinanzasVineyardContext _context;

        public EditModel(FinanzasVineyard.Data.FinanzasVineyardContext context)
        {
            _context = context;
        }

        [BindProperty]
        public Models.Registro Registro { get; set; }

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            Registro = await _context.Registros.FirstOrDefaultAsync(m => m.Id == id);

            if (Registro == null)
            {
                return NotFound();
            }
            return Page();
        }

        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see https://aka.ms/RazorPagesCRUD.
        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            _context.Attach(Registro).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RegistroExists(Registro.Id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return RedirectToPage("./Index");
        }

        private bool RegistroExists(int id)
        {
            return _context.Registros.Any(e => e.Id == id);
        }
    }
}
