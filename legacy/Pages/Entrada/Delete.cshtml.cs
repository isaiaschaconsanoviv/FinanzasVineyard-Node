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

namespace FinanzasVineyard.Pages.Entrada
{
    public class DeleteModel : PageModel
    {
        private readonly FinanzasVineyard.Data.FinanzasVineyardContext _context;

        public DeleteModel(FinanzasVineyard.Data.FinanzasVineyardContext context)
        {
            _context = context;
        }

        [BindProperty]
        public Models.Entrada Entrada { get; set; }

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            Entrada = await _context.Entradas.FirstOrDefaultAsync(m => m.Id == id);

            if (Entrada == null)
            {
                return NotFound();
            }
            return Page();
        }

        public async Task<IActionResult> OnPostAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            Entrada = await _context.Entradas.FindAsync(id);

            List<Models.Registro> Registros = await _context.Registros.Where(r => r.IdEntrada == Entrada.Id).ToListAsync();

            foreach(var registro in Registros)
            {
                List<Models.OtroRubro> Otros = await _context.OtrosRubros.Where(o => o.IdRegistro == registro.Id).ToListAsync();

                foreach(var otro in Otros)
                {
                    _context.OtrosRubros.Remove(otro);
                    await _context.SaveChangesAsync();
                }

                _context.Registros.Remove(registro);
                await _context.SaveChangesAsync();
            }

            if (Entrada != null)
            {
                _context.Entradas.Remove(Entrada);
                await _context.SaveChangesAsync();
            }

            return RedirectToPage("./Index");
        }
    }
}
