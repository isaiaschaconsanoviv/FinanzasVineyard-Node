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

namespace FinanzasVineyard.Pages.OtroRubro
{
    public class CreateModel : PageModel
    {
        private readonly FinanzasVineyard.Data.FinanzasVineyardContext _context;

        public CreateModel(FinanzasVineyard.Data.FinanzasVineyardContext context)
        {
            _context = context;
        }

        [BindProperty]
        public Models.OtroRubro OtroRubro { get; set; }
        public Models.Registro Registro { get; set; }

        public int IdEntrada;

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if(id == null)
            {
                return NotFound();
            }

            Registro = _context.Registros.FirstOrDefault(r => r.Id == id);

            if (Registro == null)
            {
                return BadRequest();
            }

            IdEntrada = Registro.IdEntrada;

            OtroRubro = new Models.OtroRubro();
            OtroRubro.IdRegistro = (int)id;

            return Page();
        }

        // To protect from overposting attacks, see https://aka.ms/RazorPagesCRUD
        public async Task<IActionResult> OnPostAsync(int? id)
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            Registro = _context.Registros.FirstOrDefault(r => r.Id == id);

            IdEntrada = Registro.IdEntrada;

            _context.OtrosRubros.Add(OtroRubro);
            await _context.SaveChangesAsync();

            return RedirectToPage("../Entrada/Registrar/", new { id = Registro.IdEntrada });
        }
    }
}
