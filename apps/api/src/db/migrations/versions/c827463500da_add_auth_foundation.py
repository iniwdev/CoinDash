"""add_auth_foundation

Revision ID: c827463500da
Revises: 8993d328f69b
Create Date: 2026-05-14 14:36:39.968044

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c827463500da'
down_revision: Union[str, None] = '8993d328f69b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # No-op: all tables are created with correct schema in the initial migration (8993d328f69b).
    pass


def downgrade() -> None:
    pass
