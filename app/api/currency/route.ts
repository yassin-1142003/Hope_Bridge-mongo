import { NextRequest, NextResponse } from 'next/server';

interface ExchangeRateResponse {
    rates: Record<string, number>;
    base: string;
    date: string;
}

// Cache exchange rates for 1 hour to avoid excessive API calls
let cachedRates: ExchangeRateResponse | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

async function fetchExchangeRates(): Promise<ExchangeRateResponse> {
    // Using exchangerate-api.com (free tier, no API key required)
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
        if (!response.ok) {
            throw new Error('Failed to fetch exchange rates');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        // Fallback to a static set of rates if API fails
        console.error('Failed to fetch exchange rates, using fallback:', error);
        return {
            rates: {
                USD: 1.08,
                GBP: 0.86,
                EUR: 1.0,
                JPY: 160.5,
                CHF: 0.94,
                CAD: 1.47,
                AUD: 1.65,
                CNY: 7.85,
                ILS: 3.95,
                SAR: 4.05,
                AED: 3.97,
            },
            base: 'EUR',
            date: new Date().toISOString().split('T')[0]
        };
    }
}

export async function GET(request: NextRequest) {
    const now = Date.now();

    // Check if we need to fetch new rates
    if (!cachedRates || now - lastFetchTime > CACHE_DURATION) {
        try {
            cachedRates = await fetchExchangeRates();
            lastFetchTime = now;
        } catch (error) {
            if (!cachedRates) {
                // If we have no cached data and fetch fails, return error
                return NextResponse.json(
                    { error: 'Failed to fetch exchange rates' },
                    { status: 500 }
                );
            }
        }
    }

    return NextResponse.json(cachedRates);
}

export async function POST(request: NextRequest) {
    try {
        const { amount, fromCurrency, toCurrency } = await request.json();

        if (!amount || !fromCurrency || !toCurrency) {
            return NextResponse.json(
                { error: 'Missing required parameters: amount, fromCurrency, toCurrency' },
                { status: 400 }
            );
        }

        // Get current exchange rates
        const ratesResponse = await GET(request);
        const ratesData = await ratesResponse.json() as ExchangeRateResponse;

        const { rates } = ratesData;

        // Convert from source currency to EUR (base), then to target currency
        const amountInEUR = fromCurrency === 'EUR' ? amount : amount / rates[fromCurrency];
        const convertedAmount = toCurrency === 'EUR' ? amountInEUR : amountInEUR * rates[toCurrency];

        return NextResponse.json({
            amount: parseFloat(amount),
            fromCurrency,
            toCurrency,
            convertedAmount: parseFloat(convertedAmount.toFixed(2)),
            exchangeRate: fromCurrency === 'EUR' ? rates[toCurrency] : rates[toCurrency] / rates[fromCurrency],
            date: ratesData.date
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
