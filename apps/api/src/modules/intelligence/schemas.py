from typing import List, Optional
from pydantic import BaseModel

class Insight(BaseModel):
    id: str
    type: str
    title: str
    summary: str
    details: str
    action: str
    color: str
    icon: str

class InsightsResponse(BaseModel):
    insights: List[Insight]

class IntelligenceScores(BaseModel):
    risk_score: int
    risk_label: str
    diversification_index: float
    diversification_label: str

class TopMover(BaseModel):
    symbol: str
    change: str
    price: str

class MarketSnapshot(BaseModel):
    fearGreed: int
    fearGreedLabel: str
    btcDominance: str
    sentiment: str
    topGainer: TopMover
    topLoser: TopMover
    trending: List[str]

class SparklinePoint(BaseModel):
    value: float

class SparklineResponse(BaseModel):
    coin_id: str
    data: List[SparklinePoint]
