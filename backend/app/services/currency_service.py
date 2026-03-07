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
    "JPY": Decimal("160.0"),
    "CAD": Decimal("1.45"),
    "AUD": Decimal("1.65"),
    "CNY": Decimal("7.8"),
    "SEK": Decimal("11.5"),
    "NOK": Decimal("11.8"),
    "DKK": Decimal("7.45"),
    "PLN": Decimal("4.3"),
    "CZK": Decimal("24.5"),
    "HUF": Decimal("380.0"),
    "RON": Decimal("4.97"),
    "BGN": Decimal("1.9558"),
    "HRK": Decimal("7.5345"),
    "TRY": Decimal("32.0"),
    "RUB": Decimal("90.0"),
    "BRL": Decimal("5.5"),
    "MXN": Decimal("18.5"),
    "ARS": Decimal("950.0"),
    "ZAR": Decimal("20.0"),
    "INR": Decimal("90.0"),
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
