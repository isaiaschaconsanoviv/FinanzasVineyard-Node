using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using FinanzasVineyard.Data;
using FinanzasVineyard.Models;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Antiforgery;
using System.Net.Http.Headers;
using MimeKit.Tnef;

namespace FinanzasVineyard.Pages.Entrada
{
    public class RegistrarV2Model : PageModel
    {
        private readonly FinanzasVineyardContext _context;

        public RegistrarV2Model(FinanzasVineyardContext context)
        {
            _context = context;
        }

        [BindProperty]
        public Models.Entrada entrada { get; set; }

        [BindProperty]
        public IList<Models.Registro> registros { get; set; }
        [BindProperty]
        public IList<Models.RegistroGasto> gastos { get; set; }

        [BindProperty]
        public Models.Registro registro { get; set; }

        [BindProperty]
        [Display(Name = "Notas")]
        public string? entradaNota { get; set; }

        [BindProperty]
        [Display(Name = "TC")]
        public double tipoCambio { get; set; }

        [BindProperty]
        [Display(Name = "Concepto")]
        public string OtroTipo { get; set; }

        [BindProperty]
        [Display(Name = "Importe")]
        public double OtroImporte { get; set; } = 0.0;

        [BindProperty]
        [Display(Name = "Moneda")]
        public string OtroMoneda { get; set; }

        [BindProperty]
        public int OtroIdRegistro { get; set; }

        public bool apoyocelular = false;
        public bool apoyogasolina = false;

        private double totalDiezmos { get; set; }
        private double totalOfrendas { get; set; }
        private double total10pdiezmos { get; set; }
        private double total3pnacional { get; set; }
        private double total10pmisiones { get; set; }
        private double total5peventos { get; set; }
        private double totalfinalpastor { get; set; }
        private double ingreso { get; set; }

        [BindProperty]
        public int IdEntradaRegistro { get; set; }
        [BindProperty]
        public int IdRegistro { get; set; }
        [BindProperty]
        [Display(Name = "Nombre")]
        public string NombreRegistro { get; set; }
        [BindProperty]
        [Display(Name = "Diezmo")]
        public double DiezmoRegistro { get; set; }
        [BindProperty]
        [Display(Name = "Moneda")]
        public string MonedaDiezmoRegistro { get; set; }
        [BindProperty]
        [Display(Name = "Ofrenda")]
        public double OfrendaRegistro { get; set; }
        [BindProperty]
        [Display(Name = "Moneda")]
        public string MonedaOfrendaRegistro { get; set; }
        [BindProperty]
        public int IdOtro { get; set; }
        [BindProperty]
        public int IdRegistroOtro { get; set; }
        [BindProperty]
        [Display(Name = "Concepto")]
        public string ConceptoOtro { get; set; }
        [BindProperty]
        [Display(Name = "Importe")]
        public double ImporteOtro { get; set; }
        [BindProperty]
        [Display(Name = "Moneda")]
        public string MonedaOtro { get; set; }
        [BindProperty]
        public int EliminarOtroId { get; set; }
        [BindProperty]
        public int EliminarRegistroId { get; set; }

        [BindProperty, Display(Name = "Concepto")]
        public string GastoConcepto { get; set; }
        [BindProperty, Display(Name = "Importe (MXN)")]
        public double ImporteGasto { get; set; }
        [BindProperty]
        public int GastoIdEditar { get; set; }
        [BindProperty, Display(Name = "Concepto")]
        public string GastoConceptoEditar { get; set; }
        [BindProperty, Display(Name = "Importe (MXN)")]
        public double ImporteGastoEditar { get; set; }

        [BindProperty]
        public int GastoIdEliminar { get; set; }


        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            entrada = await _context.Entradas.FirstOrDefaultAsync(m => m.Id == id);

            if (entrada == null)
            {
                return NotFound();
            }

            entradaNota = entrada.Notas;
            tipoCambio = entrada.TipoCambio;

            apoyocelular = entrada.Fecha.Date == GetLastWeekdayOfMonth(entrada.Fecha, DayOfWeek.Sunday);
            apoyogasolina = entrada.Fecha.DayOfWeek == DayOfWeek.Sunday;

            var regs = from r in _context.Registros
                       select r;

