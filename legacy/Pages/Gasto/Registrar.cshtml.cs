using FinanzasVineyard.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace FinanzasVineyard.Pages.Gasto
{
    public class RegistrarModel : PageModel
    {
        private readonly FinanzasVineyardContext _context;

        public RegistrarModel(FinanzasVineyardContext context)
        {
            _context = context;
        }

        [BindProperty]
        public Models.Gasto Gasto { get; set; }
        public string Mensaje { get; set; }

        public async Task<IActionResult> OnGetAsync()
        {
            Gasto = new Models.Gasto();
            Gasto.Fecha = DateTime.Now;

            Mensaje = string.Empty;

            return Page();
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if(!ModelState.IsValid) return Page();

            if (GetTotalPorConcepto(Gasto.Cuenta) < Gasto.Importe && GetTotalPorConcepto(Gasto.Cuenta) > 0)
            {
                Mensaje = "El importe capturado es mayor al total en esa cuenta. Por favor verificar.";
                return Page();
            }

            if (GetTotalPorOtrosConcepto(Gasto.Cuenta) < Gasto.Importe && GetTotalPorOtrosConcepto(Gasto.Cuenta) > 0)
            {
                Mensaje = "El importe capturado es mayor al total en esa cuenta. Por favor verificar.";
                return Page();
            }

            _context.Gastos.Add(Gasto);
            await _context.SaveChangesAsync();

            return RedirectToPage("./Index");
        }
        public List<string> GetConceptos()
        {
            return _context.Tesoreria.Where(t => t.Concepto != "Pastor").ToList().Select(t => t.Concepto).Distinct().ToList();
        }
        public List<string> GetOtrosConceptos()
        {
            return _context.OtrosRubros.Select(o => o.Tipo).Distinct().ToList();
        }
        public double GetTotalPorConcepto(string concepto)
        {
            double importe = 0;

            IList<Models.Tesoreria> tesoreria = _context.Tesoreria.ToList()
                                                    .Where(t => t.Concepto == concepto).ToList()
                                                    .Where(t => t.Concepto != "Pastor").ToList();

            IList<Models.Gasto> gastos = _context.Gastos.ToList().Where(g => g.Cuenta == concepto).ToList();

            foreach (var registro in tesoreria)
            {
                importe += registro.Cantidad;
            }

            foreach (var gasto in gastos)
            {
                importe -= gasto.Importe;
            }

            return importe;
        }

        public double GetTotalPorOtrosConcepto(string concepto)
        {
            double importe = 0;

            IList<Models.OtroRubro> otros = _context.OtrosRubros.ToList().Where(o => o.Tipo == concepto).ToList();
            IList<Models.Gasto> gastos = _context.Gastos.ToList().Where(g => g.Cuenta == concepto).ToList();

            foreach (var otro in otros)
            {
                importe += otro.Importe;
            }

            foreach(var gasto in gastos)
            {
                importe -= gasto.Importe;
            }

            return importe;
        }
    }
}
