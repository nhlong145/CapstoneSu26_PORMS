using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PORMS.API.Extensions;
using PORMS.Application.Common;
using PORMS.Application.Common.Interfaces;
using PORMS.Application.DTOs.Alerts;
using PORMS.Application.Services.Alert;
using PORMS.Domain.Entities;
using PORMS.Domain.Enums;

namespace PORMS.API.Controllers;

[ApiController]
[Route("api/alerts")]
[Authorize]
public sealed class AlertController : ControllerBase
{
    private const int DefaultPageSize = 20;
    private const int MaxPageSize = 100;

    private readonly IApplicationDbContext _dbContext;
    private readonly IAlertService _alertService;

    public AlertController(IApplicationDbContext dbContext, IAlertService alertService)
    {
        _dbContext = dbContext;
        _alertService = alertService;
    }

    [HttpGet]
    public Task<IActionResult> GetAlertsAsync(
        [FromQuery] Guid? portId,
        [FromQuery] AlertSeverity? severity,
        [FromQuery] bool unreadOnly = false,
        [FromQuery] bool includeSimulation = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = DefaultPageSize,
        CancellationToken cancellationToken = default)
        => GetAlertsForScopeAsync(
            portId,
            severity,
            unreadOnly,
            includeSimulation,
            page,
            pageSize,
            cancellationToken);