            regs = regs.Where(r => r.IdEntrada == id);

            var gast = from rc in _context.RegistroGastos
                      select rc;

            gast = gast.Where(rc => rc.Entrada.Id == id);

            var otros = from o in _context.OtrosRubros
                        select o;

            registros = await regs.ToListAsync();
            gastos = await gast.ToListAsync();

            foreach (var registro in registros)
            {
                registro.Otros = await _context.OtrosRubros.Where(o => o.IdRegistro == registro.Id).ToListAsync();
                registro.Otros = registro.Otros.OrderBy(o => o.Tipo).ToList();

                totalDiezmos += registro.MonedaDiezmo == "MXN" ? registro.Diezmo : entrada.TipoCambio * registro.Diezmo;
                totalOfrendas += registro.MonedaOfrenda == "MXN" ? registro.Ofrenda : entrada.TipoCambio * registro.Ofrenda;
            }

            return Page();
        }

        public async Task<IActionResult> OnPostAsync(int? id)
        {
            if (id == null)
            {
                return BadRequest();
            }

            if (string.IsNullOrEmpty(registro.Nombre)) return await OnGetAsync(id);

            registro.IdEntrada = (int)id;

            _context.Add(registro);
            await _context.SaveChangesAsync();

            if (OtroTipo != null)
            {
                Models.OtroRubro otro = new Models.OtroRubro();

                otro.IdRegistro = registro.Id;
                otro.Tipo = OtroTipo;
                otro.Importe = OtroImporte;
                otro.Moneda = OtroMoneda;

                registro.Otros.Add(otro);

                _context.Add(otro);
                await _context.SaveChangesAsync();
            }
            

            return RedirectToPage("./RegistrarV2", new { id = (int)id });
        }

        public async Task<IActionResult> OnPostGuardarNota(int? id) 
        {
            entrada = await _context.Entradas.FirstOrDefaultAsync(m => m.Id == id);

            if(entrada == null) return BadRequest();

            entrada.Notas = entradaNota;

            _context.Update(entrada);
            await _context.SaveChangesAsync();

            return RedirectToPage("./RegistrarV2", new { id = (int)id });
        }

        public async Task<IActionResult> OnPostUpdateTipoCambio(int? id)
        {
            entrada = await _context.Entradas.FirstOrDefaultAsync(m => m.Id == id);

            entrada.TipoCambio = tipoCambio;

            _context.Update(entrada);
            await _context.SaveChangesAsync();

            return RedirectToPage("./RegistrarV2", new { id = (int)id });
        }

        public double GetTotalDiezmos()
        {
            return totalDiezmos;
        }
        public double GetTotalOfrendas()
        {
            return totalOfrendas;
        }

        public string ShowConversionDiezmo(int? regId)
        {
            return $"{registros.FirstOrDefault(r => r.Id == regId)?.Diezmo * entrada.TipoCambio:C2} MXN";
        }
        public string ShowConversionOfrenda(int? regId)
        {
            return $"{registros.FirstOrDefault(r => r.Id == regId)?.Ofrenda * entrada.TipoCambio:C2} MXN";
        }

        public string GetCalculoFinalDiezmo()
        {
            if (totalDiezmos + totalOfrendas > 500)
            {
                total10pdiezmos = totalDiezmos * 0.1;

                double redondeo = total10pdiezmos % 10;

                total10pdiezmos += redondeo > 0 ? 10 - redondeo : 0;

            }

            Models.Tesoreria tesoreria = _context.Tesoreria.Where(b => b.EntradaId == entrada.Id).Where(b => b.Concepto == "Diezmos").FirstOrDefault();

            if(tesoreria != null)
            {
                tesoreria.Cantidad = total10pdiezmos;

                _context.Tesoreria.Update(tesoreria);
                _context.SaveChanges();
            }

            return $"{total10pdiezmos:C2}";
        }

