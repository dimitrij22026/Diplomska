"""admin security user activity fields

Revision ID: 20260320_000005
Revises: 20260320_000004
Create Date: 2026-03-20 15:30:00
"""

from alembic import op
import sqlalchemy as sa


revision = "20260320_000005"
down_revision = "20260320_000004"
branch_labels = None
depends_on = None


def _has_column(inspector, table_name: str, column_name: str) -> bool:
    return any(column["name"] == column_name for column in inspector.get_columns(table_name))


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not _has_column(inspector, "users", "is_banned"):
        op.add_column(
            "users",
            sa.Column("is_banned", sa.Boolean(), nullable=False,
                      server_default=sa.text("0")),
        )

    if not _has_column(inspector, "users", "last_login_at"):
        op.add_column(
            "users",
            sa.Column("last_login_at", sa.DateTime(
                timezone=True), nullable=True),
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if _has_column(inspector, "users", "last_login_at"):
        op.drop_column("users", "last_login_at")

    if _has_column(inspector, "users", "is_banned"):
        op.drop_column("users", "is_banned")
