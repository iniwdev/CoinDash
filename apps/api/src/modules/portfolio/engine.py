"""
Portfolio calculation engine — CoinDash

Pure functions for financial computations. No I/O, no side effects.
All inputs are Decimal for exact arithmetic. All outputs are quantized.

Functions:
    recalculate_holding()    — Weighted-average cost basis from buy transactions
    calculate_realized_pnl() — P&L on a sell using weighted average method
    calculate_unrealized_pnl() — Unrealized P&L for a single holding
    calculate_allocation()   — Allocation percentages across holdings
"""

from decimal import Decimal, ROUND_HALF_UP

# Precision constants
PRICE_PRECISION = Decimal("0.00000001")   # 8 decimal places (price/value)
PERCENT_PRECISION = Decimal("0.01")        # 2 decimal places (percentages)
FIAT_PRECISION = Decimal("0.01")           # 2 decimal places (USD display)


def recalculate_holding(
    buy_qty_total: Decimal,
    buy_cost_total: Decimal,
    sell_qty_total: Decimal,
) -> dict:
    """
    Compute the current weighted-average holding from aggregate buy/sell totals.

    Args:
        buy_qty_total:  SUM(quantity) of all BUY transactions for this coin
        buy_cost_total: SUM(quantity * price_per_unit) of all BUY transactions
        sell_qty_total: SUM(quantity) of all SELL transactions for this coin

    Returns:
        {
            "total_quantity": Decimal,   — current held quantity
            "avg_cost_basis": Decimal,   — weighted average buy price
            "total_invested": Decimal,   — total cost of currently held coins
        }
    """
    held_qty = buy_qty_total - sell_qty_total

    if held_qty <= 0:
        return {
            "total_quantity": Decimal("0"),
            "avg_cost_basis": Decimal("0"),
            "total_invested": Decimal("0"),
        }

    # Weighted average cost = total buy cost / total buy quantity
    avg_cost = (
        (buy_cost_total / buy_qty_total).quantize(PRICE_PRECISION, ROUND_HALF_UP)
        if buy_qty_total > 0
        else Decimal("0")
    )

    total_invested = (held_qty * avg_cost).quantize(PRICE_PRECISION, ROUND_HALF_UP)

    return {
        "total_quantity": held_qty,
        "avg_cost_basis": avg_cost,
        "total_invested": total_invested,
    }


def calculate_realized_pnl(
    sell_qty: Decimal,
    sell_price: Decimal,
    avg_cost_basis: Decimal,
) -> Decimal:
    """
    Weighted-average realized P&L for a single sell trade.

    realized_pnl = (sell_price - avg_cost_basis) × sell_qty
    """
    return (
        (sell_price - avg_cost_basis) * sell_qty
    ).quantize(PRICE_PRECISION, ROUND_HALF_UP)


def calculate_unrealized_pnl(
    quantity_held: Decimal,
    avg_cost_basis: Decimal,
    current_price: Decimal,
) -> dict:
    """
    Compute unrealized P&L metrics for a single holding.

    Returns:
        {
            "current_value":      Decimal,
            "cost_basis_total":   Decimal,
            "unrealized_pnl":     Decimal,
            "unrealized_pnl_pct": Decimal,
        }
    """
    current_value = (quantity_held * current_price).quantize(FIAT_PRECISION, ROUND_HALF_UP)
    cost_basis_total = (quantity_held * avg_cost_basis).quantize(FIAT_PRECISION, ROUND_HALF_UP)
    unrealized = current_value - cost_basis_total

    pnl_pct = Decimal("0")
    if cost_basis_total > 0:
        pnl_pct = (
            (unrealized / cost_basis_total) * 100
        ).quantize(PERCENT_PRECISION, ROUND_HALF_UP)

    return {
        "current_value": current_value,
        "cost_basis_total": cost_basis_total,
        "unrealized_pnl": unrealized,
        "unrealized_pnl_pct": pnl_pct,
    }


def calculate_allocation(holdings_with_values: list[dict]) -> list[dict]:
    """
    Given holdings with a 'current_value' key, compute allocation percentages.
    Mutates the input dicts in-place and returns them.
    """
    total_value = sum(h["current_value"] for h in holdings_with_values)

    if total_value <= 0:
        for h in holdings_with_values:
            h["allocation_pct"] = Decimal("0")
        return holdings_with_values

    for h in holdings_with_values:
        h["allocation_pct"] = (
            (h["current_value"] / total_value * 100)
            .quantize(PERCENT_PRECISION, ROUND_HALF_UP)
        )

    return holdings_with_values