        public string GetCalculoFinalNacional()
        {
            if (totalDiezmos + totalOfrendas > 500)
            {
                total3pnacional = (totalDiezmos - total10pdiezmos + totalOfrendas) * 0.03;

                double redondeo = total3pnacional % 10;

                total3pnacional += redondeo > 0 ? 10 - redondeo : 0;
            }

            Models.Tesoreria tesoreria = _context.Tesoreria.Where(b => b.EntradaId == entrada.Id).Where(b => b.Concepto == "Viña Nacional").FirstOrDefault();

            if (tesoreria != null)
            {
                tesoreria.Cantidad = total10pdiezmos;

                _context.Tesoreria.Update(tesoreria);
                _context.SaveChanges();
            }

            return $"{total3pnacional:C2}";
        }

        public string GetCalculoFinalMisiones()
        {
            if (totalDiezmos + totalOfrendas > 500)
            {
                total10pmisiones = (totalDiezmos - total10pdiezmos - total3pnacional - totalfinalpastor + totalOfrendas) * 0.1;

                double redondeo = total10pmisiones % 10;

                total10pmisiones += redondeo > 0 ? 10 - redondeo : 0;
            }

            Models.Tesoreria tesoreria = _context.Tesoreria.Where(b => b.EntradaId == entrada.Id).Where(b => b.Concepto == "Misiones").FirstOrDefault();

            if (tesoreria != null)
            {
                tesoreria.Cantidad = total10pmisiones;

                _context.Tesoreria.Update(tesoreria);
                _context.SaveChanges();
            }

            return $"{total10pmisiones:C2}";
        }

        public string GetCalculoFinalEventos()
        {
            if (totalDiezmos + totalOfrendas > 500)
            {
                total5peventos = (totalDiezmos - total10pdiezmos - total3pnacional + totalOfrendas - totalfinalpastor - total10pmisiones) * 0.05;

                double redondeo = total5peventos % 10;

                total5peventos += redondeo > 0 ? 10 - redondeo : 0;
            }

            Models.Tesoreria tesoreria = _context.Tesoreria.Where(b => b.EntradaId == entrada.Id).Where(b => b.Concepto == "Eventos").FirstOrDefault();

            if (tesoreria != null)
            {
                tesoreria.Cantidad = total5peventos;

                _context.Tesoreria.Update(tesoreria);
                _context.SaveChanges();
            }

            return $"{total5peventos:C2}";
        }

        public string GetCalculoParcialPastor()
        {
            double parcial = 0;
            if (totalDiezmos + totalOfrendas > 500)
            {
                parcial = ((totalDiezmos - total10pdiezmos - total3pnacional + totalOfrendas) / 2);
                /*parcial = ((totalDiezmos - total10pdiezmos - total3pnacional + totalOfrendas - total10pmisiones - total5peventos) / 2);*/

                double redondeo = parcial % 10;

                parcial += redondeo > 0 ? 10 - redondeo : 0;
            }
            else
            {
                parcial = totalDiezmos + totalOfrendas;
            }

            return $"{parcial:C2}";
        }

        public bool GetDarApoyoGasolina()
        {
            double ingresoparcial = (totalDiezmos - total10pdiezmos - total3pnacional  + totalOfrendas - total10pmisiones - total5peventos) / 2;

            return ingresoparcial > 250;
        }

        public bool GetDarApoyoCelular()
        {
            double ingresoparcial = (totalDiezmos - total10pdiezmos - total3pnacional + totalOfrendas - total10pmisiones - total5peventos) / 2;

            ingresoparcial -= GetDarApoyoGasolina() && apoyocelular ? 250 : 0;

            return ingresoparcial > 250;
        }

        public string GetCalculoFinalPastor()
        {
            if (totalDiezmos + totalOfrendas > 500)
            {
                /*double ingresoparcial = (totalDiezmos - total10pdiezmos - total3pnacional  + totalOfrendas - total10pmisiones - total5peventos) / 2;*/
                double ingresoparcial = (totalDiezmos - total10pdiezmos - total3pnacional  + totalOfrendas) / 2;
                totalfinalpastor = ingresoparcial;

                if (apoyogasolina && GetDarApoyoGasolina())
                {
                    apoyogasolina = ingresoparcial >= 250;
                    totalfinalpastor += ingresoparcial >= 250 ? 250 : 0; //apoyo semanal gasolina 

                    ingresoparcial -= 250;
                }

                if (apoyocelular && GetDarApoyoCelular())
                {
                    apoyocelular = ingresoparcial >= 250;
                    totalfinalpastor += ingresoparcial >= 250 ? 250 : 0; //apoyo mensual para el celular
                }

                double redondeo = totalfinalpastor % 10;

                totalfinalpastor += redondeo > 0 ? 10 - redondeo : 0;
            }
            else
            {
                totalfinalpastor = totalDiezmos + totalOfrendas;
            }

            Models.Tesoreria tesoreria = _context.Tesoreria.Where(b => b.EntradaId == entrada.Id).Where(b => b.Concepto == "Pastor").FirstOrDefault();

            if (tesoreria != null)
            {
                tesoreria.Cantidad = totalfinalpastor;

                _context.Tesoreria.Update(tesoreria);
                _context.SaveChanges();
            }

            return $"{totalfinalpastor:C2}";
        }

