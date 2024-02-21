using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Text;

namespace CloudRP.ServerSystems.ApiRoutes
{
    [ApiController]
    public class ApiAuthentication : ControllerBase
    {
        [HttpGet("/test")]
        public IActionResult login(HttpRequest req)
        {
            Console.WriteLine("endpoint triggered.");

            return Ok(req);
        }

    }
}
