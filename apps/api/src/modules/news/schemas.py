from pydantic import BaseModel, ConfigDict


class ArticleOut(BaseModel):
    title: str
    description: str
    source: str
    date: str
    link: str | None = None
    image: str | None = None

    model_config = ConfigDict(from_attributes=True)


class NewsResponse(BaseModel):
    articles: list[ArticleOut]
    message: str | None = None