        public string GetCalculoFinalIngresoSinGastos()
        {
            ingreso = (totalDiezmos - total10pdiezmos - total3pnacional  + totalOfrendas - total10pmisiones - total5peventos - totalfinalpastor);
            return $"{ingreso:C2}";
        }

        public string GetCalculoFinalIngreso()
        {
            ingreso = (totalDiezmos - total10pdiezmos - total3pnacional  + totalOfrendas - total10pmisiones - total5peventos - totalfinalpastor);

            if (ingreso >= 100 && entrada.Fecha.DayOfWeek == DayOfWeek.Sunday)
            {
                if (_context.RegistroGastos.Where(rg => rg.Entrada.Id == entrada.Id).Where(rg => rg.Concepto == "Aguinaldo Pastor").FirstOrDefault() == null)
                {
                    RegistroGasto aguinaldoPastor = new RegistroGasto
                    {
                        Entrada = entrada,
                        Concepto = "Aguinaldo Pastor",
                        Importe = 100
                    };

                    gastos.Add(aguinaldoPastor);

                    _context.Add(aguinaldoPastor);
                    _context.SaveChangesAsync();
                }
            }

            ingreso -= gastos.Sum(g => g.Importe);

            Models.Tesoreria tesoreria = _context.Tesoreria.Where(b => b.EntradaId == entrada.Id).Where(b => b.Concepto == "Ingresos").FirstOrDefault();

            if (tesoreria != null)
            {
                tesoreria.Cantidad = ingreso;

                _context.Tesoreria.Update(tesoreria);
                _context.SaveChanges();
            }

            return $"{ingreso:C2}";
        }

        public IList<ListadoDeConceptos> GetOtrosPorConcepto()
        {
            IList<ListadoDeConceptos> listadoDeConceptos = new List<ListadoDeConceptos>();
            bool found = false;

            foreach (var registro in registros)
            {
                foreach (var otro in registro.Otros)
                {
                    found = false;

                    foreach (var concepto in listadoDeConceptos)
                    {
                        if (concepto.Concepto == otro.Tipo)
                        {
                            if(otro.Moneda == "MXN")
                            {
                                concepto.ImporteMxn += otro.Importe;
                            }
                            else
                            {
                                concepto.ImporteUsd += otro.Importe;
                            }
                            
                            found = true;
                            break;
                        }
                    }

                    if (!found)
                    {
                        ListadoDeConceptos nuevoConcepto = new ListadoDeConceptos();
                        nuevoConcepto.Concepto = otro.Tipo;
                        
                        if (otro.Moneda == "MXN")
                        {
                            nuevoConcepto.ImporteMxn = otro.Importe;
                        }
                        else
                        {
                            nuevoConcepto.ImporteUsd = otro.Importe;
                        }

                        listadoDeConceptos.Add(nuevoConcepto);
                    }
                }
            }

            listadoDeConceptos = listadoDeConceptos.OrderBy(c => c.Concepto).ToList();

            return listadoDeConceptos;
        }

        private static DateTime GetLastWeekdayOfMonth(DateTime date, DayOfWeek day)
        {
            DateTime lastDayOfMonth = new DateTime(date.Year, date.Month, 1)
                .AddMonths(1).AddDays(-1);
            int wantedDay = (int)day;
            int lastDay = (int)lastDayOfMonth.DayOfWeek;
            return lastDayOfMonth.AddDays(
                lastDay >= wantedDay ? wantedDay - lastDay : wantedDay - lastDay - 7);
        }

