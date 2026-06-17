using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PORMS.API.Extensions;
using PORMS.Application.Common;
using PORMS.Application.Common.Interfaces;
using PORMS.Application.DTOs.Simulation;
using PORMS.Application.Services.Simulation;

namespace PORMS.API.Controllers;

[ApiController]
[Route("api/simulation")]
[Authorize]
public sealed class SimulationController : ControllerBase
{
    private readonly ISimulationService _simulationService;
    private readonly IApplicationDbContext _dbContext;

    public SimulationController(
        ISimulationService simulationService,
        IApplicationDbContext dbContext)
    {
        _simulationService = simulationService;
        _dbContext = dbContext;
    }

    [HttpPost("start")]
    [Authorize(Policy = "AdminOrCompanyAdmin")]
    [ProducesResponseType<SimulationSessionDto>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public Task<ActionResult<SimulationSessionDto>> StartAsync(
        [FromBody] StartSimulationRequest request,
        CancellationToken cancellationToken)
    {
        if (!HttpContext.IsAuthorizedForPort(request.PortId))
        {
            return Task.FromResult<ActionResult<SimulationSessionDto>>(Forbid());
        }

        var securedRequest = request with { StartedByUserId = GetCurrentUserId() };
        return StartCoreAsync(securedRequest, cancellationToken);
    }

    [HttpPost("/api/ports/{portId:guid}/simulation/trigger-scenario")]
    [Authorize(Policy = "AdminOrCompanyAdmin")]
    [ProducesResponseType<SimulationSessionDto>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public Task<ActionResult<SimulationSessionDto>> TriggerScenarioAsync(
        Guid portId,
        [FromBody] TriggerSimulationScenarioRequest request,
        CancellationToken cancellationToken)
    {
        if (!HttpContext.IsAuthorizedForPort(portId))
        {
            return Task.FromResult<ActionResult<SimulationSessionDto>>(Forbid());
        }

        var startRequest = new StartSimulationRequest(
            portId,
            request.ScenarioName,
            request.WeatherSnapshots,
            request.SpeedMultiplier,
            GetCurrentUserId());
        return StartCoreAsync(startRequest, cancellationToken);
    }

    [HttpPost("stop")]
    [Authorize(Policy = "AdminOrCompanyAdmin")]
    [ProducesResponseType<SimulationSessionDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SimulationSessionDto>> StopAsync(
        [FromBody] StopSimulationRequest? request,
        [FromQuery] Guid? sessionId,
        CancellationToken cancellationToken)
    {
        var id = request?.SessionId ?? sessionId;
        if (id is null || id == Guid.Empty)
        {
            return BadRequest("sessionId is required in body or query string.");
        }

        var portId = await GetSessionPortIdAsync(id.Value, cancellationToken);
        if (portId is null)
        {
            return NotFound();
        }

        if (!HttpContext.IsAuthorizedForPort(portId.Value))
        {
            return Forbid();
        }

        try
        {
            return Ok(await _simulationService.StopAsync(id.Value, cancellationToken));
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpGet("status")]
    [ProducesResponseType<SimulationStatusDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SimulationStatusDto>> GetStatusAsync(
        [FromQuery] Guid sessionId,
        CancellationToken cancellationToken)
    {
        if (sessionId == Guid.Empty)
        {
            return BadRequest("sessionId is required.");
        }

        var portId = await GetSessionPortIdAsync(sessionId, cancellationToken);
        if (portId is null)
        {
            return NotFound();
        }

        if (!HttpContext.IsAuthorizedForPort(portId.Value))
        {
            return Forbid();
        }

        var status = await _simulationService.GetStatusAsync(sessionId, cancellationToken);
        return status is null ? NotFound() : Ok(status);
    }

    [HttpGet("{sessionId:guid}/results")]
    [ProducesResponseType<SimulationResultsDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SimulationResultsDto>> GetResultsAsync(
        Guid sessionId,
        CancellationToken cancellationToken)
    {
        var portId = await GetSessionPortIdAsync(sessionId, cancellationToken);
        if (portId is null)
        {
            return NotFound();
        }

        if (!HttpContext.IsAuthorizedForPort(portId.Value))
        {
            return Forbid();
        }

        var results = await _simulationService.GetResultsAsync(sessionId, cancellationToken);
        return results is null ? NotFound() : Ok(results);
    }

    [HttpGet("results/{sessionId:guid}")]
    [ProducesResponseType<SimulationResultsDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public Task<ActionResult<SimulationResultsDto>> GetResultsAliasAsync(
        Guid sessionId,
        CancellationToken cancellationToken)
        => GetResultsAsync(sessionId, cancellationToken);

    private async Task<ActionResult<SimulationSessionDto>> StartCoreAsync(
        StartSimulationRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var session = await _simulationService.StartAsync(request, cancellationToken);
            return Created($"/api/simulation/status?sessionId={session.Id}", session);
        }
        catch (ArgumentException exception)
        {
            return BadRequest(exception.Message);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException exception)
        {
            return BadRequest(exception.Message);
        }
    }

    private Task<Guid?> GetSessionPortIdAsync(
        Guid sessionId,
        CancellationToken cancellationToken)
        => _dbContext.SimulationSessions
            .AsNoTracking()
            .Where(x => x.Id == sessionId)
            .Select(x => (Guid?)x.PortId)
            .FirstOrDefaultAsync(cancellationToken);

    private Guid GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimNames.UserId)?.Value;
        return Guid.TryParse(claim, out var userId)
            ? userId
            : throw new UnauthorizedAccessException("User id claim missing or invalid.");
    }
}

public sealed record StopSimulationRequest(Guid SessionId);
