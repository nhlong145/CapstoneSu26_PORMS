using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PORMS.API.Extensions;
using PORMS.Application.Common;
using PORMS.Application.Common.Interfaces;
using PORMS.Application.DTOs.Ports;
using PORMS.Application.DTOs.Risk;
using PORMS.Application.DTOs.Sop;
using PORMS.Application.DTOs.Weather;
using PORMS.Application.Services.DecisionSupport;
using PORMS.Domain.Entities;
using PORMS.Domain.Enums;

namespace PORMS.API.Controllers;

[ApiController]
[Route("api/ports")]
[Authorize]
public sealed class PortStatusController : ControllerBase
{
    private static readonly TimeSpan WeatherStaleAfter = TimeSpan.FromMinutes(30);
    private readonly IApplicationDbContext _dbContext;
    private readonly IDecisionSupportService _decisionSupportService;

    public PortStatusController(
        IApplicationDbContext dbContext,
        IDecisionSupportService decisionSupportService)
    {
        _dbContext = dbContext;
        _decisionSupportService = decisionSupportService;
    }

    [HttpGet("status")]
    [ProducesResponseType<IReadOnlyList<PortStatusDto>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<PortStatusDto>>> GetAllStatusAsync(
        CancellationToken cancellationToken)
    {
        var portsQuery = _dbContext.Ports
            .AsNoTracking()
            .Where(x => x.IsActive);

        if (!IsAdmin())
        {
            var assignedPortId = GetAssignedPortId();
            if (assignedPortId is null)
            {
                return Forbid();
            }

            portsQuery = portsQuery.Where(x => x.Id == assignedPortId.Value);
        }

        var portIds = await portsQuery
            .OrderBy(x => x.Code)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        var statuses = new List<PortStatusDto>();
        foreach (var portId in portIds)
        {
            statuses.Add(await BuildStatusAsync(portId, cancellationToken));
        }

        return Ok(statuses);
    }

    [HttpGet("{id:guid}/status")]
    [ProducesResponseType<PortStatusDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PortStatusDto>> GetStatusAsync(Guid id, CancellationToken cancellationToken)
    {
        if (!HttpContext.IsAuthorizedForPort(id))
        {
            return Forbid();
        }

        var exists = await _dbContext.Ports.AsNoTracking().AnyAsync(x => x.Id == id, cancellationToken);
        if (!exists)
        {
            return NotFound();
        }

        return Ok(await BuildStatusAsync(id, cancellationToken));
    }

    [HttpGet("{id:guid}/fetch-health")]
    [ProducesResponseType<WeatherFetchHealthDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<WeatherFetchHealthDto>> GetFetchHealthAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        if (!HttpContext.IsAuthorizedForPort(id))
        {
            return Forbid();
        }

        var exists = await _dbContext.Ports.AsNoTracking().AnyAsync(x => x.Id == id, cancellationToken);
        if (!exists)
        {
            return NotFound();
        }

        var lastJob = await _dbContext.WeatherFetchJobs
            .AsNoTracking()
            .Where(x => x.PortId == id)
            .OrderByDescending(x => x.StartedAt)
            .FirstOrDefaultAsync(cancellationToken);

        var lastSuccess = await _dbContext.WeatherFetchJobs
            .AsNoTracking()
            .Where(x => x.PortId == id && x.Status == "SUCCESS")
            .OrderByDescending(x => x.CompletedAt ?? x.StartedAt)
            .FirstOrDefaultAsync(cancellationToken);

        var lastSuccessfulAt = lastSuccess?.CompletedAt ?? lastSuccess?.StartedAt;
        var isStale = lastSuccessfulAt is null ||
            DateTimeOffset.UtcNow - lastSuccessfulAt.Value > WeatherStaleAfter;

        return Ok(new WeatherFetchHealthDto(
            id,
            lastSuccessfulAt,
            lastJob?.StartedAt,
            lastJob?.Status,
            lastJob?.HttpStatusCode,
            lastJob?.ErrorMessage,
            lastSuccess is not null && !isStale,
            isStale));
    }

    [HttpGet("{id:guid}/decision-support")]
    [ProducesResponseType<PortDecisionSupportDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PortDecisionSupportDto>> GetDecisionSupportAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        if (!HttpContext.IsAuthorizedForPort(id))
        {
            return Forbid();
        }

        var result = await _decisionSupportService.GetDecisionSupportAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("{portId:guid}/live-status")]
    [ProducesResponseType<PortLiveStatusDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PortLiveStatusDto>> GetLiveStatusAsync(
        Guid portId,
        [FromQuery] bool includeSimulation = false,
        CancellationToken cancellationToken = default)
    {
        if (!HttpContext.IsAuthorizedForPort(portId))
        {
            return Forbid();
        }

        var result = await _decisionSupportService.GetLiveStatusAsync(
            portId,
            includeSimulation,
            cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    private async Task<PortStatusDto> BuildStatusAsync(Guid portId, CancellationToken cancellationToken)
    {
        var port = await _dbContext.Ports
            .AsNoTracking()
            .FirstAsync(x => x.Id == portId, cancellationToken);

        var latestWeather = await _dbContext.WeatherReadings
            .AsNoTracking()
            .Where(x => x.PortId == portId && !x.IsSimulation)
            .OrderByDescending(x => x.ObservedAt)
            .FirstOrDefaultAsync(cancellationToken);

        var latestRisk = await _dbContext.RiskAssessments
            .AsNoTracking()
            .Where(x => x.PortId == portId && !x.IsSimulation)
            .OrderByDescending(x => x.EvaluatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        var zones = await _dbContext.Zones
            .AsNoTracking()
            .Where(x => x.PortId == portId && x.IsActive)
            .OrderBy(x => x.DisplayOrder)
            .Select(x => new PortStatusZoneDto(
                x.Id,
                x.Name,
                x.ZoneType,
                x.CurrentRiskLevel,
                x.DisplayOrder))
            .ToListAsync(cancellationToken);

        var unreadAlertCount = await _dbContext.Alerts
            .AsNoTracking()
            .CountAsync(x => x.PortId == portId && x.ReadAt == null && !x.IsSimulation, cancellationToken);

        var lastWeatherAt = latestWeather?.ObservedAt;
        var isStale = lastWeatherAt is null ||
            DateTimeOffset.UtcNow - lastWeatherAt.Value > WeatherStaleAfter;

        return new PortStatusDto(
            port.Id,
            port.Code,
            port.Name,
            port.CurrentMode,
            port.CurrentRiskLevel,
            latestWeather is null ? null : ToWeatherDto(latestWeather),
            latestRisk is null ? null : ToRiskDto(latestRisk),
            zones,
            unreadAlertCount,
            lastWeatherAt,
            isStale);
    }

    private async Task<IReadOnlyList<SopRecommendationDto>> BuildRecommendationsAsync(
        Guid portId,
        RiskLevel riskLevel,
        CancellationToken cancellationToken)
    {
        var zones = await _dbContext.Zones
            .AsNoTracking()
            .Where(x => x.PortId == portId && x.IsActive)
            .ToListAsync(cancellationToken);

        var rules = await _dbContext.SopRules
            .AsNoTracking()
            .Where(x => x.IsActive && x.TriggerRiskLevel == riskLevel)
            .OrderBy(x => x.ExecutionOrder)
            .ThenBy(x => x.RuleName)
            .ToListAsync(cancellationToken);

        var recommendations = new List<SopRecommendationDto>();
        foreach (var rule in rules)
        {
            var targets = rule.AppliesToZoneType is null
                ? [null]
                : zones.Where(x => x.ZoneType == rule.AppliesToZoneType).Cast<Zone?>().ToList();

            foreach (var zone in targets)
            {
                recommendations.Add(new SopRecommendationDto(
                    rule.Id,
                    rule.RuleName,
                    zone?.Id,
                    zone?.Name,
                    zone?.ZoneType,
                    rule.TriggerRiskLevel,
                    rule.ActionType,
                    rule.ActionDescription,
                    rule.TargetOperationMode,
                    rule.ExecutionOrder,
                    rule.AlertSeverity,
                    rule.AlertMessage));
            }
        }

        return recommendations;
    }

    private static PortDecision BuildDecision(
        OperationMode currentMode,
        RiskLevel currentRisk,
        bool isStale,
        WeatherReading? latestWeather,
        RiskAssessment? latestRisk,
        IReadOnlyCollection<SopRecommendationDto> recommendations)
    {
        var reasons = new List<string>();
        if (latestWeather is null)
        {
            reasons.Add("No weather reading is available for this port.");
        }
        else
        {
            reasons.Add($"Wind {latestWeather.WindSpeedMs:0.0} m/s, Beaufort {latestWeather.BeaufortNumber}.");
            reasons.Add($"Rainfall {latestWeather.Rainfall1hMm ?? 0:0.0} mm/h.");
            reasons.Add(latestWeather.VisibilityKm.HasValue
                ? $"Visibility {latestWeather.VisibilityKm.Value:0.0} km."
                : "Visibility data is not available.");
        }

        if (latestRisk is not null)
        {
            reasons.Add($"Risk breakdown: wind={latestRisk.WindRiskLevel}, rain={latestRisk.RainRiskLevel}, visibility={latestRisk.VisibilityRiskLevel}.");
        }

        if (recommendations.Count > 0)
        {
            reasons.Add($"{recommendations.Count} active SOP recommendation(s) match the current risk level.");
        }

        if (currentMode == OperationMode.STOP)
        {
            reasons.Add("Current operation mode is STOP, so weather-sensitive operations remain stopped until manual review or override.");
        }
        else if (currentMode == OperationMode.LIMITED)
        {
            reasons.Add("Current operation mode is LIMITED, so operations must follow active restrictions even if some weather factors improve.");
        }

        if (isStale)
        {
            reasons.Add("Weather data is stale, so operators should verify conditions before making an operational decision.");
            return new PortDecision(
                "VERIFY_WEATHER_DATA",
                "Verify latest weather conditions before deciding. Current data is stale or missing.",
                null,
                null,
                reasons);
        }

        if (currentMode == OperationMode.STOP || currentRisk == RiskLevel.CRITICAL)
        {
            return new PortDecision(
                "STOP_OPERATIONS",
                "Stop weather-sensitive port operations. Do not handle containers or accept vessel entry until conditions are reviewed.",
                false,
                false,
                reasons);
        }

        if (currentRisk == RiskLevel.HIGH || currentMode == OperationMode.LIMITED)
        {
            return new PortDecision(
                "RESTRICT_OPERATIONS",
                "Restrict container handling and vessel entry. Follow active SOP recommendations before continuing operations.",
                false,
                false,
                reasons);
        }

        if (currentRisk == RiskLevel.MEDIUM)
        {
            return new PortDecision(
                "OPERATE_WITH_CAUTION",
                "Operations may continue with caution. Monitor wind, rain, and visibility and prepare to apply SOP restrictions.",
                true,
                true,
                reasons);
        }

        return new PortDecision(
            "OPERATE_NORMALLY",
            "Weather-sensitive operations may continue under normal monitoring.",
            true,
            true,
            reasons);
    }

    private static WeatherReadingDto ToWeatherDto(WeatherReading reading)
        => new(
            reading.Id,
            reading.PortId,
            reading.WindSpeedMs,
            reading.BeaufortNumber,
            reading.WindDirectionDeg,
            reading.WindGustMs,
            reading.Rainfall1hMm,
            reading.Rainfall3hMm,
            reading.VisibilityKm,
            reading.TemperatureC,
            reading.HumidityPct,
            reading.PressureHpa,
            reading.OpenWeatherCode,
            reading.OpenWeatherDescription,
            reading.OpenWeatherIcon,
            reading.ObservedAt,
            reading.RecordedAt,
            reading.DataSource,
            reading.IsSimulation);

    private static RiskAssessmentDto ToRiskDto(RiskAssessment assessment)
        => new(
            assessment.Id,
            assessment.PortId,
            assessment.WeatherReadingId,
            assessment.FinalRiskLevel,
            assessment.WindRiskLevel,
            assessment.RainRiskLevel,
            assessment.VisibilityRiskLevel,
            assessment.PreviousRiskLevel,
            assessment.LevelChanged,
            assessment.BeaufortNumber,
            assessment.Rainfall1hMm,
            assessment.VisibilityKm,
            assessment.AssessmentSummary,
            assessment.EvaluatedAt,
            assessment.IsSimulation);

    private bool IsAdmin()
        => string.Equals(
            User.FindFirst(ClaimNames.Role)?.Value,
            nameof(UserRole.ADMIN),
            StringComparison.Ordinal);

    private Guid? GetAssignedPortId()
    {
        var claim = User.FindFirst(ClaimNames.AssignedPortId)?.Value;
        return Guid.TryParse(claim, out var portId) ? portId : null;
    }

    private sealed record PortDecision(
        string Code,
        string Text,
        bool? CanHandleContainers,
        bool? CanAcceptVesselEntry,
        IReadOnlyList<string> Reasons);
}