        public async Task<IActionResult> OnPostEditarRegistro(int? id)
        {
            entrada = await _context.Entradas.Where(e => e.Id == IdEntradaRegistro).FirstOrDefaultAsync();
            registro = await _context.Registros.Where(r => r.IdEntrada == entrada.Id).Where(r => r.Id == IdRegistro).FirstOrDefaultAsync();
            registro.Otros = await _context.OtrosRubros.Where(o => o.IdRegistro == registro.Id).ToListAsync();

            registro.Nombre = NombreRegistro;
            registro.Diezmo = DiezmoRegistro;
            registro.MonedaDiezmo = MonedaDiezmoRegistro;
            registro.Ofrenda = OfrendaRegistro;
            registro.MonedaOfrenda = MonedaOfrendaRegistro;

            _context.Update(registro);
            _context.SaveChangesAsync();

            return RedirectToPage("./RegistrarV2", new { id = (int)id });
        }

        public async Task<IActionResult> OnPostEditarOtro(int? id)
        {
            entrada = await _context.Entradas.Where(e => e.Id == id).FirstOrDefaultAsync();
            registro = await _context.Registros.Where(r => r.IdEntrada == entrada.Id).Where(r => r.Id == IdRegistroOtro).FirstOrDefaultAsync();
            registro.Otros = await _context.OtrosRubros.Where(o => o.IdRegistro == registro.Id).ToListAsync();

            Models.OtroRubro otrotmp = registro.Otros.Where(o => o.Id == IdOtro).FirstOrDefault();

            otrotmp.IdRegistro = registro.Id;
            otrotmp.Tipo = ConceptoOtro;
            otrotmp.Importe = ImporteOtro;
            otrotmp.Moneda = MonedaOtro;

            _context.Update(otrotmp);
            _context.SaveChangesAsync();

            return RedirectToPage("./RegistrarV2", new { id = (int)id });
        }

        public async Task<IActionResult> OnPostEliminarRegistro(int? id)
        {
            registro = _context.Registros.FirstOrDefault(r => r.Id == EliminarRegistroId);

            foreach(Models.OtroRubro otrotmp in _context.OtrosRubros.Where(o => o.IdRegistro == registro.Id))
            {
                _context.Remove(otrotmp);
            }

            _context.Remove(registro);

            await _context.SaveChangesAsync();

            return RedirectToPage("./RegistrarV2", new { id = (int)id });
        }

        public async Task<IActionResult> OnPostEliminarOtro(int? id)
        {
            Models.OtroRubro otrotmp = _context.OtrosRubros.Where(o => o.Id == EliminarOtroId).FirstOrDefault();

            _context.Remove(otrotmp);
            await _context.SaveChangesAsync();

            return RedirectToPage("./RegistrarV2", new { id = (int)id });
        }

        public async Task<IActionResult> OnPostRegistrarGasto(int? id)
        {
            entrada = await _context.Entradas.Where(e => e.Id == id).FirstOrDefaultAsync();

            RegistroGasto rc = new RegistroGasto
            {
                Entrada = entrada,
                Concepto = GastoConcepto,
                Importe = ImporteGasto
            };

            _context.Add(rc);
            await _context.SaveChangesAsync();

            return RedirectToPage("./RegistrarV2", new { id = (int)id });
        }

        public async Task<IActionResult> OnPostEditarGasto(int? id)
        {
            entrada = await _context.Entradas.Where(e => e.Id == id).FirstOrDefaultAsync();

            RegistroGasto rc = await _context.RegistroGastos.Where(r => r.Id == GastoIdEditar).FirstOrDefaultAsync();

            rc.Concepto = GastoConceptoEditar;
            rc.Importe = ImporteGastoEditar;

            _context.Update(rc);
            await _context.SaveChangesAsync();

            return RedirectToPage("./RegistrarV2", new { id = (int)id });
        }

        public async Task<IActionResult> OnPostEliminarGasto(int? id)
        {
            RegistroGasto rc = await _context.RegistroGastos.Where(r => r.Id == GastoIdEliminar).FirstOrDefaultAsync();

            _context.Remove(rc);
            await _context.SaveChangesAsync();

            return RedirectToPage("./RegistrarV2", new { id = (int)id });
        }
    }
}
