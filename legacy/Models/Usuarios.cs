using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;

namespace FinanzasVineyard.Models
{
    public class Usuarios
    {
        public int Id { get; set; }

        [Required, Display(Name = "Usuario")]
        public string Usuario { get; set; }

        [Required, Display(Name = "Contraseña")]
        public string Password { get; set; }
        public byte[] Hash { get; set; }

        [Required, Display(Name = "Rol")]
        public string Rol { get; set; }

        [Required, Display(Name = "Último inicio de sesión")]
        public DateTime LastLogin { get; set; }

        public byte[] GetHash()
        {
            byte[] salt = new byte[128 / 8];
            using (var rngCsp = RandomNumberGenerator.Create())
            {
                rngCsp.GetNonZeroBytes(salt);
            }

            return salt;
        }

        public string HashPassword(string _password, byte[] _salt)
        {
            return Convert.ToBase64String(KeyDerivation.Pbkdf2(
                                                            password: _password,
                                                            salt: _salt,
                                                            prf: KeyDerivationPrf.HMACSHA256,
                                                            iterationCount: 100000,
                                                            numBytesRequested: 256 / 8));
        }
    }
}
