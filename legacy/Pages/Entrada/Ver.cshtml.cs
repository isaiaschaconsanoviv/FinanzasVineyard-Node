using FinanzasVineyard.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace FinanzasVineyard.Pages.Entrada
{
    public class VerModel : PageModel
    {
        private readonly FinanzasVineyardContext _context;

        public VerModel(FinanzasVineyardContext context)
        {
            _context = context;
        }
        [BindProperty]
        public Models.Entrada entrada { get; set; }
        [BindProperty]
        public List<Models.Registro> registros { get; set; }
        public bool apoyocelular = false;
        public bool apoyogasolina = false;

        private double totalDiezmos { get; set; }
        private double totalOfrendas { get; set; }
        private double total10pdiezmos { get; set; }
        private double total10pmisiones { get; set; }
        private double total5peventos { get; set; }
        private double totalfinalpastor { get; set; }
        private double ingreso { get; set; }

        public async Task<IActionResult> OnGetAsync(int? id)
        {
            if (id == null) return NotFound();

            entrada = await _context.Entradas.FirstOrDefaultAsync(e => e.Id == id);
            if (entrada == null) return NotFound();

            apoyocelular = entrada.Fecha.Date == GetLastWeekdayOfMonth(entrada.Fecha, DayOfWeek.Sunday);
            apoyogasolina = entrada.Fecha.DayOfWeek == DayOfWeek.Sunday;

            registros = await _context.Registros.Where(r => r.IdEntrada == entrada.Id).ToListAsync();

            foreach (var registro in registros)
            {
                registro.Otros = await _context.OtrosRubros.Where(o => o.IdRegistro == registro.Id).ToListAsync();
                registro.Otros = registro.Otros.OrderBy(o => o.Tipo).ToList();

                totalDiezmos += registro.MonedaDiezmo == "MXN" ? registro.Diezmo : entrada.TipoCambio * registro.Diezmo;
                totalOfrendas += registro.MonedaOfrenda == "MXN" ? registro.Ofrenda : entrada.TipoCambio * registro.Ofrenda;
            }


            return Page();
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

                total10pdiezmos += 10 - redondeo;
            }

            return $"{total10pdiezmos:C2}";
        }

        public string GetCalculoFinalMisiones()
        {
            if (totalDiezmos + totalOfrendas > 500)
            {
                total10pmisiones = (totalDiezmos - total10pdiezmos + totalOfrendas) * 0.1;

                double redondeo = total10pmisiones % 10;

                total10pmisiones += 10 - redondeo;
            }

            return $"{total10pmisiones:C2}";
        }

        public string GetCalculoFinalEventos()
        {
            if (totalDiezmos + totalOfrendas > 500)
            {
                total5peventos = (totalDiezmos - total10pdiezmos + totalOfrendas - total10pmisiones) * 0.05;

                double redondeo = total5peventos % 10;

                total5peventos += 10 - redondeo;
            }

            return $"{total5peventos:C2}";
        }

        public string GetCalculoParcialPastor()
        {
            double parcial = 0;
            if (totalDiezmos + totalOfrendas > 500)
            {
                parcial = ((totalDiezmos - total10pdiezmos + totalOfrendas - total10pmisiones - total5peventos) / 2);

                double redondeo = parcial % 10;

                parcial += 10 - redondeo;
            }
            else
            {
                parcial = totalDiezmos + totalOfrendas;
            }

            return $"{parcial:C2}";
        }

        public bool GetDarApoyoGasolina()
        {
            double ingresoparcial = (totalDiezmos - total10pdiezmos + totalOfrendas - total10pmisiones - total5peventos) / 2;

            return ingresoparcial > 250;
        }

        public bool GetDarApoyoCelular()
        {
            double ingresoparcial = (totalDiezmos - total10pdiezmos + totalOfrendas - total10pmisiones - total5peventos) / 2;

            ingresoparcial -= GetDarApoyoGasolina() && apoyocelular ? 250 : 0;

            return ingresoparcial > 250;
        }

        public string GetCalculoFinalPastor()
        {
            if (totalDiezmos + totalOfrendas > 500)
            {
                double ingresoparcial = (totalDiezmos - total10pdiezmos + totalOfrendas - total10pmisiones - total5peventos) / 2;
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

                totalfinalpastor += 10 - redondeo;
            }
            else
            {
                totalfinalpastor = totalDiezmos + totalOfrendas;
            }

            return $"{totalfinalpastor:C2}";
        }

        public string GetCalculoFinalIngreso()
        {
            ingreso = (totalDiezmos - total10pdiezmos + totalOfrendas - total10pmisiones - total5peventos - totalfinalpastor);

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
                            if (otro.Moneda == "MXN")
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
    }
}
