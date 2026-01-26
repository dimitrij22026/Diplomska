"""Currency conversion utilities and rates."""
from decimal import Decimal, ROUND_HALF_UP

# Exchange rates relative to EUR (base currency)
# These are approximate rates - in production, you'd use a real API
EXCHANGE_RATES = {
    "EUR": Decimal("1.0"),
    "USD": Decimal("1.08"),
    "MKD": Decimal("61.5"),
    "GBP": Decimal("0.86"),
    "CHF": Decimal("0.95"),
}


def convert_amount(amount: Decimal, from_currency: str, to_currency: str) -> Decimal:
    """Convert an amount from one currency to another."""
    if from_currency == to_currency:
        return amount

    from_currency = from_currency.upper()
    to_currency = to_currency.upper()

    # Get rates (default to EUR if unknown)
    from_rate = EXCHANGE_RATES.get(from_currency, Decimal("1.0"))
    to_rate = EXCHANGE_RATES.get(to_currency, Decimal("1.0"))

    # Convert: amount in from_currency -> EUR -> to_currency
    # First convert to EUR, then to target
    amount_in_eur = amount / from_rate
    amount_in_target = amount_in_eur * to_rate

    # Round to 2 decimal places
    return amount_in_target.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def get_supported_currencies() -> list[str]:
    """Return list of supported currency codes."""
    return list(EXCHANGE_RATES.keys())
