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

namespace FinanzasVineyard.Pages.OtroRubro
{
    public class EditModel : PageModel
    {
        private readonly FinanzasVineyard.Data.FinanzasVineyardContext _context;

        public EditModel(FinanzasVineyard.Data.FinanzasVineyardContext context)
        {
            _context = context;
        }

        [BindProperty]
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

        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see https://aka.ms/RazorPagesCRUD.
        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            _context.Attach(OtroRubro).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!OtroRubroExists(OtroRubro.Id))
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

        private bool OtroRubroExists(int id)
        {
            return _context.OtrosRubros.Any(e => e.Id == id);
        }
    }
}
