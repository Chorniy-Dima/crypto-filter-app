import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Crypto Filter API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

COINGECKO_URL = "https://api.coingecko.com/api/v3/coins/markets"

@app.get("/api/projects")
async def get_projects():
    try:
        async with httpx.AsyncClient() as client:
            params = {
                "vs_currency": "usd",
                "order": "market_cap_desc",
                "per_page": 50,
                "page": 1,
                "sparkline": "false"
            }
            response = await client.get(COINGECKO_URL, params=params, timeout=5.0)
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="CoinGecko API error")
            
            coins = response.json()

        total_fetched = len(coins)
        filtered_projects = []

        mcap_passed = 0
        fdv_passed = 0
        vol_passed = 0

        for coin in coins:
            mcap = coin.get("market_cap") or 0
            fdv = coin.get("fully_diluted_valuation") or 0
            volume = coin.get("total_volume") or 0

            if mcap > 0:
                mcap_passed += 1
            if fdv < 100_000_000 and fdv > 0:
                fdv_passed += 1
            if volume > 50_000:
                vol_passed += 1

            if mcap > 0 and volume > 50000 and (fdv < 100_000_000 or fdv == 0):
                filtered_projects.append({
                    "id": coin.get("id"),
                    "name": coin.get("name"),
                    "symbol": coin.get("symbol", "").upper(),
                    "image": coin.get("image"),
                    "current_price": coin.get("current_price"),
                    "market_cap": mcap,
                    "fdv": fdv if fdv > 0 else None,
                    "volume_24h": volume,
                    "tvl_usd": None
                })

        return {
            "success": True,
            "count": len(filtered_projects),
            "data": filtered_projects,
            "funnel": {
                "total_fetched": total_fetched,
                "mcap_gt_0": mcap_passed,
                "fdv_lt_100m": fdv_passed,
                "volume_gt_50k": vol_passed,
                "final_count": len(filtered_projects)
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))