#nullable disable
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Mvc.Rendering;
using FinanzasVineyard.Data;
using FinanzasVineyard.Models;

namespace FinanzasVineyard.Pages.Entrada
{
    public class CreateModel : PageModel
    {
        private readonly FinanzasVineyard.Data.FinanzasVineyardContext _context;

        public CreateModel(FinanzasVineyard.Data.FinanzasVineyardContext context)
        {
            _context = context;
        }

        [BindProperty]
        public Models.Entrada Entrada { get; set; }

        public IActionResult OnGet()
        {
            Entrada = new Models.Entrada();

            Entrada.Fecha = DateTime.Now;
            Entrada.TipoCambio = 20;

            return Page();
        }

        // To protect from overposting attacks, see https://aka.ms/RazorPagesCRUD
        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            _context.Entradas.Add(Entrada);
            await _context.SaveChangesAsync();

            List<string> conceptos = new List<string>();
            conceptos.Add("Diezmos");
            conceptos.Add("Viña Nacional");
            conceptos.Add("Misiones");
            conceptos.Add("Eventos");
            conceptos.Add("Pastor");
            conceptos.Add("Ingresos");

            foreach(string concepto in conceptos)
            {
                Models.Tesoreria tesoreria = new Models.Tesoreria();
                tesoreria.EntradaId = Entrada.Id;
                tesoreria.Concepto = concepto;
                tesoreria.Cantidad = 0;

                _context.Tesoreria.Add(tesoreria);
                await _context.SaveChangesAsync();
            }
            

            return RedirectToPage("./RegistrarV2", new { id = Entrada.Id} );
        }
    }
}