    [HttpGet("/api/ports/{portId:guid}/alerts")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public Task<IActionResult> GetPortAlertsAsync(
        Guid portId,
        [FromQuery] AlertSeverity? severity,
        [FromQuery] bool unreadOnly = false,
        [FromQuery] bool includeSimulation = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = DefaultPageSize,
        CancellationToken cancellationToken = default)
        => GetAlertsForScopeAsync(
            portId,
            severity,
            unreadOnly,
            includeSimulation,
            page,
            pageSize,
            cancellationToken);

    [HttpGet("unread-count")]
    public async Task<ActionResult<object>> GetUnreadCountAsync(
        [FromQuery] Guid? portId,
        [FromQuery] bool includeSimulation = false,
        CancellationToken cancellationToken = default)
    {
        if (!TryResolvePortScope(portId, out var scopedPortId))
        {
            return Forbid();
        }

        var query = _dbContext.Alerts
            .AsNoTracking()
            .Where(x => x.ReadAt == null);

        if (scopedPortId.HasValue)
        {
            query = query.Where(x => x.PortId == scopedPortId.Value);
        }

        if (!includeSimulation)
        {
            query = query.Where(x => !x.IsSimulation);
        }

        var count = await query.CountAsync(cancellationToken);
        return Ok(new { unreadCount = count });
    }

    [HttpGet("stats")]
    [ProducesResponseType<AlertStatsDto>(StatusCodes.Status200OK)]
    public async Task<ActionResult<AlertStatsDto>> GetStatsAsync(
        [FromQuery] Guid? portId,
        [FromQuery] DateOnly? date,
        [FromQuery] bool includeSimulation = false,
        CancellationToken cancellationToken = default)
    {
        if (!TryResolvePortScope(portId, out var scopedPortId))
        {
            return Forbid();
        }

        var targetDate = date ?? DateOnly.FromDateTime(DateTime.UtcNow);
        var dayStart = new DateTimeOffset(targetDate.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);
        var dayEnd = dayStart.AddDays(1);

        var todayQuery = _dbContext.Alerts
            .AsNoTracking()
            .Where(x => x.CreatedAt >= dayStart && x.CreatedAt < dayEnd);
        var allQuery = _dbContext.Alerts.AsNoTracking();

        if (scopedPortId.HasValue)
        {
            todayQuery = todayQuery.Where(x => x.PortId == scopedPortId.Value);
            allQuery = allQuery.Where(x => x.PortId == scopedPortId.Value);
        }

        if (!includeSimulation)
        {
            todayQuery = todayQuery.Where(x => !x.IsSimulation);
            allQuery = allQuery.Where(x => !x.IsSimulation);
        }

        var todayAlerts = await todayQuery.ToListAsync(cancellationToken);
        var unread = await allQuery.CountAsync(x => x.ReadAt == null, cancellationToken);
        var readDurations = todayAlerts
            .Where(x => x.ReadAt.HasValue)
            .Select(x => (x.ReadAt!.Value - x.CreatedAt).TotalMinutes)
            .ToList();
        var bySeverity = todayAlerts
            .GroupBy(x => x.Severity)
            .ToDictionary(x => x.Key, x => x.Count());

        return Ok(new AlertStatsDto(
            scopedPortId,
            targetDate,
            todayAlerts.Count,
            unread,
            todayAlerts.Count(x => x.Severity == AlertSeverity.CRITICAL),
            todayAlerts.Count(x => x.ReadAt.HasValue),
            readDurations.Count == 0 ? null : Math.Round(readDurations.Average(), 2),
            bySeverity));
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType<AlertDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AlertDto>> GetAlertAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var alert = await _dbContext.Alerts
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (alert is null)
        {
            return NotFound();
        }

        return HttpContext.IsAuthorizedForPort(alert.PortId)
            ? Ok(ToDto(alert))
            : Forbid();
    }

    [HttpPatch("{alertId:guid}/read")]
    [HttpPut("{alertId:guid}/read")]
    [ProducesResponseType<AlertDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AlertDto>> MarkReadAsync(
        Guid alertId,
        CancellationToken cancellationToken)
    {
        var existing = await _dbContext.Alerts
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == alertId, cancellationToken);
        if (existing is null)
        {
            return NotFound();
        }

        if (!HttpContext.IsAuthorizedForPort(existing.PortId))
        {
            return Forbid();
        }

        var alert = await _alertService.MarkReadAsync(
            alertId,
            GetCurrentUserId(),
            cancellationToken);
        return alert is null ? NotFound() : Ok(ToDto(alert));
    }

    [HttpPost("mark-all-read")]
    public async Task<ActionResult<object>> MarkAllReadAsync(
        [FromQuery] Guid portId,
        CancellationToken cancellationToken)
    {
        if (!HttpContext.IsAuthorizedForPort(portId))
        {
            return Forbid();
        }

        var count = await _alertService.MarkAllReadAsync(
            portId,
            GetCurrentUserId(),
            cancellationToken);
        return Ok(new { markedRead = count });
    }

    private async Task<IActionResult> GetAlertsForScopeAsync(
        Guid? requestedPortId,
        AlertSeverity? severity,
        bool unreadOnly,
        bool includeSimulation,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        if (!TryResolvePortScope(requestedPortId, out var scopedPortId))
        {
            return Forbid();
        }

        page = NormalizePage(page);
        pageSize = NormalizePageSize(pageSize);

        var query = _dbContext.Alerts.AsNoTracking();
        if (scopedPortId.HasValue)
        {
            query = query.Where(x => x.PortId == scopedPortId.Value);
        }

        if (severity.HasValue)
        {
            query = query.Where(x => x.Severity == severity.Value);
        }

        if (unreadOnly)
        {
            query = query.Where(x => x.ReadAt == null);
        }

        if (!includeSimulation)
        {
            query = query.Where(x => !x.IsSimulation);
        }

        var total = await query.CountAsync(cancellationToken);
        var alerts = await query
            .OrderByDescending(x =>
                x.ReadAt == null && x.Severity == AlertSeverity.CRITICAL)
            .ThenBy(x => x.ReadAt != null)
            .ThenByDescending(x => x.Severity)
            .ThenByDescending(x => x.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => ToDto(x))
            .ToListAsync(cancellationToken);

        return Ok(new
        {
            data = alerts,
            pagination = new
            {
                page,
                pageSize,
                total,
                totalPages = GetTotalPages(total, pageSize)
            }
        });
    }

    private bool TryResolvePortScope(Guid? requestedPortId, out Guid? scopedPortId)
    {
        if (IsAdmin())
        {
            scopedPortId = requestedPortId;
            return true;
        }

        var assignedPortId = GetAssignedPortId();
        if (assignedPortId is null ||
            requestedPortId.HasValue && requestedPortId.Value != assignedPortId.Value)
        {
            scopedPortId = null;
            return false;
        }

        scopedPortId = assignedPortId;
        return true;
    }

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

    private Guid GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimNames.UserId)?.Value;
        return Guid.TryParse(claim, out var userId)
            ? userId
            : throw new UnauthorizedAccessException("User id claim missing or invalid.");
    }

    private static AlertDto ToDto(Alert alert)
        => new(
            alert.Id,
            alert.PortId,
            alert.AlertType,
            alert.Severity,
            alert.Title,
            alert.Message,
            alert.Metadata,
            alert.RelatedSopRuleId,
            alert.RelatedAssessmentId,
            alert.CreatedAt,
            alert.ReadAt,
            alert.ReadByUserId,
            alert.IsSimulation);

    private static int NormalizePage(int page) => page < 1 ? 1 : page;

    private static int NormalizePageSize(int pageSize)
        => pageSize < 1 ? DefaultPageSize : Math.Min(pageSize, MaxPageSize);

    private static int GetTotalPages(int total, int pageSize)
        => total == 0 ? 0 : (int)Math.Ceiling(total / (double)pageSize);
}
