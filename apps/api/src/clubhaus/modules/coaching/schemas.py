"""Compatibility exports for coaching API contracts.

New code should import from ``coaching.api.contracts.<feature>``.
"""

from clubhaus.modules.coaching.api.contracts import (
    DashboardCounts,
    DashboardResponse,
    MatchResponse,
    MicrocycleCreate,
    MicrocycleResponse,
    PerformanceImportCreate,
    PerformanceImportResponse,
    PerformanceRowInput,
    PlayerGoalCreate,
    PlayerGoalResponse,
    PlayerIssueCreate,
    PlayerIssueResponse,
    PublicationResponse,
    SessionBlockInput,
    SessionBlockResponse,
    SessionInput,
    SessionResponse,
    SessionUpdate,
    StaffReviewCreate,
    StaffReviewDecision,
    StaffReviewResponse,
)

__all__ = [
    "DashboardCounts",
    "DashboardResponse",
    "MatchResponse",
    "MicrocycleCreate",
    "MicrocycleResponse",
    "PerformanceImportCreate",
    "PerformanceImportResponse",
    "PerformanceRowInput",
    "PlayerGoalCreate",
    "PlayerGoalResponse",
    "PlayerIssueCreate",
    "PlayerIssueResponse",
    "PublicationResponse",
    "SessionBlockInput",
    "SessionBlockResponse",
    "SessionInput",
    "SessionResponse",
    "SessionUpdate",
    "StaffReviewCreate",
    "StaffReviewDecision",
    "StaffReviewResponse",
]
