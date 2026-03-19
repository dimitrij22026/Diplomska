"""initial schema

Revision ID: 20260319_000001
Revises: 
Create Date: 2026-03-19 12:00:00
"""

from alembic import op
import sqlalchemy as sa


revision = "20260319_000001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("full_name", sa.String(length=120), nullable=True),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("is_email_verified", sa.Boolean(),
                  nullable=False, server_default=sa.text("0")),
        sa.Column("profile_picture", sa.String(length=500), nullable=True),
        sa.Column("currency", sa.String(length=3), nullable=False,
                  server_default=sa.text("'EUR'")),
        sa.Column("monthly_income", sa.Numeric(precision=12, scale=2),
                  nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)

    op.create_table(
        "accounts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=128), nullable=False),
        sa.Column("type", sa.Enum("CASH", "BANK", "BROKER",
                  name="accounttype", native_enum=False, length=32), nullable=False),
        sa.Column("currency", sa.String(length=10), nullable=False),
        sa.Column("balance", sa.Numeric(precision=18, scale=8),
                  nullable=False, server_default=sa.text("0")),
        sa.Column("is_default", sa.Boolean(), nullable=False,
                  server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_accounts_id"), "accounts", ["id"], unique=False)
    op.create_index(op.f("ix_accounts_user_id"),
                    "accounts", ["user_id"], unique=False)

    op.create_table(
        "advice_entries",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("conversation_id", sa.String(length=36), nullable=False),
        sa.Column("prompt", sa.String(length=512), nullable=False),
        sa.Column("response", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_advice_entries_conversation_id"),
                    "advice_entries", ["conversation_id"], unique=False)
    op.create_index(op.f("ix_advice_entries_user_id"),
                    "advice_entries", ["user_id"], unique=False)

    op.create_table(
        "budget_goals",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("category", sa.String(length=64), nullable=False),
        sa.Column("limit_amount", sa.Numeric(
            precision=14, scale=2), nullable=False),
        sa.Column("period", sa.Enum("WEEKLY", "MONTHLY", "YEARLY",
                  name="budgetperiod", native_enum=False, length=16), nullable=True),
        sa.Column("starts_on", sa.Date(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_budget_goals_user_id"),
                    "budget_goals", ["user_id"], unique=False)

    op.create_table(
        "savings_goals",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=128), nullable=False),
        sa.Column("target_amount", sa.Numeric(
            precision=14, scale=2), nullable=False),
        sa.Column("current_amount", sa.Numeric(precision=14, scale=2),
                  nullable=True, server_default=sa.text("0")),
        sa.Column("icon", sa.String(length=16), nullable=False,
                  server_default=sa.text("'🎯'")),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_savings_goals_user_id"),
                    "savings_goals", ["user_id"], unique=False)

    op.create_table(
        "transactions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("account_id", sa.Integer(), nullable=True),
        sa.Column("category", sa.String(length=64), nullable=False),
        sa.Column("amount", sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False,
                  server_default=sa.text("'EUR'")),
        sa.Column("transaction_type", sa.Enum("INCOME", "EXPENSE",
                  name="transactiontype", native_enum=False, length=16), nullable=False),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("is_deleted", sa.Boolean(), nullable=False,
                  server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(
            ["account_id"], ["accounts.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_transactions_account_id"),
                    "transactions", ["account_id"], unique=False)
    op.create_index(op.f("ix_transactions_user_id"),
                    "transactions", ["user_id"], unique=False)

    op.create_table(
        "assets",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("account_id", sa.Integer(), nullable=False),
        sa.Column("symbol", sa.String(length=32), nullable=False),
        sa.Column("asset_type", sa.Enum("STOCK", "CRYPTO", "ETF", "BOND",
                  name="assettype", native_enum=False, length=16), nullable=False),
        sa.Column("quantity", sa.Numeric(precision=18, scale=8),
                  nullable=False, server_default=sa.text("0")),
        sa.Column("average_buy_price", sa.Numeric(precision=18, scale=8),
                  nullable=False, server_default=sa.text("0")),
        sa.Column("currency", sa.String(length=10),
                  nullable=False, server_default=sa.text("'USD'")),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(
            ["account_id"], ["accounts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_assets_account_id"),
                    "assets", ["account_id"], unique=False)
    op.create_index(op.f("ix_assets_id"), "assets", ["id"], unique=False)
    op.create_index(op.f("ix_assets_user_id"),
                    "assets", ["user_id"], unique=False)

    op.create_table(
        "asset_transactions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("asset_id", sa.Integer(), nullable=False),
        sa.Column("transaction_type", sa.Enum(
            "BUY", "SELL", name="assettransactiontype", native_enum=False, length=16), nullable=False),
        sa.Column("quantity", sa.Numeric(
            precision=18, scale=8), nullable=False),
        sa.Column("price_per_unit", sa.Numeric(
            precision=18, scale=8), nullable=False),
        sa.Column("fees", sa.Numeric(precision=14, scale=2),
                  nullable=False, server_default=sa.text("0")),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(
            ["asset_id"], ["assets.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_asset_transactions_asset_id"),
                    "asset_transactions", ["asset_id"], unique=False)
    op.create_index(op.f("ix_asset_transactions_id"),
                    "asset_transactions", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_asset_transactions_id"),
                  table_name="asset_transactions")
    op.drop_index(op.f("ix_asset_transactions_asset_id"),
                  table_name="asset_transactions")
    op.drop_table("asset_transactions")

    op.drop_index(op.f("ix_assets_user_id"), table_name="assets")
    op.drop_index(op.f("ix_assets_id"), table_name="assets")
    op.drop_index(op.f("ix_assets_account_id"), table_name="assets")
    op.drop_table("assets")

    op.drop_index(op.f("ix_transactions_user_id"), table_name="transactions")
    op.drop_index(op.f("ix_transactions_account_id"),
                  table_name="transactions")
    op.drop_table("transactions")

    op.drop_index(op.f("ix_savings_goals_user_id"), table_name="savings_goals")
    op.drop_table("savings_goals")

    op.drop_index(op.f("ix_budget_goals_user_id"), table_name="budget_goals")
    op.drop_table("budget_goals")

    op.drop_index(op.f("ix_advice_entries_user_id"),
                  table_name="advice_entries")
    op.drop_index(op.f("ix_advice_entries_conversation_id"),
                  table_name="advice_entries")
    op.drop_table("advice_entries")

    op.drop_index(op.f("ix_accounts_user_id"), table_name="accounts")
    op.drop_index(op.f("ix_accounts_id"), table_name="accounts")
    op.drop_table("accounts")

    op.drop_index(op.f("ix_users_id"), table_name="users")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
