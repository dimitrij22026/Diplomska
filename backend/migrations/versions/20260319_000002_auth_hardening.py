"""auth hardening columns

Revision ID: 20260319_000002
Revises: 20260319_000001
Create Date: 2026-03-19 12:10:00
"""

from alembic import op
import sqlalchemy as sa


revision = "20260319_000002"
down_revision = "20260319_000001"
branch_labels = None
depends_on = None


def _has_column(inspector, table_name: str, column_name: str) -> bool:
    return any(column["name"] == column_name for column in inspector.get_columns(table_name))


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not _has_column(inspector, "users", "failed_login_attempts"):
        op.add_column(
            "users",
            sa.Column("failed_login_attempts", sa.Integer(),
                      nullable=False, server_default=sa.text("0")),
        )

    if not _has_column(inspector, "users", "last_failed_login_at"):
        op.add_column(
            "users",
            sa.Column("last_failed_login_at", sa.DateTime(
                timezone=True), nullable=True),
        )

    if not _has_column(inspector, "users", "locked_until"):
        op.add_column(
            "users",
            sa.Column("locked_until", sa.DateTime(
                timezone=True), nullable=True),
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if _has_column(inspector, "users", "locked_until"):
        op.drop_column("users", "locked_until")

    if _has_column(inspector, "users", "last_failed_login_at"):
        op.drop_column("users", "last_failed_login_at")

    if _has_column(inspector, "users", "failed_login_attempts"):
        op.drop_column("users", "failed_login_attempts")
