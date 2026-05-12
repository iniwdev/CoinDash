"""
Top-level services package.

Cross-cutting application services that are NOT tied to a single module
belong here. Examples:
  - EmailService       — transactional emails (registration, alerts)
  - NotificationService — push / webhook dispatch
  - ExternalAPIClient  — shared httpx client wrapper

Module-specific business logic stays inside the module's own service.py.
"""
