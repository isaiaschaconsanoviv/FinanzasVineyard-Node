using FinanzasVineyard.Data;
using FinanzasVineyard.Models;
using FinanzasVineyard.Pages.Tesoreria;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Globalization;

namespace FinanzasVineyard.Pages.Corte
{
    public class RegistrarModel : PageModel
    {
        private readonly FinanzasVineyardContext _context;
        public RegistrarModel(FinanzasVineyardContext context)
        {
            _context = context;
        }

        public Models.Corte Corte { get; set; }
        public IList<Models.RegistroCorte> Registros { get; set; }
        [BindProperty]
        public string RegistroConcepto { get; set; }
        [BindProperty]
        public double RegistroImporte { get; set; }
        public CultureInfo ci = new CultureInfo("es-ES");
        public IList<RegistroDeTesoreria> RegistrosDeTesoreria { get; set; }
        public async Task<IActionResult> OnGetAsync(int? id)
        {
            Corte = await _context.Cortes.Where(c => c.Id == id).FirstOrDefaultAsync();

            if (Corte == null) return BadRequest();

            Registros = await _context.RegistrosCortes.Where(rc => rc.Corte == Corte).ToListAsync();

            if (Registros.Count == 0)
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

                    Registros.Add(new RegistroCorte
                    {
                        Corte = Corte,
                        Concepto = registroTesoreria.Concepto,
                        Importe = registroTesoreria.Cantidad,
                        Diferencia = 0
                    });

                    _context.RegistrosCortes.Add(Registros.Last());
                    await _context.SaveChangesAsync();
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
                    Registros.Add(new RegistroCorte
                    {
                        Corte = Corte,
                        Concepto = registroTesoreria.Concepto,
                        Importe = registroTesoreria.Cantidad,
                        Diferencia = 0
                    });

                    _context.RegistrosCortes.Add(Registros.Last());
                    await _context.SaveChangesAsync();
                }


                RegistrosDeTesoreria = RegistrosDeTesoreria.OrderBy(r => r.Concepto).ToList();
            }

            return Page();
        }

        public async Task<IActionResult> OnPostAsync(int? id)
        {
            /*if (!ModelState.IsValid)
            {
                return RedirectToPage("./Registrar", new { id = id });
            }*/

            Corte = await _context.Cortes.Where(c => c.Id == id).FirstOrDefaultAsync();

            if (Corte == null) return BadRequest();


            return RedirectToPage("./Registrar", new { id = Corte.Id });
        }
    }
}
