using FinanzasVineyard.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;

namespace FinanzasVineyard.Pages.Tesoreria
{
    public class IndexModel : PageModel
    {
        private readonly FinanzasVineyardContext _context;

        public IndexModel(FinanzasVineyardContext context)
        {
            _context = context;
        }

        public List<RegistroDeTesoreria> RegistrosDeTesoreria { get; set; }

        public async Task<IActionResult> OnGetAsync()
        {
            RegistrosDeTesoreria = new List<RegistroDeTesoreria>();

            foreach (var registro in _context.Tesoreria.Where(t => t.Concepto != "Pastor").ToList().Select(t => t.Concepto).Distinct().ToList())
            {
                RegistroDeTesoreria registroTesoreria = new RegistroDeTesoreria();
                registroTesoreria.Concepto = registro;

                double importe = 0;

                IList<Models.Tesoreria> tesoreria = _context.Tesoreria.ToList()
                                                        .Where(t => t.Concepto == registroTesoreria.Concepto).ToList();

                IList<Models.OtroRubro> otros = _context.OtrosRubros.ToList()
                                                    .Where(o => o.Tipo == registroTesoreria.Concepto).ToList();

                IList<Models.Gasto> gastos = _context.Gastos.ToList()
                                                .Where(g => g.Cuenta == registroTesoreria.Concepto).ToList();

                foreach (var ingresos in tesoreria)
                {
                    registroTesoreria.Cantidad += ingresos.Cantidad;
                }

                foreach (var ingresos in otros)
                {
                    registroTesoreria.Cantidad += ingresos.Importe;
                }

                foreach (var gasto in gastos)
                {
                    registroTesoreria.Cantidad -= gasto.Importe;
                }

                registroTesoreria.ClaseCss = registroTesoreria.Cantidad == 0 ? "text-danger" : string.Empty;

                RegistrosDeTesoreria.Add(registroTesoreria);
            }

            foreach (var registro in _context.OtrosRubros.Select(o => o.Tipo).Distinct().ToList())
            {
                RegistroDeTesoreria registroTesoreria = new RegistroDeTesoreria();
                registroTesoreria.Concepto = registro;

                double importe = 0;

                IList<Models.Tesoreria> tesoreria = _context.Tesoreria.ToList()
                                                        .Where(t => t.Concepto == registroTesoreria.Concepto).ToList();

                IList<Models.OtroRubro> otros = _context.OtrosRubros.ToList()
                                                    .Where(o => o.Tipo == registroTesoreria.Concepto).ToList();

                IList<Models.Gasto> gastos = _context.Gastos.ToList()
                                                .Where(g => g.Cuenta == registroTesoreria.Concepto).ToList();

                foreach (var ingresos in tesoreria)
                {
                    registroTesoreria.Cantidad += ingresos.Cantidad;
                }

                foreach (var ingresos in otros)
                {
                    registroTesoreria.Cantidad += ingresos.Importe;
                }

                foreach (var gasto in gastos)
                {
                    registroTesoreria.Cantidad -= gasto.Importe;
                }

                RegistrosDeTesoreria.Add(registroTesoreria);
            }


            RegistrosDeTesoreria = RegistrosDeTesoreria.OrderBy(r => r.Concepto).ToList();

            return Page();
        }
    }

    public class RegistroDeTesoreria
    {
        public string Concepto { get; set; } = string.Empty;

        [Display (Name = "En tesorería")]
        public double Cantidad { get; set; } = 0;
        public string ClaseCss { get; set; } = string.Empty;
    }
}
