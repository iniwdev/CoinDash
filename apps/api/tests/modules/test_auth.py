import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_signup(client: AsyncClient):
    res = await client.post("/api/v1/auth/signup", json={
        "email": "test@coindash.io",
        "password": "secret123",
    })
    assert res.status_code == 201
    body = res.json()
    assert "token" in body
    assert body["user"]["email"] == "test@coindash.io"
    assert "id" in body["user"]
    assert body["message"] == "User created successfully"


@pytest.mark.asyncio
async def test_signup_duplicate(client: AsyncClient):
    payload = {"email": "dup@coindash.io", "password": "secret123"}
    await client.post("/api/v1/auth/signup", json=payload)
    res = await client.post("/api/v1/auth/signup", json=payload)
    assert res.status_code == 409


@pytest.mark.asyncio
async def test_login(client: AsyncClient):
    await client.post("/api/v1/auth/signup", json={
        "email": "login@coindash.io",
        "password": "mypassword",
    })
    res = await client.post("/api/v1/auth/login", json={
        "email": "login@coindash.io",
        "password": "mypassword",
    })
    assert res.status_code == 200
    body = res.json()
    assert "token" in body
    assert body["message"] == "Login successful"


@pytest.mark.asyncio
async def test_login_invalid_password(client: AsyncClient):
    res = await client.post("/api/v1/auth/login", json={
        "email": "nobody@coindash.io",
        "password": "wrong",
    })
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_get_me(client: AsyncClient):
    signup_res = await client.post("/api/v1/auth/signup", json={
        "email": "me@coindash.io",
        "password": "secret123",
    })
    token = signup_res.json()["token"]

    me_res = await client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    assert me_res.json()["user"]["email"] == "me@coindash.io"


@pytest.mark.asyncio
async def test_health(client: AsyncClient):
    res = await client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"
