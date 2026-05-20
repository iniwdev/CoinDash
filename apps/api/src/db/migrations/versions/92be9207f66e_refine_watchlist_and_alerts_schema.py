"""refine watchlist and alerts schema

Revision ID: 92be9207f66e
Revises: c827463500da
Create Date: 2026-05-14 15:00:07.506485

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '92be9207f66e'
down_revision: Union[str, None] = 'c827463500da'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # No-op: all tables are created with correct schema in the initial migration (8993d328f69b).
    pass


def downgrade() -> None:
    pass
